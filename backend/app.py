from flask import Flask, request, jsonify
import sqlite3
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DB = "erp.db"

def get_db():
    return sqlite3.connect(DB)

# -------------------------------
# DB 초기화
# -------------------------------
@app.route("/init")
def init():
    con = get_db()
    cur = con.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        price INTEGER,
        stock INTEGER
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS partners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        balance INTEGER
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS vouchers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        partner TEXT,
        product TEXT,
        qty INTEGER,
        supply INTEGER,
        vat INTEGER,
        total INTEGER,
        date TEXT
    )
    """)

    con.commit()
    con.close()

    return "DB Initialized"

    @app.route("/products", methods=["GET"])
def get_products():
    con = get_db()
    cur = con.cursor()

    cur.execute("SELECT * FROM products")
    rows = cur.fetchall()

    result = []
    for r in rows:
        result.append({
            "id": r[0],
            "name": r[1],
            "price": r[2],
            "stock": r[3]
        })

    return jsonify(result)


@app.route("/products", methods=["POST"])
def add_product():
    data = request.json

    con = get_db()
    cur = con.cursor()

    cur.execute(
        "INSERT INTO products(name, price, stock) VALUES (?, ?, ?)",
        (data["name"], data["price"], 0)
    )

    con.commit()
    con.close()

    return "OK"

    @app.route("/partners", methods=["GET"])
def get_partners():
    con = get_db()
    cur = con.cursor()

    cur.execute("SELECT * FROM partners")
    rows = cur.fetchall()

    result = []
    for r in rows:
        result.append({
            "id": r[0],
            "name": r[1],
            "balance": r[2]
        })

    return jsonify(result)


@app.route("/partners", methods=["POST"])
def add_partner():
    data = request.json

    con = get_db()
    cur = con.cursor()

    cur.execute(
        "INSERT INTO partners(name, balance) VALUES (?, 0)",
        (data["name"],)
    )

    con.commit()
    con.close()

    return "OK"

    @app.route("/transaction", methods=["POST"])
def transaction():
    data = request.json

    con = get_db()
    cur = con.cursor()

    product_id = data["product_id"]
    partner_id = data["partner_id"]
    qty = data["qty"]
    type = data["type"]

    # 상품 조회
    cur.execute("SELECT name, price, stock FROM products WHERE id=?", (product_id,))
    product = cur.fetchone()

    # 거래처 조회
    cur.execute("SELECT name, balance FROM partners WHERE id=?", (partner_id,))
    partner = cur.fetchone()

    name, price, stock = product
    pname, balance = partner

    total = price * qty
    supply = int(total / 1.1)
    vat = total - supply

    # 재고 업데이트
    if type == "OUT":
        new_stock = stock - qty
    else:
        new_stock = stock + qty

    cur.execute("UPDATE products SET stock=? WHERE id=?", (new_stock, product_id))

    # 미수금 업데이트
    if type == "OUT":
        cur.execute("UPDATE partners SET balance=? WHERE id=?", (balance + total, partner_id))

        # 전표 생성
        cur.execute("""
        INSERT INTO vouchers(partner, product, qty, supply, vat, total, date)
        VALUES (?, ?, ?, ?, ?, ?, date('now'))
        """, (pname, name, qty, supply, vat, total))

    con.commit()
    con.close()

    return "OK"

    @app.route("/vouchers", methods=["GET"])
def get_vouchers():
    con = get_db()
    cur = con.cursor()

    cur.execute("SELECT * FROM vouchers ORDER BY id DESC")
    rows = cur.fetchall()

    result = []
    for r in rows:
        result.append({
            "id": r[0],
            "partner": r[1],
            "product": r[2],
            "qty": r[3],
            "supply": r[4],
            "vat": r[5],
            "total": r[6],
            "date": r[7],
        })

    return jsonify(result)