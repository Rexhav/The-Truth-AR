import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';

// --- 1. LANGUAGE CONFIGURATION ---
const urlParams = new URLSearchParams(window.location.search);
const currentLang = urlParams.get('lang') || 'en';
console.log("AR Reality Mode. Language:", currentLang);

// --- CONFIGURATION ---
const TOTAL_PANELS = 11;
const PANEL_DISTANCE = 1.35; 

// --- VR STATE ---
let isVR = false;
const eyeSeparation = 0.06; // 6cm (Standard human IPD)

// --- 2. BILINGUAL TEXT DATA ---
const STORY_DATA = {
    1: {
        en: `After the defeat of Ravana, Ram Rajya blossomed on earth. Peace reigned.<br><br>But the Devtas knew… Vishnu must return to Vaikuntha.<br><span class="speaker-name">Deva:</span>“Yamaraja… the moment has come. Vishnu must return.”<br>“I have tried, Indra… but I cannot reach Him.”`,
        hi: `रावण वध के बाद, पृथ्वी पर राम राज्य खिल उठा। शांति का वास था।<br><br>परंतु देवता जानते थे... विष्णु को वैकुंठ लौटना होगा।<br><span class="speaker-name">देव:</span>“यमराज... वह क्षण आ गया है। विष्णु को लौटना होगा।”<br>“मैंने प्रयास किया इंद्र... पर मैं उन तक पहुँच नहीं पा रहा।”`
    },
    2: {
        en: `<br>“Hanuman stands guard over Ram like an unbreakable fortress.<br><br>Even death cannot approach.”<br><br><span class="speaker-name">Narration:</span>“The Devtas knew… destiny was waiting.<br>But the path to fulfill it was blocked by devotion itself.”`,
        hi: `<br>“हनुमान राम के चारों ओर एक अभेद्य किले की तरह खड़े हैं।<br><br>स्वयं मृत्यु भी समीप नहीं आ सकती।”<br><br><span class="speaker-name">कथावाचक:</span>“देवता जानते थे... नियति प्रतीक्षा कर रही थी।<br>परंतु भक्ति ने उसका मार्ग रोक रखा था।”`
    },
    3: {
        en: `<span class="speaker-name">Narration:</span><br>Rama understood the silence behind the heavens… Destiny was calling.<br><br><span class="speaker-name">YAMRAJ:</span>“Prabhu… forgive me for speaking, but… I cannot perform my duty. Hanuman does not allow even death to come near You.”<br><br><span class="speaker-name">Ram:</span>“Yama… I know. Hanuman’s devotion is boundless. But every leela has its moment… and mine must now unfold.”`,
        hi: `<span class="speaker-name">कथावाचक:</span><br>राम स्वर्ग के पीछे का मौन समझ गए... नियति पुकार रही थी।<br><br><span class="speaker-name">यमराज:</span>“प्रभु... क्षमा करें, परंतु... मैं अपना कर्तव्य नहीं निभा पा रहा। हनुमान मृत्यु को भी आपके निकट नहीं आने देते।”<br><br><span class="speaker-name">राम:</span>“यम... मैं जानता हूँ। हनुमान की भक्ति अनंत है। पर हर लीला का एक समय होता है... और मेरा समय अब आ गया है।”`
    },
    4: {
        en: `<span class="speaker-name">Narration:</span>“And so, in divine play, Rama let His ring fall into the depths of the earth…<br>guiding Hanuman toward the truth of time itself.”<br><br><span class="speaker-name">Ram:</span>“Hanuman… my ring has slipped below.<br>Bring it back, dear one.”`,
        hi: `<span class="speaker-name">कथावाचक:</span>“और इस प्रकार, अपनी लीला में, राम ने अपनी अंगूठी पाताल की गहराइयों में गिरा दी...<br>हनुमान को समय के सत्य की ओर ले जाने के लिए।”<br><br><span class="speaker-name">राम:</span>“हनुमान... मेरी अंगूठी नीचे गिर गई है।<br>उसे ले आओ, प्रिय।”`
    },
    5: { en: ``, hi: `` }, 
    6: {
        en: `“With folded hands and unquestioning love,<br>Hanuman bowed.”`,
        hi: `“जुड़े हुए हाथों और निस्वार्थ प्रेम के साथ,<br>हनुमान नतमस्तक हुए।”`
    },
    7: {
        en: `<span class="speaker-name">Vasuki:</span>“Welcome, Hanuman… child of the wind.<br>You have crossed realms untraveled by mortals.<br>Tell me… what do you seek in Naag Lok?”<br><br><span class="speaker-name">Hanuman:</span>“I seek my Lord’s ring… the symbol of His faith in me.”<br><br><span class="speaker-name">Vasuki:</span>“A ring you seek… but the truth you will find.”`,
        hi: `<span class="speaker-name">वासुकी:</span>“स्वागत है, हनुमान... पवन पुत्र।<br>तुमने उन लोकों को पार किया है जहाँ मनुष्य नहीं जा सकते।<br>कहो... नाग लोक में क्या खोज रहे हो?”<br><br><span class="speaker-name">हनुमान:</span>“मैं अपने प्रभु की अंगूठी खोज रहा हूँ... मुझ पर उनके विश्वास का प्रतीक।”<br><br><span class="speaker-name">वासुकी:</span>“तुम अंगूठी खोज रहे हो... पर तुम्हें सत्य मिलेगा।”`
    },
    8: {
        en: `“The cycle itself, Hanuman.<br>Rings within rings… stories within stories…”<br><br>“These rings are echoes of time itself.”<br><br>“You have been here before—<br>not once,<br>not twice,<br>but beyond the counting of gods.”`,
        hi: `“यह स्वयं कालचक्र है, हनुमान।<br>अंगूठियों के भीतर अंगूठियां... कहानियों के भीतर कहानियां...”<br><br>“ये अंगूठियां समय की प्रतिध्वनि हैं।”<br><br>“तुम यहाँ पहले भी आ चुके हो—<br>एक बार नहीं,<br>दो बार नहीं,<br>बल्कि अनगिनत बार।”`
    },
    9: {
        en: `“Every age repeats. Every story returns.<br>And every time the cycle turns…<br>you come searching for the same ring.”<br><br>“An infinite loop… a divine test.”<br><br>“You are the constant.”<br>“You are the one who returns.”`,
        hi: `“हर युग दोहराता है। हर कहानी लौटती है।<br>और हर बार जब चक्र घूमता है...<br>तुम उसी अंगूठी की खोज में आते हो।”<br><br>“एक अनंत चक्र... एक दिव्य परीक्षा।”<br><br>“तुम ही स्थिर हो।”<br>“तुम ही हो जो लौटते हो।”`
    },
    10: {
        en: `“He saw himself across countless lives—<br>kneeling, praying, searching.”<br><br>“The world changes. Time changes.<br>But Hanuman remains.”`,
        hi: `“उन्होंने अपने आप को अनगिनत जन्मों में देखा—<br>प्रार्थना करते हुए, खोजते हुए।”<br><br>“संसार बदलता है। समय बदलता है।<br>परंतु हनुमान वही रहते हैं।”`
    },
    11: {
        en: `“As Hanuman held the ring, its light trembled…<br>the same light that once shone from Ram’s smile.”<br><br>“He understood:<br>Love like his does not end with lifetimes.”<br><br>“For Ram may leave the world—<br>but He has never once left Hanuman’s heart.”`,
        hi: `“जैसे ही हनुमान ने अंगूठी पकड़ी, उसका प्रकाश कांप उठा...<br>वही प्रकाश जो कभी राम की मुस्कान से चमकता था।”<br><br>“वे समझ गए:<br>उनका प्रेम जीवन के साथ समाप्त नहीं होता।”<br><br>“राम संसार छोड़ सकते हैं—<br>परंतु वे हनुमान के हृदय से कभी नहीं गए।”`
    }
};

