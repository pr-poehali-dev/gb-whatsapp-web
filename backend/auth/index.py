import json
import os
import psycopg2
import hashlib
from typing import Dict, Any
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: User authentication and registration
    Args: event with httpMethod, body, queryStringParameters
    Returns: HTTP response with user data or error
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        
        if action == 'register':
            email = body_data.get('email')
            password = body_data.get('password')
            username = body_data.get('username')
            display_name = body_data.get('display_name')
            
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            avatar_url = f"https://api.dicebear.com/7.x/avataaars/svg?seed={username}"
            
            cur.execute(
                "INSERT INTO users (email, password_hash, username, display_name, avatar_url, last_seen) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id, email, username, display_name, bio, avatar_url, is_verified, last_seen",
                (email, password_hash, username, display_name, avatar_url, datetime.now())
            )
            user_row = cur.fetchone()
            conn.commit()
            
            user = {
                'id': user_row[0],
                'email': user_row[1],
                'username': user_row[2],
                'display_name': user_row[3],
                'bio': user_row[4] or '',
                'avatar_url': user_row[5],
                'is_verified': user_row[6],
                'last_seen': user_row[7].isoformat()
            }
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'user': user})
            }
        
        elif action == 'login':
            email = body_data.get('email')
            password = body_data.get('password')
            
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            cur.execute(
                "SELECT id, email, username, display_name, bio, avatar_url, is_verified, last_seen FROM users WHERE email = %s AND password_hash = %s",
                (email, password_hash)
            )
            user_row = cur.fetchone()
            
            if user_row:
                cur.execute(
                    "UPDATE users SET last_seen = %s WHERE id = %s",
                    (datetime.now(), user_row[0])
                )
                conn.commit()
                
                user = {
                    'id': user_row[0],
                    'email': user_row[1],
                    'username': user_row[2],
                    'display_name': user_row[3],
                    'bio': user_row[4] or '',
                    'avatar_url': user_row[5],
                    'is_verified': user_row[6],
                    'last_seen': user_row[7].isoformat()
                }
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'user': user})
                }
            else:
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 401,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Invalid credentials'})
                }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({'error': 'Method not allowed'})
    }
