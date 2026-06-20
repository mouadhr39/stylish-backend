from flask import Blueprint, jsonify, abort, request
from extensions import db
from .category import Category

product_bp = Blueprint('product', __name__)

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

# We'll import Collection inside functions to avoid circular imports if needed

@product_bp.route('/v1/products', methods=['GET'])
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

@product_bp.route('/v1/products/<string:category_code>', methods=['GET'])
def get_products_by_category(category_code):
    category = Category.query.filter_by(code=category_code).first()
    if not category:
        abort(404, description="Category not found")

    products = Product.query.filter_by(category_code=category_code).all()
    if not products:
        abort(404, description="No products found for this category")

    result = {
        "id": category.id,
        "name": category.name,
        "code": category.code,
        "products": [
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
        ]
    }
    return jsonify(result)

@product_bp.route('/v1/product/<string:sku>', methods=['GET'])
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

@product_bp.route('/v1/product', methods=['POST'])
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
        "imagePath": product.image_path
    }), 201

@product_bp.route('/v1/product/<int:product_id>', methods=['PUT'])
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
        "imagePath": product.image_path
    })

@product_bp.route('/v1/product/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        abort(404, description="Product not found")

    db.session.delete(product)
    db.session.commit()
    return '', 204