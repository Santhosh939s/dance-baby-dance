import os
import subprocess
import json

TEST_OUTPUTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), 'test_outputs'))

def generate_dance(audio_path):
    os.makedirs(TEST_OUTPUTS_DIR, exist_ok=True)
    json_out = os.path.join(TEST_OUTPUTS_DIR, 'last_inference.json')
    
    # Remove previous inference file if exists
    if os.path.exists(json_out):
        os.remove(json_out)
        
    script_path = os.path.join(os.path.dirname(__file__), 'test_inference.py')
    
    # Run test_inference.py as a subprocess using the current python executable
    # (Since this is running in mint-venv, sys.executable is the mint-venv python)
    import sys
    python_exe = sys.executable
    
    try:
        print(f"Running inference subprocess: {python_exe} {script_path} --audio {audio_path} --json_out {json_out}")
        result = subprocess.run([python_exe, script_path, '--audio', audio_path, '--json_out', json_out], 
                                capture_output=True, text=True)
        
        print("Subprocess STDOUT:", result.stdout)
        if result.stderr:
            print("Subprocess STDERR:", result.stderr)
            
        if result.returncode != 0:
            return {"success": False, "error": f"Inference script failed with code {result.returncode}. stderr: {result.stderr}"}
            
        if not os.path.exists(json_out):
            return {"success": False, "error": "Inference script completed but JSON output was not generated."}
            
        with open(json_out, 'r') as f:
            payload = json.load(f)
            
        return payload
        
    except Exception as e:
        return {"success": False, "error": f"Subprocess execution failed: {str(e)}"}
