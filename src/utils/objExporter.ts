import * as THREE from 'three';

/**
 * Exports Three.js meshes to Wavefront OBJ format text string
 */
export function exportSceneToOBJ(scene: THREE.Group | THREE.Scene, title = 'cyra_avatar_creation'): void {
  let output = `# Cyra Creator Studio - 3D Export
# Creation: ${title}
# Date: ${new Date().toISOString()}

`;

  let vertexOffset = 0;
  let normalOffset = 0;
  let uvOffset = 0;

  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.visible) {
      const geometry = child.geometry;
      if (!geometry) return;

      const name = child.name || `Object_${child.id}`;
      output += `o ${name}\n`;

      // Get world matrix
      child.updateMatrixWorld(true);
      const matrix = child.matrixWorld;

      // Positions
      const posAttr = geometry.getAttribute('position');
      if (posAttr) {
        const v = new THREE.Vector3();
        for (let i = 0; i < posAttr.count; i++) {
          v.fromBufferAttribute(posAttr, i);
          v.applyMatrix4(matrix);
          output += `v ${v.x.toFixed(4)} ${v.y.toFixed(4)} ${v.z.toFixed(4)}\n`;
        }
      }

      // Normals
      const normAttr = geometry.getAttribute('normal');
      if (normAttr) {
        const normalMatrix = new THREE.Matrix3().getNormalMatrix(matrix);
        const n = new THREE.Vector3();
        for (let i = 0; i < normAttr.count; i++) {
          n.fromBufferAttribute(normAttr, i);
          n.applyMatrix3(normalMatrix).normalize();
          output += `vn ${n.x.toFixed(4)} ${n.y.toFixed(4)} ${n.z.toFixed(4)}\n`;
        }
      }

      // UVs
      const uvAttr = geometry.getAttribute('uv');
      if (uvAttr) {
        for (let i = 0; i < uvAttr.count; i++) {
          output += `vt ${uvAttr.getX(i).toFixed(4)} ${uvAttr.getY(i).toFixed(4)}\n`;
        }
      }

      // Faces (indices)
      const indexAttr = geometry.getIndex();
      if (indexAttr) {
        for (let i = 0; i < indexAttr.count; i += 3) {
          const a = indexAttr.getX(i) + 1 + vertexOffset;
          const b = indexAttr.getX(i + 1) + 1 + vertexOffset;
          const c = indexAttr.getX(i + 2) + 1 + vertexOffset;

          if (uvAttr && normAttr) {
            const uva = a + uvOffset - vertexOffset;
            const uvb = b + uvOffset - vertexOffset;
            const uvc = c + uvOffset - vertexOffset;
            const na = a + normalOffset - vertexOffset;
            const nb = b + normalOffset - vertexOffset;
            const nc = c + normalOffset - vertexOffset;
            output += `f ${a}/${uva}/${na} ${b}/${uvb}/${nb} ${c}/${uvc}/${nc}\n`;
          } else if (normAttr) {
            const na = a + normalOffset - vertexOffset;
            const nb = b + normalOffset - vertexOffset;
            const nc = c + normalOffset - vertexOffset;
            output += `f ${a}//${na} ${b}//${nb} ${c}//${nc}\n`;
          } else {
            output += `f ${a} ${b} ${c}\n`;
          }
        }
      } else if (posAttr) {
        for (let i = 0; i < posAttr.count; i += 3) {
          const a = i + 1 + vertexOffset;
          const b = i + 2 + vertexOffset;
          const c = i + 3 + vertexOffset;
          output += `f ${a} ${b} ${c}\n`;
        }
      }

      if (posAttr) vertexOffset += posAttr.count;
      if (normAttr) normalOffset += normAttr.count;
      if (uvAttr) uvOffset += uvAttr.count;

      output += '\n';
    }
  });

  // Download trigger
  const blob = new Blob([output], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.obj`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
