import socketio
import asyncio
import base64

class SocketClient:
    def __init__(self, socket_url):
        self.sio = socketio.AsyncClient()
        self.socket_url = socket_url
        self.connected = False
        
    async def connect(self):
        try:
            await self.sio.connect(self.socket_url)
            self.connected = True
        except Exception as e:
            print(f"Socket connection failed: {e}")
            
    async def disconnect(self):
        if self.connected:
            await self.sio.disconnect()
            self.connected = False
            
    async def emit_audio_chunk(self, audio_bytes):
        if self.connected:
            audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
            await self.sio.emit('audio-chunk', {'data': audio_b64})
            
    async def emit_text_message(self, text):
        if self.connected:
            await self.sio.emit('text-message', {'text': text})