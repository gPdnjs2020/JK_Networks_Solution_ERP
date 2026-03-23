from flask import Flask, request, jsonify
import sqlite3
import os
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
# 모든 도메인에서의 요청을 허용 (CORS)
CORS(app, resources={r"/*": {"origins": "*"}})

DB = "erp.db"

def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as con:
        cur = con.cursor()
        # 1. 유저 테이블
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password TEXT,
                name TEXT
            )
        """)
        # 2. 상품 테이블
        cur.execute("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, price INTEGER, stock INTEGER DEFAULT 0)")
        # 3. 거래처 테이블
        cur.execute("CREATE TABLE IF NOT EXISTS partners (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, balance INTEGER DEFAULT 0)")
        # 4. 전표 테이블 (type 컬럼 포함)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS vouchers (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                partner TEXT, 
                product TEXT, 
                qty INTEGER, 
                supply INTEGER, 
                vat INTEGER, 
                total INTEGER, 
                date TEXT, 
                type TEXT
            )
        """)
        
        # [중요] 기존 DB에 type 컬럼이 없는 경우를 대비해 자동 추가
        try:
            cur.execute("ALTER TABLE vouchers ADD COLUMN type TEXT")
        except:
            pass # 이미 컬럼이 있으면 에러가 나므로 무시함
            
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
            t_type = data["type"] # "IN"(매입) 또는 "OUT"(매출)

            product = cur.execute("SELECT name, price, stock FROM products WHERE id=%s", (p_id,)).fetchone()
            partner = cur.execute("SELECT name, balance FROM partners WHERE id=%s", (pa_id,)).fetchone()
            
            # [수정된 계산 로직]
            # 보통 단가(price)를 공급가라고 가정할 때:
            supply = product['price'] * qty
            vat = int(supply * 0.1)  # 부가세 10%
            total = supply + vat     # 총 합계 금액

            # 재고 및 미수금(잔액) 업데이트
            # 매출(OUT)일 때: 재고 감소(-), 거래처 잔액 증가(+) -> 나중에 받을 돈
            # 매입(IN)일 때: 재고 증가(+), 거래처 잔액 감소(-) -> 나중에 줄 돈
            new_stock = product['stock'] + (qty if t_type == "IN" else -qty)
            new_balance = partner['balance'] + (total if t_type == "OUT" else -total)

            cur.execute("UPDATE products SET stock=%s WHERE id=%s", (new_stock, p_id))
            cur.execute("UPDATE partners SET balance=%s WHERE id=%s", (new_balance, pa_id))
            
            # 전표 테이블에 'type' 저장 확인
            cur.execute("""
                INSERT INTO vouchers(partner, product, qty, supply, vat, total, date, type)
                VALUES (%s, %s, %s, %s, %s, %s, TO_CHAR(NOW(), 'YYYY-MM-DD'), %s)
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

# --- 전표 삭제 API (데이터 복원 로직) ---
@app.route("/vouchers/<int:id>", methods=["DELETE"])
def delete_voucher(id):
    try:
        with get_db() as con:
            cur = con.cursor()
            # 1. 삭제할 전표 정보 먼저 가져오기
            v = cur.execute("SELECT * FROM vouchers WHERE id=?", (id,)).fetchone()
            if not v:
                return jsonify({"error": "전표를 찾을 수 없습니다."}), 404
            
            # 2. 역계산 (삭제하려는 전표의 반대 작업을 수행)
            # 매출(OUT) 전표 삭제 -> 재고 증가(+), 잔액 감소(-)
            # 매입(IN) 전표 삭제 -> 재고 감소(-), 잔액 증가(+)
            qty_change = v['qty'] if v['type'] == 'OUT' else -v['qty']
            balance_change = -v['total'] if v['type'] == 'OUT' else v['total']
            
            # 3. 상품 재고 및 거래처 잔액 복원 (이름 기준)
            cur.execute("UPDATE products SET stock = stock + ? WHERE name = ?", (qty_change, v['product']))
            cur.execute("UPDATE partners SET balance = balance + ? WHERE name = ?", (balance_change, v['partner']))
            
            # 4. 전표 삭제
            cur.execute("DELETE FROM vouchers WHERE id = ?", (id,))
            con.commit()
        return jsonify({"message": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, port=port, host='0.0.0.0')