import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';

// --- CONFIGURATION ---
const TOTAL_PANELS = 11;

// 1. DISTANCE: Set to 1.6 meters
// This reduces total walk length significantly.
const PANEL_DISTANCE = 1.6; 

// --- TEXT DATA ---
const STORY_TEXT = {
    1: `After the defeat of Ravana, Ram Rajya blossomed on earth. Peace reigned.<br><br>But the Devtas knew… Vishnu must return to Vaikuntha.<br><span class="speaker-name">Deva:</span>“Yamaraja… the moment has come. Vishnu must return.”<br>“I have tried, Indra… but I cannot reach Him.”`,
    2: `<br>“Hanuman stands guard over Ram like an unbreakable fortress.<br><br>Even death cannot approach.”<br><br><span class="speaker-name">Narration:</span>“The Devtas knew… destiny was waiting.<br>But the path to fulfill it was blocked by devotion itself.”`,
    3: `<span class="speaker-name">Narration:</span><br>Rama understood the silence behind the heavens… Destiny was calling.<br><br><span class="speaker-name">Indra:</span>“Prabhu… forgive me for speaking, but… I cannot perform my duty. Hanuman does not allow even death to come near You.”<br><br><span class="speaker-name">Ram:</span>“Yama… I know. Hanuman’s devotion is boundless. But every leela has its moment… and mine must now unfold.”`,
    4: `<span class="speaker-name">Narration:</span>“And so, in divine play, Rama let His ring fall into the depths of the earth…<br>guiding Hanuman toward the truth of time itself.”<br><br><span class="speaker-name">Ram:</span>“Hanuman… my ring has slipped below.<br>Bring it back, dear one.”`,
    5: ``, 
    6: `“With folded hands and unquestioning love,<br>Hanuman bowed.”`,
    7: `<span class="speaker-name">Vasuki:</span>“Welcome, Hanuman… child of the wind.<br>You have crossed realms untraveled by mortals.<br>Tell me… what do you seek in Naag Lok?”<br><br><span class="speaker-name">Hanuman:</span>“I seek my Lord’s ring… the symbol of His faith in me.”<br><br><span class="speaker-name">Vasuki:</span>“A ring you seek… but the truth you will find.”`,
    8: `“The cycle itself, Hanuman.<br>Rings within rings… stories within stories…”<br><br>“These rings are echoes of time itself.”<br><br>“You have been here before—<br>not once,<br>not twice,<br>but beyond the counting of gods.”`,
    9: `“Every age repeats. Every story returns.<br>And every time the cycle turns…<br>you come searching for the same ring.”<br><br>“An infinite loop… a divine test.”<br><br>“You are the constant.”<br>“You are the one who returns.”`,
    10: `“He saw himself across countless lives—<br>kneeling, praying, searching.”<br><br>“The world changes. Time changes.<br>But Hanuman remains.”`,
    11: `“As Hanuman held the ring, its light trembled…<br>the same light that once shone from Ram’s smile.”<br><br>“He understood:<br>Love like his does not end with lifetimes.”<br><br>“For Ram may leave the world—<br>but He has never once left Hanuman’s heart.”`
};

// --- SCENE SETUP ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

// --- AR BUTTON (DOM OVERLAY ACTIVE) ---
const arButton = ARButton.createButton(renderer, {
    optionalFeatures: ['dom-overlay'], 
    domOverlay: { root: document.body } 
});
document.body.appendChild(arButton);

const listener = new THREE.AudioListener();
camera.add(listener);

// --- START LOGIC ---
arButton.addEventListener('click', () => {
    const warning = document.getElementById('ar-warning');
    if (warning) warning.style.display = 'none';

    const bgMusic = document.getElementById('ar-bg-music');
    if(bgMusic) {
        bgMusic.volume = 0.2; 
        bgMusic.play().catch(e => console.log("AR BG Music blocked:", e));
    }
    
    if (listener.context.state === 'suspended') {
        listener.context.resume();
    }
});

// --- AUDIO LOAD ---
const audioLoader = new THREE.AudioLoader();
const panelAudios = {}; 
const audioPanels = [1, 2, 3, 4, 6, 7, 8, 9, 10, 11];

audioPanels.forEach(i => {
    const sound = new THREE.Audio(listener);
    audioLoader.load(`assets/audio/panel${i}.mp3`, (buffer) => {
        sound.setBuffer(buffer);
        sound.setLoop(false);
        sound.setVolume(1.0);
        panelAudios[i] = sound;
    });
});

// --- PANELS ---
const textureLoader = new THREE.TextureLoader();
const panelPositions = []; 

function createPanel(index, zPos) {
    const group = new THREE.Group();
    
    // HEIGHT: 0.0 (Neutral/Chest Level)
    group.position.set(0, 0.0, -zPos); 

    const layers = [
        { suffix: '_bg.png', z: -0.3, scale: 1.5 },
        { suffix: '_mid.png', z: -0.1, scale: 1.2 },
        { suffix: '_fg.png', z: 0.1, scale: 1.0 }
    ];

    layers.forEach(layer => {
        textureLoader.load(`assets/panels/panel${index}${layer.suffix}`, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            const aspect = tex.image.width / tex.image.height;
            const height = 1.0; 
            const width = height * aspect;

            const geo = new THREE.PlaneGeometry(width, height);
            const mat = new THREE.MeshBasicMaterial({ 
                map: tex, 
                transparent: true, 
                opacity: 0.95, 
                side: THREE.DoubleSide 
            });

            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.z = layer.z;
            mesh.scale.set(layer.scale, layer.scale, 1);
            group.add(mesh);
        });
    });
    
    scene.add(group);
    panelPositions.push({ id: index, z: -zPos });
}

for (let i = 1; i <= TOTAL_PANELS; i++) {
    createPanel(i, i * PANEL_DISTANCE);
}

const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
scene.add(light);

// --- PROXIMITY LOGIC ---
const subtitleText = document.getElementById('subtitle-text');
let currentActivePanel = -1;

function checkProximity() {
    const camPos = new THREE.Vector3();
    camera.getWorldPosition(camPos);
    
    let closestPanel = -1;
    let closestDist = 9999;

    panelPositions.forEach(p => {
        const dist = Math.abs(camPos.z - p.z);
        
        // 2. TRIGGER UPDATE: Reduced to 0.8m
        // Since panels are 1.6m apart, 0.8m is the perfect midpoint.
        if (dist < 0.8) {
            if (dist < closestDist) {
                closestDist = dist;
                closestPanel = p.id;
            }
        }
    });

    if (closestPanel !== -1 && closestPanel !== currentActivePanel) {
        
        if (currentActivePanel !== -1 && panelAudios[currentActivePanel] && panelAudios[currentActivePanel].isPlaying) {
            panelAudios[currentActivePanel].stop();
        }

        if (panelAudios[closestPanel]) {
            panelAudios[closestPanel].play();
        }

        const text = STORY_TEXT[closestPanel];
        if (text) {
            subtitleText.innerHTML = text;
            subtitleText.classList.add('visible');
        } else {
            subtitleText.classList.remove('visible');
        }

        currentActivePanel = closestPanel;
    }
}

renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
    checkProximity(); 
});