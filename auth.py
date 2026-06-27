##################################################################################
# Authentication and Authorization module for the Stylish backend.
# 
from flask import Blueprint, abort, jsonify, request, session, make_response
from sqlalchemy import text
from extensions import db
from dotenv import load_dotenv
from functools import wraps
import secrets
import os
import datetime
import jwt

##########################################################################################
#
# get environment variables from .env file, the defaults are for development purposes only, 
# change them in production.
#
load_dotenv()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", secrets.token_hex(32))
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
DATETIME_REFRESH_TOKEN_DELTA = int(os.getenv("DATETIME_REFRESH_TOKEN_DELTA", 240))
DATETIME_ACCESS_TOKEN_DELTA = int(os.getenv("DATETIME_ACCESS_TOKEN_DELTA", 120))

##########################################################################################
#
# Get Authentication Blueprint, to be registered in the main server.py file.
#
AuthenticationBlueprint = Blueprint('auth', __name__)

##########################################################################################
#
# Database model for the User entity, representing users in the system.
#
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), nullable=False, unique=True)
    role = db.Column(db.String(255), nullable=False)
    passwd_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(255), nullable=True)
    surname = db.Column(db.String(255), nullable=True)

    def to_dict(self):
        return {
            'username': self.username,
            'role': self.role,
            'name': self.name,
            'surname': self.surname,
        }

#############################################################################################
#
# Helper class to manage JWT tokens (Access and Refresh) 
# for authentication and authorization.
#
class TokenManager:

    @staticmethod
    def generateAccessToken(id):
        
        payload = {
            'user_id': id,
            'type': 'access',
            'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(seconds=DATETIME_ACCESS_TOKEN_DELTA),
            'iat': datetime.datetime.now(datetime.timezone.utc)
        }
        
        token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        
        return token

    @staticmethod
    def generateRefreshToken(id):
        
        payload = {
            'user_id': id,
            'type': 'refresh',
            'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(seconds=DATETIME_REFRESH_TOKEN_DELTA),
            'iat': datetime.datetime.now(datetime.timezone.utc)
        }
        
        token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        
        return token
    
    @staticmethod
    def verifyAuthToken(request):
        try:
            authorization = request.headers.get("Authorization")
        
        
            if not authorization or not authorization.startswith("Bearer "):

                abort(401, description="Authorization header is missing or invalid.")
            
            token = authorization.split(" ")[1]
           
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])

            return {"success": True, "result": payload}
        
        except jwt.ExpiredSignatureError:

            return {"success": False, "message": "Token has expired."}
        
        except jwt.InvalidTokenError:

            return {"success": False, "message": "Token is invalid."}

#################################################################################
# Endpoint Protection Decorator, to be used on routes that require authentication.
# It verifies the presence and validity of an Access Token in the Authorization header.
# The format expected is: "Authorization: Bearer <token>"
#
def EndpointProtectionVerifier(f):
    @wraps(f)
    def requireLogin(*args, **kwargs):
    
        payload = TokenManager.verifyAuthToken(request)

        if payload and payload.get("success") is False:
            abort(401, description=payload.get('message', 'Unauthorized access.'))
        
        if payload and payload.get("result").get('type') != "access":

            abort(401, description="Invalid token type. Use a Refresh Token at the /refresh endpoint.")
            
        request.user_identity = payload.get("result", {}).get("user_id")
    
        return f(*args, **kwargs)
    
    return requireLogin

@AuthenticationBlueprint.route('/v1/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    username = str(data.get('username') or '').strip()
    password = data.get('password') or ''

    user = User.query.filter_by(username=username).first()
    if not user:
        abort(401, description='Invalid username or password.')

    valid = db.session.execute(
        text('SELECT crypt(:password, passwd_hash) = passwd_hash FROM users WHERE id = :user_id'),
        {'password': password, 'user_id': user.id},
    ).scalar()

    if not valid:
        abort(401, description='Invalid username or password.')

    accessToken  = TokenManager.generateAccessToken(user.id)
    refreshToken = TokenManager.generateRefreshToken(user.id)

    response = make_response(jsonify({
        'access_token': accessToken, 
        'refresh_token': refreshToken, 
        'user': user.to_dict()}))

    response.set_cookie('access_token', 
                        accessToken, 
                        httponly=True, 
                        secure=True, 
                        samesite='Strict',
                        max_age=2*60)  # 2 minutes
    
    session['user_id'] = user.id

    return response

@AuthenticationBlueprint.route('/v1/refresh', methods=['POST'])
def refresh():
    
    #refreshToken = request.cookies.get('refresh_token')
    
    #if not refreshToken:
    #    abort(401, description='Refresh token is missing')

   
    payload = TokenManager.verifyAuthToken(request)
    
    if payload and payload.get("success") is False:
        abort(401, description=payload.get('message', 'Unauthorized access.'))
    
    if payload and payload.get("result").get('type') != "refresh":

        abort(401, description="Invalid token type.")

    
    if payload and payload.get("result").get('user_id') is None:
        abort(401, description="Invalid token payload. User is missing.")

            

    user_id = payload.get("result", {}).get('user_id')
    user = User.query.get(user_id)

    if not user:
        abort(401, description='User not found')

    new_access_token = TokenManager.generateAccessToken(user.id)

    response = make_response(jsonify({'access_token': new_access_token}))

    response.set_cookie('access_token', 
                        new_access_token, 
                        httponly=True, 
                        secure=True, 
                        samesite='Strict',
                        max_age=2*60)  # 2 minutes

    return response

@AuthenticationBlueprint.route('/v1/verify', methods=['POST'])
def verify():
    payload = TokenManager.verifyAuthToken(request)
    
    if payload and payload.get("success") is False:
        abort(401, description=payload.get('message', 'Unauthorized access.'))
    
    if payload and payload.get("result").get('type') != "access":
        abort(401, description="Invalid token type. Use a Refresh Token at the /refresh endpoint.")
            
    user_id = payload.get("result", {}).get('user_id')
    user = User.query.get(user_id)

    if not user:
        abort(401, description='User not found')

    return jsonify({'result': True, 'message': 'Token is valid'})


@AuthenticationBlueprint.route('/v1/logout', methods=['POST'])
def logout():
    response = make_response(jsonify({"message": "Logout effettuato con successo"}))
    
    response.set_cookie(
        'refresh_token', 
        '',                      # Svuota il valore del token
        max_age=0,               # Forza la cancellazione immediata
        httponly=True, 
        secure=True,             # Cambia in False se testi in HTTP locale (senza HTTPS)
        samesite='Strict'
    )
    
    return response
