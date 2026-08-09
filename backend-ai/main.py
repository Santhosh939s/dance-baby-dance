from fastapi import FastAPI, UploadFile, File, HTTPException
import uvicorn
import tempfile
import os
import shutil
from inference_wrapper import generate_dance

app = FastAPI(title="AI Choreography Engine", version="1.0.0")

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/replay")
def replay():
    import os
    import json
    replay_file = os.path.join(os.path.dirname(__file__), 'test_outputs', 'last_inference.json')
    if os.path.exists(replay_file):
        with open(replay_file, 'r') as f:
            return json.load(f)
    return {"success": False, "error": "No saved replay found."}

@app.post("/generate")
async def generate(audio_file: UploadFile = File(...)):
    if not audio_file.filename.endswith(('.mp3', '.wav')):
        raise HTTPException(status_code=400, detail="Only MP3 or WAV files are supported")
    
    # Save uploaded file to temp file
    fd, temp_path = tempfile.mkstemp(suffix=os.path.splitext(audio_file.filename)[1])
    try:
        with os.fdopen(fd, 'wb') as f:
            shutil.copyfileobj(audio_file.file, f)
        
        # Run inference
        result = generate_dance(temp_path)
        
        if not result["success"]:
            # e.g., CHECKPOINT_MISSING
            return result

        # Return full payload
        return result
    
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        # Cleanup
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
