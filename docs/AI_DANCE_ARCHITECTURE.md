# AI Choreography Architecture (Phase 5)

This document outlines the mathematical and architectural conventions used to translate raw AI motion predictions (from `mint-main` / AIST++) into fluid movements on arbitrary GLB avatars in Three.js.

## Pipeline Overview

```text
Audio
  ↓ [mint-main FACT model]
SMPL Array (Axis-Angle)
  ↓ [SMPLRetargeter]
Normalized Humanoid Motion (JSON, Quaternions)
  ↓ [HumanoidRetargeter]
THREE.AnimationClip
  ↓ [MotionAdapter]
Avatar (male.glb / female.glb)
```

---

## 1. Coordinate Systems (PHASE C)

We must bridge two completely different coordinate environments.

### 1.1 SMPL Coordinate Convention
- **Up Axis:** Y-up
- **Forward Axis:** Z-forward (or -Z forward, depending on the exporter variation. We observe behavior empirically based on the test fixture).
- **Format:** `[num_frames, 24, 3]` (24 joints, 3D axis-angle vectors). The vector direction is the axis of rotation, and the magnitude is the angle in radians.

### 1.2 Three.js Coordinate Convention
- **Up Axis:** Y-up
- **Forward Axis:** +Z out of the screen (Right-handed). 
- **Format:** `THREE.Quaternion(x, y, z, w)` representing rotation relative to the *parent* bone.

### 1.3 Avatar Conventions
- **Rest Pose:** Typically a T-Pose.
- **Forward Direction:** The mesh usually faces +Z.
- **Root Orientation:** `Hips` bone aligns with global Y-up, but might have baked-in rotations in the GLB export (e.g., `-Math.PI/2` on the X-axis).

*If the avatar appears to dance sideways or upside down when actual AI motion is fed, we will implement a global Coordinate Conversion step inside `SMPLRetargeter` (e.g., swapping Y/Z or negating axes) prior to constructing the `NormalizedMotion`.*

---

## 2. Rest Pose Validation (PHASE D)

A common mistake in retargeting is directly assigning an AI-predicted rotation to a GLB bone. This ignores the bone's native **Rest Pose**.

### 2.1 The Mathematics of Retargeting

Let:
- $Q_{rest}$ = The quaternion of the GLB bone in its original, unmodified T-pose.
- $Q_{smpl}$ = The quaternion derived from the AI's axis-angle prediction for that frame.

The current implementation assumes $Q_{smpl}$ is a **local offset** from a standard T-pose. Therefore, to apply the AI's motion to our specific avatar, we calculate:

$$ Q_{final} = Q_{rest} \times Q_{smpl} $$

(In Three.js code: `restQuat.clone().multiply(offsetQuat)`)

### 2.2 Deep Validation (Future-Proofing)
If $Q_{smpl}$ provided by `mint-main` is *absolute* (relative to global space) rather than *local* (relative to the parent), or if the SMPL "rest pose" is not a T-Pose (e.g., an A-Pose), the math becomes:

$$ Q_{final} = Q_{avatar\_rest} \times (Q_{smpl\_rest}^{-1} \times Q_{smpl}) $$

Currently, the `StaticSMPLFixture` correctly animates the avatar using the simplified $Q_{rest} \times Q_{smpl}$ assumption, proving the local-offset theory holds for now. When real AI motion is injected, we will validate this against actual frame data.

---

## 3. Retargeter Responsibilities

### 3.1 SMPLRetargeter
- Maps indices (0-23) to `NormalizedMotion` names (e.g., `hips`, `leftUpperLeg`).
- Converts length-magnitude vectors to `THREE.Quaternion`.
- Enforces FPS and duration limits.
- **Never** interacts with the Three.js scene graph.

### 3.2 HumanoidRetargeter
- Traverses the loaded `.glb` to cache UUIDs and Rest Poses.
- Resolves normalized names (e.g., `leftUpperLeg`) to actual bones (e.g., `mixamorig:LeftUpLeg` or `LeftUpLeg`) using `humanoidBoneMap.js`.
- Bakes the animation tracks into a `THREE.AnimationClip`.
