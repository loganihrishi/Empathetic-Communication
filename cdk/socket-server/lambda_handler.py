import json
import os
import asyncio
from main import NovaSonic

def lambda_handler(event, context):
    socket_url = os.environ.get('SOCKET_URL')
    
    try:
        # Run the async Nova Sonic session
        result = asyncio.run(run_nova_session(socket_url))
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Nova Sonic session completed',
                'result': result
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e)
            })
        }

async def run_nova_session(socket_url):
    nova_client = NovaSonic(socket_url=socket_url)
    
    # Start session and streaming task
    await nova_client.start_session()
    asyncio.create_task(nova_client.stream_audio_to_frontend())
    
    # Return immediately - session runs in background
    return "Session started"