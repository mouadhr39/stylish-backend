from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from dotenv import load_dotenv
import secrets
import os
from extensions import db

load_dotenv()

app = Flask(
    __name__,
    static_folder='app/dist',
    static_url_path='/')

CORS(app, supports_credentials=True)

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', secrets.token_hex(32))
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('POSTGRESQL_DB_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

from auth import AuthenticationBlueprint
from entities.product import product_bp
from entities.collection import collection_bp
from entities.category import category_bp

app.register_blueprint(AuthenticationBlueprint)
app.register_blueprint(product_bp)
app.register_blueprint(collection_bp)
app.register_blueprint(category_bp)


@app.errorhandler(HTTPException)
def handle_http_exception(error):

    response = jsonify({
        'status': 'error',
        'code': error.code,
        'name': error.name,
        'description': error.description,
    })

    response.status_code = error.code
    return response


@app.route('/')
@app.route('/home')
@app.route('/login')
@app.route('/dashboard')
def index():
    return send_from_directory(app.static_folder, 'index.html')



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
