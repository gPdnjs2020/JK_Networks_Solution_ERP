from flask import Flask, request, jsonify
import sqlite3
from flask_cors import CORS

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
        cur.execute("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, price INTEGER, stock INTEGER DEFAULT 0)")
        cur.execute("CREATE TABLE IF NOT EXISTS partners (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, balance INTEGER DEFAULT 0)")
        cur.execute("CREATE TABLE IF NOT EXISTS vouchers (id INTEGER PRIMARY KEY AUTOINCREMENT, partner TEXT, product TEXT, qty INTEGER, supply INTEGER, vat INTEGER, total INTEGER, date TEXT)")
        con.commit()

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
        con.execute("INSERT INTO products (name, price, stock) VALUES (?, ?, 0)", 
                    (data["name"], data["price"]))
        con.commit()
    return jsonify({"message": "success"})

# --- 거래처 API (이 부분이 빠져있었습니다!) ---
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

# --- 입출고 & 전표 API ---
@app.route("/transaction", methods=["POST"])
def transaction():
    data = request.json
    try:
        with get_db() as con:
            cur = con.cursor()
            p_id = int(data["product_id"])
            pa_id = int(data["partner_id"])
            qty = int(data["qty"])
            t_type = data["type"]

            product = cur.execute("SELECT name, price, stock FROM products WHERE id=?", (p_id,)).fetchone()
            partner = cur.execute("SELECT name, balance FROM partners WHERE id=?", (pa_id,)).fetchone()
            
            if not product or not partner:
                return jsonify({"error": "상품 또는 거래처 정보 없음"}), 400

            total = product['price'] * qty
            supply = int(total / 1.1)
            vat = total - supply
            
            new_stock = product['stock'] + qty if t_type == "IN" else product['stock'] - qty
            new_balance = partner['balance'] + total if t_type == "OUT" else partner['balance'] - total

            cur.execute("UPDATE products SET stock=? WHERE id=?", (new_stock, p_id))
            cur.execute("UPDATE partners SET balance=? WHERE id=?", (new_balance, pa_id))
            cur.execute("""
                INSERT INTO vouchers(partner, product, qty, supply, vat, total, date)
                VALUES (?, ?, ?, ?, ?, ?, date('now'))
            """, (partner['name'], product['name'], qty, supply, vat, total))
            con.commit()
        return jsonify({"message": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/vouchers", methods=["GET"])
def get_vouchers():
    with get_db() as con:
        rows = con.execute("SELECT * FROM vouchers ORDER BY id DESC").fetchall()
        return jsonify([dict(row) for row in rows])

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000, host='0.0.0.0')