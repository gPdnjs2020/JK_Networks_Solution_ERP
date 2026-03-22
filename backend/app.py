from flask import Flask, request, jsonify
import sqlite3
import os
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

DB = "erp.db"

def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as con:
        cur = con.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password TEXT,
                name TEXT
            )
        """)
        cur.execute("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, price INTEGER, stock INTEGER DEFAULT 0)")
        cur.execute("CREATE TABLE IF NOT EXISTS partners (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, balance INTEGER DEFAULT 0)")
        cur.execute("CREATE TABLE IF NOT EXISTS vouchers (id INTEGER PRIMARY KEY AUTOINCREMENT, partner TEXT, product TEXT, qty INTEGER, supply INTEGER, vat INTEGER, total INTEGER, date TEXT, type TEXT)")
        con.commit()

# --- 인증 API ---
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    hashed_pw = generate_password_hash(data["password"])
    try:
        with get_db() as con:
            con.execute("INSERT INTO users (username, password, name) VALUES (?, ?, ?)",
                        (data["username"], hashed_pw, data["name"]))
            con.commit()
        return jsonify({"message": "success"})
    except Exception as e:
        return jsonify({"error": "이미 존재하는 아이디입니다."}), 400

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    with get_db() as con:
        user = con.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
    if user and check_password_hash(user["password"], password):
        return jsonify({"username": user["username"], "name": user["name"]})
    return jsonify({"error": "로그인 실패"}), 401

# --- 상품 API ---
@app.route("/products", methods=["GET"])
def get_products():
    with get_db() as con:
        rows = con.execute("SELECT * FROM products").fetchall()
        return jsonify([dict(row) for row in rows])

@app.route("/products", methods=["POST"])
def add_product():
    data = request.json
    with get_db() as con:
        con.execute("INSERT INTO products (name, price, stock) VALUES (?, ?, 0)", (data["name"], data["price"]))
        con.commit()
    return jsonify({"message": "success"})

@app.route("/products/<int:id>", methods=["DELETE"])
def delete_product(id):
    with get_db() as con:
        con.execute("DELETE FROM products WHERE id = ?", (id,))
        con.commit()
    return jsonify({"message": "success"})

@app.route("/products/<int:id>/stock", methods=["PATCH"])
def update_stock(id):
    data = request.json
    with get_db() as con:
        con.execute("UPDATE products SET stock = ? WHERE id = ?", (data.get("stock"), id))
        con.commit()
    return jsonify({"message": "success"})

# --- 거래처 API ---
@app.route("/partners", methods=["GET"])
def get_partners():
    with get_db() as con:
        rows = con.execute("SELECT * FROM partners").fetchall()
        return jsonify([dict(row) for row in rows])

@app.route("/partners", methods=["POST"])
def add_partner():
    data = request.json
    with get_db() as con:
        con.execute("INSERT INTO partners (name, balance) VALUES (?, 0)", (data["name"],))
        con.commit()
    return jsonify({"message": "success"})

@app.route("/partners/<int:id>", methods=["DELETE"])
def delete_partner(id):
    with get_db() as con:
        con.execute("DELETE FROM partners WHERE id = ?", (id,))
        con.commit()
    return jsonify({"message": "success"})

@app.route("/partners/<int:id>", methods=["PATCH"])
def update_partner(id):
    data = request.json
    with get_db() as con:
        con.execute("UPDATE partners SET name = ?, balance = ? WHERE id = ?", (data.get("name"), data.get("balance"), id))
        con.commit()
    return jsonify({"message": "success"})

# --- 전표 & 입출고 API (핵심 수정) ---
@app.route("/transaction", methods=["POST"])
def transaction():
    data = request.json
    try:
        with get_db() as con:
            cur = con.cursor()
            p_id, pa_id, qty, t_type = int(data["product_id"]), int(data["partner_id"]), int(data["qty"]), data["type"]
            product = cur.execute("SELECT name, price, stock FROM products WHERE id=?", (p_id,)).fetchone()
            partner = cur.execute("SELECT name, balance FROM partners WHERE id=?", (pa_id,)).fetchone()
            
            total = product['price'] * qty
            supply = int(total / 1.1)
            vat = total - supply
            
            # 재고 및 잔액 계산
            new_stock = product['stock'] + (qty if t_type == "IN" else -qty)
            new_balance = partner['balance'] + (total if t_type == "OUT" else -total)

            cur.execute("UPDATE products SET stock=? WHERE id=?", (new_stock, p_id))
            cur.execute("UPDATE partners SET balance=? WHERE id=?", (new_balance, pa_id))
            cur.execute("""
                INSERT INTO vouchers(partner, product, qty, supply, vat, total, date, type)
                VALUES (?, ?, ?, ?, ?, ?, date('now'), ?)
            """, (partner['name'], product['name'], qty, supply, vat, total, t_type))
            con.commit()
        return jsonify({"message": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/vouchers", methods=["GET"])
def get_vouchers():
    with get_db() as con:
        rows = con.execute("SELECT * FROM vouchers ORDER BY id DESC").fetchall()
        return jsonify([dict(row) for row in rows])

# --- 전표 삭제 API (데이터 복구 로직 추가) ---
@app.route("/vouchers/<int:id>", methods=["DELETE"])
def delete_voucher(id):
    try:
        with get_db() as con:
            cur = con.cursor()
            v = cur.execute("SELECT * FROM vouchers WHERE id=?", (id,)).fetchone()
            if not v: return jsonify({"error": "전표 없음"}), 404
            
            # 전표 삭제 전, 수량과 잔액을 반대로 되돌림
            # 매출(OUT) 전표 삭제 시 -> 재고 증가(+), 거래처 잔액 감소(-)
            # 매입(IN) 전표 삭제 시 -> 재고 감소(-), 거래처 잔액 증가(+)
            stock_adj = v['qty'] if v['type'] == "OUT" else -v['qty']
            balance_adj = -v['total'] if v['type'] == "OUT" else v['total']
            
            cur.execute("UPDATE products SET stock = stock + ? WHERE name = ?", (stock_adj, v['product']))
            cur.execute("UPDATE partners SET balance = balance + ? WHERE name = ?", (balance_adj, v['partner']))
            cur.execute("DELETE FROM vouchers WHERE id = ?", (id,))
            con.commit()
        return jsonify({"message": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, port=port, host='0.0.0.0')