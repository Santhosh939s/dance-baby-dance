import requests
import json

url = "http://127.0.0.1:8000/generate"
# Download a 1-second sine wave wav file to test
import wave
import struct
import math

audio_path = "test_song.wav"
with wave.open(audio_path, 'w') as wav_file:
    wav_file.setnchannels(1)
    wav_file.setsampwidth(2)
    wav_file.setframerate(15360)
    for i in range(15360 * 10):
        value = int(32767.0 * math.sin(2.0 * math.pi * 440.0 * (i / 15360.0)))
        wav_file.writeframes(struct.pack('h', value))

with open(audio_path, 'rb') as f:
    print(f"Sending POST request to {url}...")
    response = requests.post(url, files={"audio_file": f})
    
print(f"Status Code: {response.status_code}")
data = response.json()
if "motion" in data:
    data["motion"] = "TRUNCATED"
print(json.dumps(data, indent=2))
