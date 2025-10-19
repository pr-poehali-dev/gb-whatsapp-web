import json
import os
import psycopg2
from typing import Dict, Any
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get users list and user profiles
    Args: event with httpMethod, queryStringParameters
    Returns: HTTP response with users data
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        search = params.get('search', '')
        
        if search:
            cur.execute(
                "SELECT id, email, username, display_name, bio, avatar_url, is_verified, last_seen FROM users WHERE username ILIKE %s OR display_name ILIKE %s LIMIT 50",
                (f'%{search}%', f'%{search}%')
            )
        else:
            cur.execute(
                "SELECT id, email, username, display_name, bio, avatar_url, is_verified, last_seen FROM users LIMIT 50"
            )
        
        rows = cur.fetchall()
        users = []
        for row in rows:
            users.append({
                'id': row[0],
                'email': row[1],
                'username': row[2],
                'display_name': row[3],
                'bio': row[4] or '',
                'avatar_url': row[5],
                'is_verified': row[6],
                'last_seen': row[7].isoformat()
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'users': users})
        }
    
    elif method == 'PUT':
        body_data = json.loads(event.get('body', '{}'))
        user_id = body_data.get('user_id')
        display_name = body_data.get('display_name')
        username = body_data.get('username')
        bio = body_data.get('bio')
        avatar_url = body_data.get('avatar_url')
        
        cur.execute(
            "UPDATE users SET display_name = %s, username = %s, bio = %s, avatar_url = %s WHERE id = %s RETURNING id, email, username, display_name, bio, avatar_url, is_verified, last_seen",
            (display_name, username, bio, avatar_url, user_id)
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
