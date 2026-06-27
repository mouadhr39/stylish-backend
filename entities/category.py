from flask import Blueprint, jsonify, abort, request
from extensions import db
from auth import EndpointProtectionVerifier

category_bp = Blueprint('category', __name__)

class Category(db.Model):
    __tablename__ = 'category'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), nullable=False, unique=True)
    name = db.Column(db.String(255), nullable=False, unique=True)
    products = db.relationship('Product', backref='category', lazy=True)


@category_bp.route('/v1/category', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify([{"id": c.id, "code": c.code, "name": c.name} for c in categories])


@category_bp.route('/v1/category', methods=['POST'])
@EndpointProtectionVerifier
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


@category_bp.route('/v1/category/<string:category_code>', methods=['PUT'])
@EndpointProtectionVerifier
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


@category_bp.route('/v1/category/<string:category_code>', methods=['DELETE'])
@EndpointProtectionVerifier
def delete_category(category_code):
    category = Category.query.filter_by(code=category_code).first()
    if not category:
        abort(404, description="Category not found")

    db.session.delete(category)
    db.session.commit()
    return '', 204
