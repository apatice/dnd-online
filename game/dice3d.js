/* dice3d.js - Three.js Magic Dice Implementation with Numbers on Faces */

let diceScene, diceCamera, diceRenderer, diceMesh;
let isRolling3D = false;
let rollAnimationId;
let currentRotationSpeed = { x: 0, y: 0, z: 0 };
let diceFaces = [];
let targetQuaternion = null;

function initThreeJSDice() {
    const canvas = document.getElementById('diceCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    diceScene = new THREE.Scene();
    
    diceCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    diceCamera.position.z = 5.5;

    diceRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    diceRenderer.setSize(160, 160);
    diceRenderer.setPixelRatio(window.devicePixelRatio);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    diceScene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffd700, 1.2, 20);
    pointLight.position.set(2, 3, 4);
    diceScene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xffaa00, 0.8, 20);
    pointLight2.position.set(-3, -2, -3);
    diceScene.add(pointLight2);

    updateDiceGeometry(20); // Default D20

    animateIdle();
}

function getGeometryForSides(sides) {
    switch(sides) {
        case 4: return new THREE.TetrahedronGeometry(1.5);
        case 6: return new THREE.BoxGeometry(2, 2, 2);
        case 8: return new THREE.OctahedronGeometry(1.5);
        case 10: return new THREE.IcosahedronGeometry(1.5); // Use D20 numbered 1-10 twice
        case 12: return new THREE.DodecahedronGeometry(1.5);
        case 20: return new THREE.IcosahedronGeometry(1.5);
        case 100: return new THREE.IcosahedronGeometry(1.5); // Use D20 numbered 10-100 twice
        default: return new THREE.IcosahedronGeometry(1.5);
    }
}

function addNumbersToMesh(mesh, sides) {
    const geo = mesh.geometry;
    geo.computeVertexNormals();
    
    const positions = geo.attributes.position.array;
    const indices = geo.index ? geo.index.array : null;
    
    const triangles = [];
    const numTriangles = indices ? indices.length / 3 : positions.length / 9;
    
    for (let i = 0; i < numTriangles; i++) {
        let vA, vB, vC;
        if (indices) {
            vA = new THREE.Vector3(positions[indices[i*3]*3], positions[indices[i*3]*3+1], positions[indices[i*3]*3+2]);
            vB = new THREE.Vector3(positions[indices[i*3+1]*3], positions[indices[i*3+1]*3+1], positions[indices[i*3+1]*3+2]);
            vC = new THREE.Vector3(positions[indices[i*3+2]*3], positions[indices[i*3+2]*3+1], positions[indices[i*3+2]*3+2]);
        } else {
            vA = new THREE.Vector3(positions[i*9], positions[i*9+1], positions[i*9+2]);
            vB = new THREE.Vector3(positions[i*9+3], positions[i*9+4], positions[i*9+5]);
            vC = new THREE.Vector3(positions[i*9+6], positions[i*9+7], positions[i*9+8]);
        }
        
        const cb = new THREE.Vector3().subVectors(vC, vB);
        const ab = new THREE.Vector3().subVectors(vA, vB);
        const normal = new THREE.Vector3().crossVectors(cb, ab).normalize();
        const centroid = new THREE.Vector3().add(vA).add(vB).add(vC).divideScalar(3);
        
        triangles.push({ normal, centroid, vA, vB, vC });
    }
    
    const logicalFaces = [];
    triangles.forEach(t => {
        let found = logicalFaces.find(f => f.normal.dot(t.normal) > 0.99);
        if (found) found.triangles.push(t);
        else logicalFaces.push({ normal: t.normal, triangles: [t] });
    });
    
    // Sort faces somewhat deterministically based on normal coordinates
    logicalFaces.sort((a, b) => a.normal.y - b.normal.y || a.normal.x - b.normal.x);
    
    const facesOutput = [];
    
    logicalFaces.forEach((face, idx) => {
        const faceCentroid = new THREE.Vector3();
        face.triangles.forEach(t => faceCentroid.add(t.centroid));
        faceCentroid.divideScalar(face.triangles.length);
        
        let num;
        if (sides === 10) {
            num = (idx % 10) + 1; // 1-10 twice
        } else if (sides === 100) {
            num = ((idx % 10) + 1) * 10; // 10, 20... 100
        } else {
            num = idx + 1;
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 128, 128);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 70px "Cinzel Decorative", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let text = num.toString();
        ctx.fillText(text, 64, 64);
        if (text === "9") ctx.fillRect(44, 100, 40, 4);
        
        const tex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
        
        let size = sides === 20 || sides === 10 || sides === 100 ? 0.7 : sides === 12 ? 0.8 : 1.0;
        const planeGeo = new THREE.PlaneGeometry(size, size);
        const plane = new THREE.Mesh(planeGeo, mat);
        
        // Push out slightly along normal to avoid clipping
        plane.position.copy(faceCentroid).add(face.normal.clone().multiplyScalar(0.05));
        
        // Orient plane to face outward
        const target = plane.position.clone().add(face.normal);
        plane.lookAt(target);
        
        mesh.add(plane);
        
        facesOutput.push({ number: num, normal: face.normal, plane: plane });
    });
    
    return facesOutput;
}

