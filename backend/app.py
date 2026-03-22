from flask import Flask, request, jsonify
import sqlite3
from flask_cors import CORS

app = Flask(__name__)
# 리액트(3000번)에서 오는 요청을 허용합니다.
CORS(app, resources={r"/*": {"origins": "*"}})

DB = "erp.db"

def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row # 결과를 딕셔너리처럼 다룰 수 있게 설정
    return conn

# 서버 시작 시 DB 초기화 자동 실행
def init_db():
    with get_db() as con:
        cur = con.cursor()
        cur.execute("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, price INTEGER, stock INTEGER DEFAULT 0)")
        cur.execute("CREATE TABLE IF NOT EXISTS partners (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, balance INTEGER DEFAULT 0)")
        cur.execute("CREATE TABLE IF NOT EXISTS vouchers (id INTEGER PRIMARY KEY AUTOINCREMENT, partner TEXT, product TEXT, qty INTEGER, supply INTEGER, vat INTEGER, total INTEGER, date TEXT)")
        con.commit()

@app.route("/products", methods=["GET"])
def get_products():
    con = get_db()
    rows = con.execute("SELECT * FROM products").fetchall()
    # row_factory 덕분에 훨씬 깔끔하게 변환 가능합니다.
    return jsonify([dict(row) for row in rows])

@app.route("/transaction", methods=["POST"])
def transaction():
    data = request.json
    try:
        with get_db() as con:
            cur = con.cursor()
            
            # 1. 데이터 가져오기 (데이터 타입 변환 안전하게)
            p_id = int(data["product_id"])
            pa_id = int(data["partner_id"])
            qty = int(data["qty"])
            t_type = data["type"]

            # 2. 조회 (값이 없을 경우 대비)
            product = cur.execute("SELECT name, price, stock FROM products WHERE id=?", (p_id,)).fetchone()
            partner = cur.execute("SELECT name, balance FROM partners WHERE id=?", (pa_id,)).fetchone()
            
            if not product or not partner:
                return jsonify({"error": "상품 또는 거래처를 찾을 수 없습니다."}), 400

            total = product['price'] * qty
            supply = int(total / 1.1)
            vat = total - supply
            
            # 3. 재고 및 잔액 계산
            new_stock = product['stock'] + qty if t_type == "IN" else product['stock'] - qty
            new_balance = partner['balance'] + total if t_type == "OUT" else partner['balance'] - total

            # 4. 업데이트 수행 (트랜잭션)
            cur.execute("UPDATE products SET stock=? WHERE id=?", (new_stock, p_id))
            cur.execute("UPDATE partners SET balance=? WHERE id=?", (new_balance, pa_id))
            
            # 5. 전표 기록
            cur.execute("""
                INSERT INTO vouchers(partner, product, qty, supply, vat, total, date)
                VALUES (?, ?, ?, ?, ?, ?, date('now'))
            """, (partner['name'], product['name'], qty, supply, vat, total))
            
            con.commit()
        return jsonify({"message": "success", "stock": new_stock})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    init_db() # 서버 켤 때 DB 체크
    # host='0.0.0.0'을 붙여야 외부(리액트) 접속이 원활합니다.
    app.run(debug=True, port=5000, host='0.0.0.0')