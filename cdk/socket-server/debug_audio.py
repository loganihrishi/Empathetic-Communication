import socketio
import asyncio
import base64
import time
import logging
import os
import json
import wave

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AudioDebugger:
    def __init__(self, socket_url="http://EC-Ecs-Socke-hO4Rh2lPZK8W-136475853.us-east-1.elb.amazonaws.com:3000"):
        self.sio = socketio.AsyncClient()
        self.socket_url = socket_url
        self.connected = False
        self.audio_received = 0
        self.text_received = 0
        
        # Set up event handlers
        @self.sio.event
        async def connect():
            logger.info("✅ Connected to socket server")
            self.connected = True
            
        @self.sio.event
        async def disconnect():
            logger.info("❌ Disconnected from socket server")
            self.connected = False
            
        @self.sio.on("audio-chunk")
        async def on_audio_chunk(data):
            audio_data = data.get("data", "")
            audio_length = len(audio_data) if audio_data else 0
            self.audio_received += 1
            logger.info(f"🎵 Received audio chunk #{self.audio_received}, base64 size: {audio_length}")

            if not audio_data:
                logger.warning("⚠️ No audio data received.")
                return

            try:
                
                audio_bytes = base64.b64decode(audio_data)

                # Save to file for inspection
                file_path = f"received_audio_{self.audio_received}.raw"
                with open(file_path, "wb") as f:
                    f.write(audio_bytes)
                logger.info(f"💾 Saved audio to {file_path}")

                # Attempt to play the raw PCM data
                logger.info("🔊 Playing audio response...")
                play_obj = sa.play_buffer(audio_bytes, 1, 2, 24000)  # 1 channel, 2 bytes/sample, 24kHz
                play_obj.wait_done()
                logger.info("✅ Audio playback finished")

            except Exception as e:
                logger.error(f"❌ Playback or decoding error: {e}")

            
        @self.sio.on("text-message")
        async def on_text_message(data):
            text = data.get("text", "")
            self.text_received += 1
            logger.info(f"💬 Received text message #{self.text_received}: {text[:50]}...")
            
    async def connect(self):
        try:
            await self.sio.connect(self.socket_url)
            return True
        except Exception as e:
            logger.error(f"❌ Connection error: {e}")
            return False
    


    async def send_test_audio(self, wav_path="cdk/socket-server/sample.wav"):
        """Send audio data from a WAV file to the server"""
        try:
            print("📂 Files in current directory:", os.listdir("."))
            with wave.open(wav_path, "rb") as wav:
                channels = wav.getnchannels()
                sample_width = wav.getsampwidth()
                frame_rate = wav.getframerate()
                frames = wav.readframes(wav.getnframes())

            logger.info(f"🎧 Loaded WAV file: {wav_path}")
            logger.info(f"  Channels: {channels}")
            logger.info(f"  Sample Width: {sample_width * 8} bits")
            logger.info(f"  Frame Rate: {frame_rate} Hz")
            logger.info(f"  Total Samples: {len(frames)}")

            # Validate audio format
            if channels != 1 or sample_width != 2:
                raise ValueError("WAV file must be mono, 16-bit, 16kHz PCM.")

            audio_b64 = base64.b64encode(frames).decode("utf-8")
            await self.sio.emit("start-audio")
            await asyncio.sleep(0.1)  # slight delay to ensure Nova is listening
            await self.sio.emit("audio-input", {"data": audio_b64})
            logger.info("✅ WAV audio sent to Nova")
        except Exception as e:
            logger.error(f"❌ Failed to send WAV audio: {e}")

        
    async def send_text(self, text):
        """Send a text message to the server"""
        logger.info(f"📝 Sending text: {text}")
        await self.sio.emit("text-input", {"text": text})
        
    async def start_nova(self):
        """Start Nova Sonic session"""
        logger.info("🚀 Starting Nova Sonic")
        await self.sio.emit("start-nova-sonic")
        
    async def end_audio(self):
        """End audio input"""
        logger.info("🛑 Ending audio input")
        await self.sio.emit("end-audio")
        
    async def disconnect(self):
        if self.connected:
            await self.sio.disconnect()

async def main():
    socket_url = os.getenv("SOCKET_URL", "http://localhost:3000")
    debugger = AudioDebugger(socket_url)
    
    try:
        # Connect to socket server
        logger.info(f"Connecting to {socket_url}")
        if not await debugger.connect():
            logger.error("Failed to connect, exiting")
            return
        
        # Start Nova Sonic
        await debugger.start_nova()
        logger.info("Waiting for Nova to initialize...")
        await asyncio.sleep(5)
        
        # Send test audio
        await debugger.send_test_audio()
        logger.info("Waiting for response...")
        await asyncio.sleep(5)
        
        # End audio input
        await debugger.end_audio()
        logger.info("Waiting for final response...")
        await asyncio.sleep(10)
        
        # Send a text message
        await debugger.send_text("Hello, can you hear me?")
        logger.info("Waiting for text response...")
        await asyncio.sleep(10)
        
        # Print summary
        logger.info(f"Test complete. Received {debugger.audio_received} audio chunks and {debugger.text_received} text messages. {debugger}")
        
    except Exception as e:
        logger.error(f"Test error: {e}")
    finally:
        await debugger.disconnect()

if __name__ == "__main__":
    asyncio.run(main())