// --- SCENE SETUP ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

// --- AR BUTTON (Standard WebXR Button) ---
const arButton = ARButton.createButton(renderer, {
    optionalFeatures: ['dom-overlay'], 
    domOverlay: { root: document.body } 
});
document.body.appendChild(arButton);

const listener = new THREE.AudioListener();
camera.add(listener);

// --- WORLD GROUP (The "Tunnel") ---
const worldGroup = new THREE.Group();
scene.add(worldGroup);

// --- AUDIO LOAD ---
const audioLoader = new THREE.AudioLoader();
const panelAudios = {}; 
const audioPanels = [1, 2, 3, 4, 6, 7, 8, 9, 10, 11];

audioPanels.forEach(i => {
    const sound = new THREE.Audio(listener);
    const audioPath = `assets/audio/panel${i}_${currentLang}.mp3`;
    
    audioLoader.load(audioPath, (buffer) => {
        sound.setBuffer(buffer);
        sound.setLoop(false);
        sound.setVolume(1.0);
        panelAudios[i] = sound;
    }, undefined, (err) => console.warn(`Missing AR audio: ${audioPath}`));
});

// --- PANELS ---
const textureLoader = new THREE.TextureLoader();
const panelPositions = []; 

function createPanel(index, zPos) {
    const group = new THREE.Group();
    // Position inside the worldGroup
    group.position.set(0, 0.0, -zPos); 

    const layers = [
        { suffix: '_bg.png', z: -0.3, scale: 1.5 },
        { suffix: '_mid.png', z: -0.1, scale: 1.2 },
        { suffix: '_fg.png', z: 0.1, scale: 1.0 }
    ];

    layers.forEach(layer => {
        const path = `assets/panels/panel${index}${layer.suffix}`;
        textureLoader.load(path, (tex) => {
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
    
    worldGroup.add(group);
    panelPositions.push({ id: index, z: -zPos });
}

for (let i = 1; i <= TOTAL_PANELS; i++) {
    createPanel(i, i * PANEL_DISTANCE);
}

const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
scene.add(light);


// --- VR BUTTON LOGIC ---
const vrBtn = document.getElementById('vr-btn');
if (vrBtn) {
    vrBtn.addEventListener('click', () => {
        isVR = !isVR;
        const warning = document.getElementById('ar-warning');
        
        if (isVR) {
            vrBtn.style.background = "#FFD700";
            vrBtn.style.color = "#000";
            vrBtn.innerHTML = "EXIT VR";
            
            // For VR, we prefer a black background to block real world distractions
            document.body.style.background = "#000";
            if(renderer.domElement) renderer.domElement.style.background = "#000";

            // Hide UI
            if(warning) warning.style.display = 'none';

        } else {
            vrBtn.style.background = "rgba(0,0,0,0.6)";
            vrBtn.style.color = "#FFD700";
            vrBtn.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 6H9v-2h2v2zm4 0h-2v-2h2v2z"/></svg> VR MODE`;

            // Back to AR (Transparent)
            document.body.style.background = "transparent";
            if(renderer.domElement) renderer.domElement.style.background = "transparent";
            
            // Reset Camera
            renderer.setScissorTest(false);
            renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
        }
        
        onWindowResize(); // Force resize to clean up
    });
}

// Handle Resize
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


// --- START LOGIC (AR SESSION) ---
arButton.addEventListener('click', () => {
    // 1. Hide warning
    const warning = document.getElementById('ar-warning');
    if (warning) warning.style.display = 'none';

    // 2. Play BG Music
    const bgMusic = document.getElementById('ar-bg-music');
    if(bgMusic) {
        bgMusic.volume = 0.2; 
        bgMusic.play().catch(e => console.log("AR BG Music blocked:", e));
    }
    
    // 3. Wake up Audio Context
    if (listener.context.state === 'suspended') {
        listener.context.resume();
    }

    // 4. SHOW GESTURE GUIDE
    const guide = document.getElementById('gesture-guide');
    if(guide) {
        setTimeout(() => { guide.style.opacity = '1'; }, 1000);
        setTimeout(() => { guide.style.opacity = '0'; }, 7000);
    }
});


// --- INTERACTION: DRAG & PINCH ---
let touchStartX = 0;
let isDragging = false;
let initialDistance = 0;

document.body.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        isDragging = true;
        touchStartX = e.touches[0].clientX;
    } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialDistance = Math.sqrt(dx * dx + dy * dy);
    }
});

