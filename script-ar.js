import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';

// --- CONFIGURATION ---
const TOTAL_PANELS = 11;
const PANEL_DISTANCE = 2.0; // Panels are 2 meters apart

// --- SETUP ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true; // Enable AR
document.body.appendChild(renderer.domElement);

// --- AR BUTTON + MUSIC ---
const arButton = ARButton.createButton(renderer);
document.body.appendChild(arButton);

// Play music when user clicks "START AR"
arButton.addEventListener('click', () => {
    const music = document.getElementById('ar-bg-music');
    if(music) {
        music.volume = 0.4;
        music.play().catch(e => console.log("AR Audio error:", e));
    }
});

// --- ASSETS ---
const textureLoader = new THREE.TextureLoader();

function createPanel(index, zPos) {
    const group = new THREE.Group();
    // Position: X=0, Y=1.6m (Eye Level), Z=-Distance
    group.position.set(0, 1.6, -zPos); 

    const layers = [
        { suffix: '_bg.png', z: -0.3, scale: 1.5 },
        { suffix: '_mid.png', z: -0.1, scale: 1.2 },
        { suffix: '_fg.png', z: 0.1, scale: 1.0 }
    ];

    layers.forEach(layer => {
        textureLoader.load(`assets/panels/panel${index}${layer.suffix}`, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            const aspect = tex.image.width / tex.image.height;
            const height = 1.0; // 1 Meter tall
            const width = height * aspect;

            const geo = new THREE.PlaneGeometry(width, height);
            const mat = new THREE.MeshBasicMaterial({ 
                map: tex, 
                transparent: true, 
                opacity: 0.9, 
                side: THREE.DoubleSide // Visible from behind too
            });

            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.z = layer.z;
            mesh.scale.set(layer.scale, layer.scale, 1);
            group.add(mesh);
        });
    });
    scene.add(group);
}

// Generate the "Time Tunnel"
for (let i = 1; i <= TOTAL_PANELS; i++) {
    createPanel(i, i * PANEL_DISTANCE);
}

const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
scene.add(light);

// --- RENDER LOOP ---
renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
});