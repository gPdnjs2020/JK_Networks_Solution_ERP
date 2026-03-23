from flask import Flask, request, jsonify
import sqlite3
import os
import datetime
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# [수정] Render Disk 경로 설정 (유실 방지)
DISK_PATH = "/etc/data"
if os.path.exists(DISK_PATH):
    DB = os.path.join(DISK_PATH, "erp.db")
else:
    DB = "erp.db"

def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    db_dir = os.path.dirname(DB)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir)

    with get_db() as con:
        cur = con.cursor()
        
        # ⚠️ [위험] 기존 테이블 강제 삭제 (데이터 초기화)
        cur.execute("DROP TABLE IF EXISTS vouchers")
        cur.execute("DROP TABLE IF EXISTS products")
        cur.execute("DROP TABLE IF EXISTS partners")
        cur.execute("DROP TABLE IF EXISTS accounts")
        cur.execute("DROP TABLE IF EXISTS users")

        # 1. 유저 테이블
        cur.execute("CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, name TEXT)")
        
        # 2. 상품 테이블 (원가, 규격 등 확장 대비)
        cur.execute("CREATE TABLE products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, price INTEGER, stock INTEGER DEFAULT 0)")
        
        # 3. 거래처 테이블
        cur.execute("CREATE TABLE partners (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, balance INTEGER DEFAULT 0)")
        
        # 4. 계정과목 테이블 (손익계산서용)
        cur.execute("CREATE TABLE accounts (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, type TEXT)")
        
        # 5. 전표 테이블 (기획안의 모든 기능 수용 버전)
        cur.execute("""
            CREATE TABLE vouchers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                v_num TEXT UNIQUE,
                v_type TEXT,
                partner TEXT,
                product TEXT,
                qty INTEGER DEFAULT 0,
                supply INTEGER DEFAULT 0,
                vat INTEGER DEFAULT 0,
                total INTEGER DEFAULT 0,
                date TEXT,
                account_name TEXT,
                type TEXT
            )
        """)
        
        # 초기 계정과목 자동 삽입
        accounts = [('매출', '수익'), ('상품매입', '비용'), ('임차료', '비용'), ('급여', '비용')]
        cur.executemany("INSERT INTO accounts (name, type) VALUES (?, ?)", accounts)

        con.commit()
    print("✅ 모든 데이터가 초기화되었습니다. 새 출발 준비 완료!")

# --- 전표번호 자동 생성 함수 (예: V20240522-001) ---
def generate_v_num(v_type_prefix):
    today = datetime.datetime.now().strftime("%Y%m%d")
    with get_db() as con:
        row = con.execute("SELECT COUNT(*) as cnt FROM vouchers WHERE date = date('now')").fetchone()
        count = row['cnt'] + 1
        return f"{v_type_prefix}-{today}-{count:03d}"

# --- 기초정보: 계정과목 API ---
@app.route("/accounts", methods=["GET"])
def get_accounts():
    with get_db() as con:
        rows = con.execute("SELECT * FROM accounts").fetchall()
        return jsonify([dict(row) for row in rows])

# --- 인증 API ---
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    hashed_pw = generate_password_hash(data["password"])
    try:
        with get_db() as con:
            con.execute("INSERT INTO users (username, password, name) VALUES (?, ?, ?)", (data["username"], hashed_pw, data["name"]))
            con.commit()
        return jsonify({"message": "success"})
    except:
        return jsonify({"error": "이미 존재하는 아이디입니다."}), 400

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    with get_db() as con:
        user = con.execute("SELECT * FROM users WHERE username = ?", (data.get("username"),)).fetchone()
    if user and check_password_hash(user["password"], data.get("password")):
        return jsonify({"username": user["username"], "name": user["name"]})
    return jsonify({"error": "로그인 실패"}), 401

# --- 상품/거래처 API (기존 유지 및 확장) ---
@app.route("/products", methods=["GET", "POST"])
def handle_products():
    if request.method == "POST":
        data = request.json
        with get_db() as con:
            con.execute("INSERT INTO products (name, price, stock) VALUES (?, ?, ?)", (data["name"], data["price"], data.get("stock", 0)))
            con.commit()
        return jsonify({"message": "success"})
    with get_db() as con:
        rows = con.execute("SELECT * FROM products").fetchall()
        return jsonify([dict(row) for row in rows])

@app.route("/partners", methods=["GET", "POST"])
def handle_partners():
    if request.method == "POST":
        data = request.json
        with get_db() as con:
            con.execute("INSERT INTO partners (name, balance) VALUES (?, 0)", (data["name"],))
            con.commit()
        return jsonify({"message": "success"})
    with get_db() as con:
        rows = con.execute("SELECT * FROM partners").fetchall()
        return jsonify([dict(row) for row in rows])