document.body.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1 && isDragging) {
        const deltaX = e.touches[0].clientX - touchStartX;
        worldGroup.rotation.y -= deltaX * 0.005; 
        touchStartX = e.touches[0].clientX;
    } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);
        const delta = currentDistance - initialDistance;
        
        worldGroup.position.z += delta * 0.01; 
        initialDistance = currentDistance;
    }
});

document.body.addEventListener('touchend', () => {
    isDragging = false;
});


// --- PROXIMITY LOGIC ---
const subtitleText = document.getElementById('subtitle-text');
let currentActivePanel = -1;

function checkProximity() {
    const camPos = new THREE.Vector3();
    camera.getWorldPosition(camPos);
    
    let closestPanel = -1;
    let closestDist = 9999;

    panelPositions.forEach(p => {
        const panelWorldPos = new THREE.Vector3(0, 0, p.z);
        panelWorldPos.applyMatrix4(worldGroup.matrixWorld);

        const dist = camPos.distanceTo(panelWorldPos);
        
        if (dist < 1.2) { 
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

        const textData = STORY_DATA[closestPanel];
        const textRaw = textData ? textData[currentLang] : "";
        
        if (textRaw) {
            subtitleText.innerHTML = textRaw;
            subtitleText.classList.add('visible');

            if (currentLang === 'hi') {
                subtitleText.style.fontFamily = "'Rozha One', serif";
                subtitleText.style.fontSize = "1.5rem";
                subtitleText.style.lineHeight = "1.5";
            } else {
                subtitleText.style.fontFamily = "'Cinzel', serif";
                subtitleText.style.fontSize = "1.2rem";
                subtitleText.style.lineHeight = "1.3";
            }
        } else {
            subtitleText.classList.remove('visible');
        }

        currentActivePanel = closestPanel;
    }
}


// --- MAIN RENDER LOOP (WITH VR SUPPORT) ---
renderer.setAnimationLoop(() => {
    
    // Check Logic (Audio/Distance)
    checkProximity();

    if (isVR) {
        // --- VR SPLIT SCREEN MODE ---
        const width = window.innerWidth;
        const height = window.innerHeight;

        renderer.setScissorTest(true);

        // 1. LEFT EYE
        renderer.setScissor(0, 0, width / 2, height);
        renderer.setViewport(0, 0, width / 2, height);
        
        camera.position.x -= eyeSeparation / 2; // Move cam left
        renderer.render(scene, camera);
        camera.position.x += eyeSeparation / 2; // Reset

        // 2. RIGHT EYE
        renderer.setScissor(width / 2, 0, width / 2, height);
        renderer.setViewport(width / 2, 0, width / 2, height);
        
        camera.position.x += eyeSeparation / 2; // Move cam right
        renderer.render(scene, camera);
        camera.position.x -= eyeSeparation / 2; // Reset

    } else {
        // --- STANDARD AR MODE ---
        renderer.setScissorTest(false);
        renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
        renderer.render(scene, camera);
    }
});