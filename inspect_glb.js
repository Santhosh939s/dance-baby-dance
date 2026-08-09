const fs = require('fs');
const path = require('path');

function inspectGLB(filePath) {
  console.log(`\nInspecting ${path.basename(filePath)}...`);
  try {
    const buffer = fs.readFileSync(filePath);
    // GLB header is 12 bytes
    // magic (4), version (4), length (4)
    const magic = buffer.readUInt32LE(0);
    if (magic !== 0x46546C67) { // 'glTF'
      console.log('Not a valid GLB file');
      return;
    }

    // Chunk 0 is JSON
    const chunkLength = buffer.readUInt32LE(12);
    const chunkType = buffer.readUInt32LE(16);
    if (chunkType !== 0x4E4F534A) { // 'JSON'
      console.log('First chunk is not JSON');
      return;
    }

    const jsonBuffer = buffer.slice(20, 20 + chunkLength);
    const jsonStr = jsonBuffer.toString('utf8');
    const gltf = JSON.parse(jsonStr);

    if (!gltf.nodes) {
      console.log('No nodes found in GLTF');
      return;
    }

    // Find nodes that are joints. Usually they are referenced in skins
    let jointNodeIndices = new Set();
    if (gltf.skins) {
      gltf.skins.forEach(skin => {
        if (skin.joints) {
          skin.joints.forEach(j => jointNodeIndices.add(j));
        }
      });
    }

    const allBones = [];
    gltf.nodes.forEach((node, i) => {
      if (jointNodeIndices.has(i) || (node.name && node.name.toLowerCase().includes('mixamorig'))) {
        allBones.push(node.name || `Node_${i}`);
      }
    });

    console.log(`Found ${allBones.length} bone-like nodes.`);
    console.log(allBones.slice(0, 15).join(', ') + (allBones.length > 15 ? '...' : ''));
    
    // Also let's print the actual full list if small enough
    if (allBones.length > 0 && allBones.length <= 100) {
        console.log('\nFull Skeleton hierarchy names:');
        console.log(allBones);
    }
  } catch (e) {
    console.error('Error parsing GLB:', e.message);
  }
}

const malePath = path.join(__dirname, 'frontend/public/dance-assets/avatars/male/male.glb');
const femalePath = path.join(__dirname, 'frontend/public/dance-assets/avatars/female/female.glb');

inspectGLB(malePath);
inspectGLB(femalePath);
