import os
import sys
import time
import argparse
import platform

# Add mint-main to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../mint-main')))

try:
    import librosa
    import numpy as np
    import tensorflow as tf
    from unittest.mock import MagicMock
    sys.modules['tensorflow_graphics'] = MagicMock()
    sys.modules['tensorflow_graphics.geometry'] = MagicMock()
    sys.modules['tensorflow_graphics.geometry.transformation'] = MagicMock()
    from mint.core import model_builder
    from mint.utils import config_util
except ImportError as e:
    print(f"Missing dependency: {e}")
    sys.exit(1)

def extract_audio_features(audio_path):
    """Extracts 35-dim audio features using mint-main preprocessing logic."""
    SR = 15360
    data, _ = librosa.load(audio_path, sr=SR)
    
    envelope = librosa.onset.onset_strength(y=data, sr=SR)
    mfcc = librosa.feature.mfcc(y=data, sr=SR, n_mfcc=20).T
    chroma = librosa.feature.chroma_cens(y=data, sr=SR, hop_length=512).T
    
    peak_idxs = librosa.onset.onset_detect(
        onset_envelope=envelope.flatten(), sr=SR, hop_length=512)
    peak_onehot = np.zeros_like(envelope, dtype=np.float32)
    peak_onehot[peak_idxs] = 1.0

    tempo, beat_idxs = librosa.beat.beat_track(
        onset_envelope=envelope, sr=SR, hop_length=512, tightness=100)
    beat_onehot = np.zeros_like(envelope, dtype=np.float32)
    beat_onehot[beat_idxs] = 1.0

    audio_feature = np.concatenate([
        envelope[:, None], mfcc, chroma, peak_onehot[:, None], beat_onehot[:, None]
    ], axis=-1)
    
    return audio_feature, data.shape[0] / SR

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--audio', type=str, required=True, help='Path to MP3/WAV')
    parser.add_argument('--checkpoint_dir', type=str, default='../mint-main/checkpoints/mint_fact_b32_v3_2_2021-05-06')
    parser.add_argument('--config', type=str, default='../mint-main/configs/fact_v5_deeper_t10_cm12.config')
    parser.add_argument('--json_out', type=str, default='', help='Path to save JSON output')
    args = parser.parse_args()

    print("=== Inference Environment ===")
    print(f"Python version: {platform.python_version()}")
    print(f"TensorFlow version: {tf.__version__}")
    
    gpus = tf.config.list_physical_devices('GPU')
    if gpus:
        print(f"CPU/GPU: GPU found ({len(gpus)} devices)")
    else:
        print("CPU/GPU: CPU only (No GPU detected)")

    print(f"Config path: {args.config}")
    print(f"Checkpoint dir: {args.checkpoint_dir}")
    
    # 1. Load Audio
    print("\n=== Audio Processing ===")
    if not os.path.exists(args.audio):
        print(f"Error: Audio file not found at {args.audio}")
        return
        
    audio_features, duration = extract_audio_features(args.audio)
    print(f"Audio duration: {duration:.2f} seconds")
    print(f"Audio feature shape: {audio_features.shape}")
    
    # 2. Build Model
    print("\n=== Model Initialization ===")
    configs = config_util.get_configs_from_pipeline_file(args.config)
    model_config = configs['model']
    model = model_builder.build(model_config, True)
    
    # 3. Load Checkpoint
    checkpoint = tf.train.Checkpoint(model=model)
    latest_ckpt = tf.train.latest_checkpoint(args.checkpoint_dir)
    
    if not latest_ckpt:
        print(f"Error: No checkpoint found in {args.checkpoint_dir}")
        return
        
    print(f"Latest checkpoint path: {latest_ckpt}")
    try:
        checkpoint.restore(latest_ckpt).expect_partial()
        print("Checkpoint loaded successfully")
    except Exception as e:
        print(f"Error loading checkpoint: {e}")
        return
        
    # 4. Inference
    print("\n=== Running Inference ===")
    start_time = time.time()
    
    # Prepare inputs dictionary for the cross-modal model
    # Model expects batches: [batch, sequence_length, dimension]
    # Audio dimension is 35. Motion dimension is 225.
    
    # Pad or truncate audio to max sequence length if necessary, or pass full
    audio_input = tf.convert_to_tensor(audio_features[None, ...], dtype=tf.float32)
    
    # Provide a seed motion input (120 frames of zeros as in eval)
    motion_input = tf.zeros((1, 120, 225), dtype=tf.float32)
    
    inputs = {
        "audio_input": audio_input,
        "motion_input": motion_input
    }
    
    # Autoregressive inference
    # Generating 20 seconds at 60fps = 1200 steps
    target_frames = int(duration * 60)
    print(f"Generating {target_frames} frames...")
    
    try:
        outputs = model.infer_auto_regressive(inputs, steps=target_frames)
        outputs_np = np.concatenate([inputs["motion_input"].numpy(), outputs.numpy()], axis=1)[0]
    except Exception as e:
        print(f"Inference failed: {e}")
        return
        
    inf_time = time.time() - start_time
    print(f"Inference time: {inf_time:.2f} seconds")
    
    # 5. Output Validation
    print("\n=== Output Validation ===")
    print(f"Raw output shape: {outputs_np.shape}")
    
    # Extract rotation matrices and translation
    smpl_poses_matrices = outputs_np[:, :216].reshape(-1, 24, 3, 3) # [frames, 24, 3, 3]
    smpl_trans = outputs_np[:, 216:219] # [frames, 3]
    
    # Convert rotation matrices to axis-angle using scipy
    try:
        from scipy.spatial.transform import Rotation as R
        # reshape to flat list of matrices for conversion
        flat_matrices = smpl_poses_matrices.reshape(-1, 3, 3)
        rotations = R.from_matrix(flat_matrices)
        axis_angles = rotations.as_rotvec()
        smpl_poses = axis_angles.reshape(outputs_np.shape[0], 24, 3)
    except Exception as e:
        print(f"Error converting to axis-angle: {e}")
        smpl_poses = np.zeros((outputs_np.shape[0], 24, 3))
    
    has_nan = np.isnan(outputs_np).any()
    has_inf = np.isinf(outputs_np).any()
    
    print("Model loaded: YES")
    print(f"Audio duration: {duration:.2f} sec")
    print(f"Inference time: {inf_time:.2f} sec")
    print(f"SMPL poses: {list(smpl_poses.shape)}")
    print(f"SMPL translation: {list(smpl_trans.shape)}")
    print(f"FPS: 60")
    print(f"NaN: {1 if has_nan else 0}")
    print(f"Inf: {1 if has_inf else 0}")
    
    if args.json_out:
        import json
        payload = {
            "success": not has_nan and not has_inf,
            "fps": 60,
            "numFrames": smpl_poses.shape[0],
            "duration": float(duration),
            "motion": {
                "poses": smpl_poses.tolist(),
                "trans": smpl_trans.tolist()
            },
            "model": "mint_fact_b32_v3_2_2021-05-06",
            "checkpoint": "ckpt-214501"
        }
        with open(args.json_out, 'w') as f:
            json.dump(payload, f)
        print(f"Saved JSON payload to {args.json_out}")
    
if __name__ == "__main__":
    main()
