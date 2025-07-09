import asyncio
import json
import sys
import os
sys.path.append('/app')
from main import NovaSonic

async def run_nova():
    nova = NovaSonic()
    await nova.start_session()
    
    # Stream for 5 minutes
    stream_task = asyncio.create_task(nova.stream_audio_to_frontend())
    await asyncio.sleep(300)
    
    nova.is_active = False
    await nova.end_session()

if __name__ == "__main__":
    asyncio.run(run_nova())