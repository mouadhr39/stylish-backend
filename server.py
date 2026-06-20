# app.py
from flask import Flask, jsonify, abort, render_template, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
from extensions import db

load_dotenv()

app = Flask(__name__)
CORS(app)

# PostgreSQL config
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('POSTGRESQL_DB_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Import and register blueprints
from entities.product import product_bp
from entities.collection import collection_bp
from entities.category import category_bp

app.register_blueprint(product_bp)
app.register_blueprint(collection_bp)
app.register_blueprint(category_bp)

# Routes
@app.route('/dashboard.html')
def dashboard():
    return render_template('dashboard.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)