# app.py
from flask import Flask, jsonify, abort, render_template, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# PostgreSQL config
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('POSTGRESQL_DB_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Models
class Category(db.Model):
    __tablename__ = 'category'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), nullable=False, unique=True)
    name = db.Column(db.String(255), nullable=False, unique=True)
    products = db.relationship('Product', backref='category', lazy=True)

class Product(db.Model):
    __tablename__ = 'product'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    sku = db.Column(db.String(50), nullable=False, unique=True)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(10), nullable=False, default='USD')
    category_code = db.Column(db.String(50), db.ForeignKey('category.code'), nullable=False)
    in_stock = db.Column(db.Boolean, nullable=False, default=True)
    rating = db.Column(db.Numeric(2, 1), default=0.0)
    reviews = db.Column(db.Integer, default=0)
    image_path = db.Column(db.String(255), nullable=True)

# Routes
@app.route('/api/products', methods=['GET'])
def get_products():
    categories = Category.query.all()
    result = {}
    for cat in categories:
        result[cat.name] = [
            {
                "id": p.id,
                "name": p.name,
                "sku": p.sku,
                "price": float(p.price),
                "currency": p.currency,
                "inStock": p.in_stock,
                "rating": float(p.rating),
                "reviews": p.reviews,
                "imagePath": p.image_path
            }
            for p in cat.products
        ]
    return jsonify(result)

@app.route('/api/products/<string:category_code>', methods=['GET'])
def get_products_by_category(category_code):
    products = Product.query.filter_by(category_code=category_code).all()
    return jsonify([
        {
            "id": p.id,
            "name": p.name,
            "sku": p.sku,
            "price": float(p.price),
            "currency": p.currency,
            "inStock": p.in_stock,
            "rating": float(p.rating),
            "reviews": p.reviews,
            "imagePath": p.image_path
        }
        for p in products
    ])

@app.route('/api/product/<string:sku>', methods=['GET'])
def get_product(sku):
    product = Product.query.filter_by(sku=sku).first()
    if not product:
        abort(404, description="Product not found")
    return jsonify({
        "id": product.id,
        "name": product.name,
        "sku": product.sku,
        "price": float(product.price),
        "currency": product.currency,
        "category": product.category.name,
        "inStock": product.in_stock,
        "rating": float(product.rating),
        "imagePath": product.image_path,
        "reviews": product.reviews
    })

# CRUD Endpoints for Categories
@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify([{"id": c.id, "code": c.code, "name": c.name} for c in categories])

@app.route('/api/category', methods=['POST'])
def create_category():
    data = request.json
    if not data or not data.get('name'):
        abort(400, description="Category name is required")
    if not data.get('code'):
        abort(400, description="Category code is required")
    existing = Category.query.filter_by(name=data['name']).first()
    if existing:
        abort(409, description="Category already exists")
    existing = Category.query.filter_by(code=data['code']).first()
    if existing:
        abort(409, description="Category code already exists")

    category = Category(name=data['name'], code=data['code'])
    db.session.add(category)
    db.session.commit()
    return jsonify({"id": category.id, "code": category.code, "name": category.name}), 201

@app.route('/api/category/<string:category_code>', methods=['PUT'])
def update_category(category_code):
    category = Category.query.filter_by(code=category_code).first()
    if not category:
        abort(404, description="Category not found")
    
    data = request.json
    if not data or not data.get('name'):
        abort(400, description="Category name is required")
    
    existing = Category.query.filter_by(name=data['name']).first()
    if existing and existing.code != category_code:
        abort(409, description="Category name already exists")
    
    category.name = data['name']
    db.session.commit()
    return jsonify({"id": category.id, "code": category.code, "name": category.name})

@app.route('/api/category/<string:category_code>', methods=['DELETE'])
def delete_category(category_code):
    category = Category.query.filter_by(code=category_code).first()
    if not category:
        abort(404, description="Category not found")
    
    db.session.delete(category)
    db.session.commit()
    return '', 204

# CRUD Endpoints for Products
@app.route('/api/product', methods=['POST'])
def create_product():
    data = request.json
    required = ['name', 'sku', 'price', 'currency', 'category_code']
    if not data or not all(k in data for k in required):
        abort(400, description="Missing required fields")
    
    existing = Product.query.filter_by(sku=data['sku']).first()
    if existing:
        abort(409, description="SKU already exists")
    
    product = Product(
        name=data['name'],
        sku=data['sku'],
        price=data['price'],
        currency=data['currency'],
        category_code=data['category_code'],
        in_stock=data.get('in_stock', True),
        rating=data.get('rating', 0.0),
        image_path=data.get('image_path')
    )
    db.session.add(product)
    db.session.commit()
    return jsonify({
        "id": product.id,
        "name": product.name,
        "sku": product.sku,
        "price": float(product.price),
        "currency": product.currency,
        "category_code": product.category_code,
        "inStock": product.in_stock,
        "rating": float(product.rating),
        "reviews": product.reviews,
        "imagePath": product.image_path,
        "reviews": product.reviews
    }), 201

@app.route('/api/product/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        abort(404, description="Product not found")
    
    data = request.json
    if not data:
        abort(400, description="Request body is required")
    
    if 'sku' in data and data['sku'] != product.sku:
        existing = Product.query.filter_by(sku=data['sku']).first()
        if existing:
            abort(409, description="SKU already exists")
        product.sku = data['sku']
    
    if 'name' in data:
        product.name = data['name']
    if 'price' in data:
        product.price = data['price']
    if 'currency' in data:
        product.currency = data['currency']
    if 'category_code' in data:
        product.category_code = data['category_code']
    if 'in_stock' in data:
        product.in_stock = data['in_stock']
    if 'rating' in data:
        product.rating = data['rating']
    if 'image_path' in data:
        product.image_path = data['image_path']
    
    db.session.commit()
    return jsonify({
        "id": product.id,
        "name": product.name,
        "sku": product.sku,
        "price": float(product.price),
        "currency": product.currency,
        "category_code": product.category_code,
        "inStock": product.in_stock,
        "rating": float(product.rating),
        "reviews": product.reviews,
        "imagePath": product.image_path,
        "rating": float(product.rating),
        "reviews": product.reviews
    })

@app.route('/api/product/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        abort(404, description="Product not found")
    
    db.session.delete(product)
    db.session.commit()
    return '', 204

@app.route('/dashboard.html')
def dashboard():
    return render_template('dashboard.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)