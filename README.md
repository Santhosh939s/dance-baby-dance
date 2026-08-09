# Dance Baby Dance

An end-to-end AI choreography and retargeting application that converts audio tracks into 3D avatar animations using the `mint-main` AI inference engine and React Three Fiber.

## Architecture

* **Frontend**: React + Vite + Three.js + React Three Fiber
* **Backend**: Node.js + Express (Handles API routes and audio forwarding)
* **AI Engine (backend-ai)**: FastAPI service executing `mint-main` as a subprocess to prevent TensorFlow graph state corruption.

## Local Setup

### 1. Prerequisites
- Node.js (v18+)
- Python (v3.7 is strictly required for the `mint-main` AI environment)
- Anaconda/Miniconda (for creating the legacy Python 3.7 virtual environment)

### 2. IMPORTANT: mint-main Checkpoint

The AI checkpoint is **~1.44 GB** and is intentionally excluded from this GitHub repository. 

To run the AI locally, you **MUST** download the checkpoint separately (refer to the official mint-main documentation for download sources) and place it at:

```
mint-main/checkpoints/mint_fact_b32_v3_2_2021-05-06/
```

Required files in this directory:
- `checkpoint`
- `ckpt-214501.index`
- `ckpt-214501.data-00000-of-00001`

**If these files are missing, "Live AI Inference" will fail.**

### 3. Running Locally

You will need three terminal tabs:

**Tab 1: AI Backend (FastAPI)**
```bash
cd backend-ai
# The start script will activate the mint-venv and start Uvicorn
start_backend_ai.bat
```

**Tab 2: Node.js Backend**
```bash
cd backend
npm install
npm run dev
```

**Tab 3: React Frontend**
```bash
cd frontend
npm install
npm run dev
```

> **Note on AI Speed**: Real AI inference on CPU takes approximately ~125 seconds for a 10-second audio clip. The frontend supports a **Replay Mode** to test the UI flow quickly using the `last_inference.json` cache.