# --- 핵심: 재고/판매/구매/재무 통합 트랜잭션 ---
@app.route("/transaction", methods=["POST"])
def transaction():
    data = request.json
    try:
        with get_db() as con:
            cur = con.cursor()
            p_id = data.get("product_id")
            pa_id = data.get("partner_id")
            qty = int(data.get("qty", 0))
            t_type = data["type"] # '판매'(매출), '구매'(매입), '견적', '발주'
            
            # 1. 정보 가져오기
            product = cur.execute("SELECT * FROM products WHERE id=?", (p_id,)).fetchone()
            partner = cur.execute("SELECT * FROM partners WHERE id=?", (pa_id,)).fetchone()
            
            # 2. 금액 계산
            supply = product['price'] * qty
            vat = int(supply * 0.1)
            total = supply + vat
            
            # 3. 전표번호 생성
            v_prefix = "S" if t_type == "판매" else "P" if t_type == "구매" else "Q"
            v_num = generate_v_num(v_prefix)

            # 4. 재고 및 잔액 업데이트 (견적/발주는 실제 재고에 영향 없음)
            if t_type == "판매":
                cur.execute("UPDATE products SET stock = stock - ? WHERE id = ?", (qty, p_id))
                cur.execute("UPDATE partners SET balance = balance + ? WHERE id = ?", (total, pa_id))
            elif t_type == "구매":
                cur.execute("UPDATE products SET stock = stock + ? WHERE id = ?", (qty, p_id))
                cur.execute("UPDATE partners SET balance = balance - ? WHERE id = ?", (total, pa_id))

            # 5. 자동 전표 기록
            cur.execute("""
                INSERT INTO vouchers(v_num, v_type, partner, product, qty, supply, vat, total, date, account_name)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, date('now'), ?)
            """, (v_num, t_type, partner['name'], product['name'], qty, supply, vat, total, 
                  '매출' if t_type == "판매" else '상품매입'))
            
            con.commit()
        return jsonify({"message": "success", "v_num": v_num})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- 재무/보고서: 손익 및 현황 API ---
@app.route("/reports/profit-loss", methods=["GET"])
def get_profit_loss():
    # 월별 매출, 매입 합계 계산
    with get_db() as con:
        query = """
            SELECT strftime('%Y-%m', date) as month,
                   SUM(CASE WHEN v_type='판매' THEN supply ELSE 0 END) as sales,
                   SUM(CASE WHEN v_type='구매' THEN supply ELSE 0 END) as purchase
            FROM vouchers
            GROUP BY month
        """
        rows = con.execute(query).fetchall()
        return jsonify([dict(row) for row in rows])

@app.route("/vouchers", methods=["GET"])
def get_vouchers():
    with get_db() as con:
        rows = con.execute("SELECT * FROM vouchers ORDER BY date DESC, id DESC").fetchall()
        return jsonify([dict(row) for row in rows])

@app.route("/vouchers/<int:id>", methods=["DELETE"])
def delete_voucher(id):
    try:
        with get_db() as con:
            cur = con.cursor()
            # 1. 삭제할 전표 정보 가져오기
            v = cur.execute("SELECT * FROM vouchers WHERE id=?", (id,)).fetchone()
            if not v: 
                return jsonify({"error": "전표를 찾을 수 없습니다."}), 404
            
            # 2. 전표 타입 판별 (비어있을 경우를 대비한 방어 로직)
            # 기존 데이터(type)와 새 데이터(v_type) 모두 체크합니다.
            v_type = v['v_type'] or v['type'] or ""
            qty = v['qty'] or 0
            total = v['total'] or 0
            product_name = v['product']
            partner_name = v['partner']

            # 3. 복구 로직 실행
            # 판매/매출일 때: 재고는 다시 채우고(+), 외상값은 뺍니다(-)
            if v_type in ["판매", "OUT"]:
                cur.execute("UPDATE products SET stock = stock + ? WHERE name = ?", (qty, product_name))
                cur.execute("UPDATE partners SET balance = balance - ? WHERE name = ?", (total, partner_name))
            
            # 구매/매입일 때: 재고는 다시 빼고(-), 줄 돈은 다시 채웁니다(+)
            elif v_type in ["구매", "IN"]:
                cur.execute("UPDATE products SET stock = stock - ? WHERE name = ?", (qty, product_name))
                cur.execute("UPDATE partners SET balance = balance + ? WHERE name = ?", (total, partner_name))
            
            # 4. 전표 삭제
            cur.execute("DELETE FROM vouchers WHERE id = ?", (id,))
            con.commit()
            
        return jsonify({"message": "success"})
    except Exception as e:
        # 에러 내용을 로그로 출력해서 원인 파악을 돕습니다.
        print(f"삭제 에러 발생: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, port=port, host='0.0.0.0')