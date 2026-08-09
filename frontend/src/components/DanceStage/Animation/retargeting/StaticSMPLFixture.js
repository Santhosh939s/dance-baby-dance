/**
 * A static test fixture containing raw SMPL axis-angle frames.
 * This simulates the output of `mint-main` for testing the SMPL ➔ Avatar retargeting pipeline.
 */

const generateStaticFixture = () => {
  const fps = 30;
  const duration = 3; // 3 seconds
  const numFrames = fps * duration;

  const smplPoses = [];
  const smplTrans = [];

  for (let i = 0; i < numFrames; i++) {
    // 24 joints, each is [x, y, z] axis-angle
    const framePoses = Array.from({ length: 24 }, () => [0, 0, 0]);
    const progress = i / numFrames; // 0.0 to 1.0

    // Sine wave for smooth motion
    const wave = Math.sin(progress * Math.PI); // 0 to 1 back to 0

    // Joint 16: L_Shoulder (raise arm)
    // Rotating around Z-axis by some angle
    framePoses[16] = [0, 0, wave * 1.5];

    // Joint 17: R_Shoulder (raise arm)
    framePoses[17] = [0, 0, -wave * 1.5];

    // Joint 0: Pelvis (sway hips)
    framePoses[0] = [0, wave * 0.5, 0];
    
    // Translation: bounce up and down slightly
    const trans = [wave * 0.1, -wave * 0.1, 0];

    smplPoses.push(framePoses);
    smplTrans.push(trans);
  }

  return { smplPoses, smplTrans, fps };
};

export const StaticSMPLFixture = generateStaticFixture();