function updateDiceGeometry(sides) {
    if (diceMesh) diceScene.remove(diceMesh);
    
    const material = new THREE.MeshStandardMaterial({
        color: 0x1a0d00,
        emissive: 0x221100,
        roughness: 0.3,
        metalness: 0.8,
        flatShading: true
    });

    const newGeo = getGeometryForSides(sides);
    diceMesh = new THREE.Mesh(newGeo, material);
    
    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.4 });
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(newGeo), edgesMaterial);
    diceMesh.add(edges);
    
    diceFaces = addNumbersToMesh(diceMesh, sides);
    
    diceScene.add(diceMesh);
    diceMesh.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
}

function animateIdle() {
    if (!isRolling3D && diceRenderer && diceScene && diceCamera) {
        diceMesh.rotation.x += 0.005;
        diceMesh.rotation.y += 0.01;
        diceRenderer.render(diceScene, diceCamera);
    }
    rollAnimationId = requestAnimationFrame(animateIdle);
}

function rollThreeJSDice(sides, result, onComplete) {
    if (isRolling3D) return;
    isRolling3D = true;
    
    cancelAnimationFrame(rollAnimationId);
    
    updateDiceGeometry(sides);
    
    // Hide overlay text, we don't need it since numbers are on faces!
    const overlay = document.getElementById('dice3dOverlayText');
    if (overlay) overlay.style.display = 'none';

    // Find the face that matches the result
    let targetFace = diceFaces.find(f => f.number === result);
    
    // For d100, the result might be e.g. 42, but physical faces only have 10, 20... 100
    if (!targetFace && sides === 100) {
        const tens = Math.max(10, Math.ceil(result / 10) * 10);
        targetFace = diceFaces.find(f => f.number === tens) || diceFaces[0];
    } else if (!targetFace) {
        targetFace = diceFaces[0]; // safety fallback
    }
    
    // Create random tumbling rotation
    currentRotationSpeed = {
        x: (Math.random() * 20 + 20),
        y: (Math.random() * 20 + 20),
        z: (Math.random() * 20 + 20)
    };

    let startTime = performance.now();
    const rollDuration = 1500; // ms

    function animateRoll(time) {
        const elapsed = time - startTime;
        let progress = elapsed / rollDuration;
        
        if (progress > 1) progress = 1;

        const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        
        // Tumbling phase
        if (progress < 0.8) {
            diceMesh.rotation.x += currentRotationSpeed.x * 0.01 * (1 - ease);
            diceMesh.rotation.y += currentRotationSpeed.y * 0.01 * (1 - ease);
            diceMesh.rotation.z += currentRotationSpeed.z * 0.01 * (1 - ease);
        } else {
            // Snapping phase (last 20%)
            if (!targetQuaternion) {
                // Calculate target rotation to make the target face point at camera (0, 0, 1)
                const cameraNormal = new THREE.Vector3(0, 0, 1);
                targetQuaternion = new THREE.Quaternion().setFromUnitVectors(targetFace.normal, cameraNormal);
                
                // Keep the current rotation to interpolate FROM
                diceMesh.userData.startQuat = diceMesh.quaternion.clone();
            }
            
            // Interpolate smoothly to the target quaternion
            const snapProgress = (progress - 0.8) / 0.2;
            const smoothSnap = 1 - Math.pow(1 - snapProgress, 3);
            diceMesh.quaternion.slerpQuaternions(diceMesh.userData.startQuat, targetQuaternion, smoothSnap);
        }

        diceRenderer.render(diceScene, diceCamera);

        if (progress < 1) {
            requestAnimationFrame(animateRoll);
        } else {
            // Roll finished
            isRolling3D = false;
            targetQuaternion = null;
            
            // Highlight winning face
            diceFaces.forEach(f => {
                f.plane.material.opacity = f === targetFace ? 1.0 : 0.2;
            });
            
            if (onComplete) onComplete();
            
            // Wait a few seconds before returning to idle
            setTimeout(() => {
                if (!isRolling3D) {
                    diceFaces.forEach(f => f.plane.material.opacity = 1.0);
                    animateIdle();
                }
            }, 3000);
        }
    }

    requestAnimationFrame(animateRoll);
}

document.addEventListener('DOMContentLoaded', initThreeJSDice);
