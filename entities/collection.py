from flask import Blueprint, jsonify, abort, request
from extensions import db

collection_bp = Blueprint('collection', __name__)

# Association table for many-to-many between Collection and Product
collection_product = db.Table('collection_product',
    db.Column('collection_id', db.Integer, db.ForeignKey('collection.id'), primary_key=True),
    db.Column('product_id', db.Integer, db.ForeignKey('product.id'), primary_key=True)
)

class Collection(db.Model):
    __tablename__ = 'collection'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), nullable=False, unique=True)
    name = db.Column(db.String(255), nullable=False, unique=True)
    products = db.relationship('Product', secondary=collection_product, lazy='subquery',
        backref=db.backref('collections', lazy=True))

# CRUD Endpoints for Collections
@collection_bp.route('/v1/collections', methods=['GET'])
def get_collections():
    collections = Collection.query.all()
    return jsonify([{"id": c.id, "code": c.code, "name": c.name} for c in collections])

@collection_bp.route('/v1/collection', methods=['POST'])
def create_collection():
    data = request.json
    if not data or not data.get('name'):
        abort(400, description="Collection name is required")
    if not data.get('code'):
        abort(400, description="Collection code is required")
    existing = Collection.query.filter_by(name=data['name']).first()
    if existing:
        abort(409, description="Collection already exists")
    existing = Collection.query.filter_by(code=data['code']).first()
    if existing:
        abort(409, description="Collection code already exists")

    collection = Collection(name=data['name'], code=data['code'])
    db.session.add(collection)
    db.session.commit()
    return jsonify({"id": collection.id, "code": collection.code, "name": collection.name}), 201

@collection_bp.route('/v1/collection/<string:collection_code>', methods=['PUT'])
def update_collection(collection_code):
    collection = Collection.query.filter_by(code=collection_code).first()
    if not collection:
        abort(404, description="Collection not found")
    
    data = request.json
    if not data or not data.get('name'):
        abort(400, description="Collection name is required")
    
    existing = Collection.query.filter_by(name=data['name']).first()
    if existing and existing.code != collection_code:
        abort(409, description="Collection name already exists")
    
    collection.name = data['name']
    db.session.commit()
    return jsonify({"id": collection.id, "code": collection.code, "name": collection.name})

@collection_bp.route('/v1/collection/<string:collection_code>', methods=['DELETE'])
def delete_collection(collection_code):
    collection = Collection.query.filter_by(code=collection_code).first()
    if not collection:
        abort(404, description="Collection not found")
    
    db.session.delete(collection)
    db.session.commit()
    return '', 204

@collection_bp.route('/v1/collection/<string:collection_code>/products', methods=['GET'])
def get_collection_products(collection_code):
    collection = Collection.query.filter_by(code=collection_code).first()
    if not collection:
        abort(404, description="Collection not found")
    
    products = collection.products
    result = []
    for p in products:
        result.append({
            "id": p.id,
            "name": p.name,
            "sku": p.sku,
            "price": float(p.price),
            "currency": p.currency,
            "inStock": p.in_stock,
            "rating": float(p.rating),
            "reviews": p.reviews,
            "imagePath": p.image_path
        })
    return jsonify(result)