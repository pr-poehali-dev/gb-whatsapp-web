import json
import os
import psycopg2
from typing import Dict, Any
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage user stories - create, view, get viewers
    Args: event with httpMethod, body, queryStringParameters
    Returns: HTTP response with stories data
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
    
    if method == 'GET':
        cur.execute("""
            SELECT s.id, s.user_id, s.image_url, s.caption, s.created_at,
                   u.username, u.display_name, u.avatar_url, u.is_verified,
                   (SELECT COUNT(*) FROM story_views WHERE story_id = s.id) as views
            FROM stories s
            JOIN users u ON s.user_id = u.id
            WHERE s.expires_at > NOW()
            ORDER BY s.created_at DESC
        """)
        
        rows = cur.fetchall()
        stories = []
        for row in rows:
            stories.append({
                'id': row[0],
                'user_id': row[1],
                'image_url': row[2],
                'caption': row[3] or '',
                'created_at': row[4].isoformat(),
                'user': {
                    'username': row[5],
                    'display_name': row[6],
                    'avatar_url': row[7],
                    'is_verified': row[8]
                },
                'views': row[9]
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
            'body': json.dumps({'stories': stories})
        }
    
    elif method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        
        if action == 'create':
            user_id = body_data.get('user_id')
            image_url = body_data.get('image_url')
            caption = body_data.get('caption', '')
            
            cur.execute(
                "INSERT INTO stories (user_id, image_url, caption) VALUES (%s, %s, %s) RETURNING id, user_id, image_url, caption, created_at",
                (user_id, image_url, caption)
            )
            story_row = cur.fetchone()
            conn.commit()
            
            story = {
                'id': story_row[0],
                'user_id': story_row[1],
                'image_url': story_row[2],
                'caption': story_row[3] or '',
                'created_at': story_row[4].isoformat()
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
                'body': json.dumps({'story': story})
            }
        
        elif action == 'view':
            story_id = body_data.get('story_id')
            viewer_id = body_data.get('viewer_id')
            
            cur.execute(
                "INSERT INTO story_views (story_id, viewer_id) VALUES (%s, %s) ON CONFLICT (story_id, viewer_id) DO NOTHING",
                (story_id, viewer_id)
            )
            conn.commit()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'success': True})
            }
        
        elif action == 'viewers':
            story_id = body_data.get('story_id')
            
            cur.execute("""
                SELECT u.id, u.username, u.display_name, u.avatar_url, u.is_verified, sv.viewed_at
                FROM story_views sv
                JOIN users u ON sv.viewer_id = u.id
                WHERE sv.story_id = %s
                ORDER BY sv.viewed_at DESC
            """, (story_id,))
            
            rows = cur.fetchall()
            viewers = []
            for row in rows:
                viewers.append({
                    'id': row[0],
                    'username': row[1],
                    'display_name': row[2],
                    'avatar_url': row[3],
                    'is_verified': row[4],
                    'viewed_at': row[5].isoformat()
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
                'body': json.dumps({'viewers': viewers})
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
