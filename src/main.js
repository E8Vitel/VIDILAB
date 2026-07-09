import '/css/styles.css'
import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// --- Escena y Cámara ---
const scene = new THREE.Scene();
const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 12;

const camera = new THREE.OrthographicCamera(
  frustumSize * aspect / -2, frustumSize * aspect / 2,
  frustumSize / 2, frustumSize / -2,
  0.1, 100
);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const canvas = renderer.domElement;
canvas.style.position = "fixed";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.pointerEvents = "none";
canvas.style.zIndex = "50";
document.body.appendChild(canvas);

// --- Luces ---
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const dirLight = new THREE.DirectionalLight(0xffffff, 3);
dirLight.position.set(5, 10, 12);
scene.add(dirLight);

// --- Loader ---
const loader = new GLTFLoader();
let mainModel = null;
let orbitModel = null;

// --- Posiciones relativas del orbitador por cada planeta ---
const orbitOffsets = [
  new THREE.Vector3( 2.5,  1.8,  1.0),   // planeta-1
  new THREE.Vector3(-2.8,  2.0, -1.2),   // planeta-2
  new THREE.Vector3( 3.0, -1.5,  0.8),   // planeta-3
  new THREE.Vector3(-2.2, -2.2,  1.5)    // planeta-4
];

let planetTargets = [];
let mainTarget = new THREE.Vector3();
let orbitTarget = new THREE.Vector3();
let scrollProgress = 0;

// --- Cargar Modelos ---
async function loadModels() {
  try {
    const mainRes = await loader.loadAsync('/models/esfera-xxl.glb');
    mainModel = mainRes.scene;
    mainModel.scale.set(1.3, 1.3, 1.3);
    scene.add(mainModel);

    const orbitRes = await loader.loadAsync('/models/esfera-intermedio.glb');
    orbitModel = orbitRes.scene;
    orbitModel.scale.set(0.75, 0.75, 0.75);
    scene.add(orbitModel);
  } catch (e) {
    console.error("Error cargando modelos:", e);
  }
}

// --- screenToWorld ---
function screenToWorld(x, y) {
  const rect = renderer.domElement.getBoundingClientRect();
  const ndcX = ((x - rect.left) / rect.width) * 2 - 1;
  const ndcY = -((y - rect.top) / rect.height) * 2 + 1;

  return new THREE.Vector3(
    ndcX * (frustumSize * aspect / 2),
    ndcY * (frustumSize / 2),
    0
  );
}

// --- Actualizar posiciones de planetas ---
function updatePlanetTargets() {
  planetTargets = planetElements.map(el => {
    if (!el) return new THREE.Vector3();
    const rect = el.getBoundingClientRect();
    return screenToWorld(rect.left + rect.width/2, rect.top + rect.height/2);
  });
}

// --- Actualizar targets según scroll ---
const planetElements = ["planeta-1","planeta-2","planeta-3","planeta-4"]
  .map(id => document.getElementById(id));

planetElements.forEach(el => el && (el.style.opacity = "0"));

function updateTargets() {
  const scrollY = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress = Math.max(0, Math.min(3, (scrollY / maxScroll) * 3));

  const index = Math.floor(scrollProgress);
  const t = scrollProgress - index;

  if (index < planetTargets.length - 1 && planetTargets[index]) {
    const p1 = planetTargets[index];
    const p2 = planetTargets[index + 1];

    // Main Model
    mainTarget.x = p1.x + (p2.x - p1.x) * t;
    mainTarget.y = p1.y + (p2.y - p1.y) * t;

    // Orbit Model - interpola entre offsets
    const offset1 = orbitOffsets[index];
    const offset2 = orbitOffsets[index + 1] || offset1;

    orbitTarget.x = mainTarget.x + (offset1.x + (offset2.x - offset1.x) * t);
    orbitTarget.y = mainTarget.y + (offset1.y + (offset2.y - offset1.y) * t);
    orbitTarget.z = offset1.z + (offset2.z - offset1.z) * t;
  } 
  else if (planetTargets.length > 0) {
    mainTarget.copy(planetTargets[planetTargets.length-1]);
    const lastOffset = orbitOffsets[orbitOffsets.length-1];
    orbitTarget.copy(mainTarget).add(lastOffset);
  }
}

// --- Render Loop ---
function render() {
  if (mainModel) {
    mainModel.position.lerp(mainTarget, 0.1);
    mainModel.rotation.y += 0.004;
  }

  if (orbitModel) {
    orbitModel.position.lerp(orbitTarget, 0.1);
    orbitModel.rotation.x += 0.006;
    orbitModel.rotation.y += 0.008;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

// --- Init ---
updatePlanetTargets();
loadModels().then(() => {
  updateTargets();
  requestAnimationFrame(render);
});

// --- Eventos ---
window.addEventListener("scroll", () => {
  updatePlanetTargets();
  updateTargets();
});

window.addEventListener("resize", () => {
  const newAspect = window.innerWidth / window.innerHeight;
  camera.left = frustumSize * newAspect / -2;
  camera.right = frustumSize * newAspect / 2;
  camera.top = frustumSize / 2;
  camera.bottom = frustumSize / -2;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  updatePlanetTargets();
  updateTargets();
});