import * as THREE from "three";

const scene = new THREE.Scene();

const fov = 75; 
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 5;

const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

camera.position.z = 2;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;

const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
const material = new THREE.MeshStandardMaterial({ color: 0x44aa88 });

const cube = new THREE.Mesh(geometry, material);

scene.add(cube);


const color = 0xffffff;
const intensity = 1;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 4);

scene.add(light);

function render(time) {
    time *= 0.001;

    cube.rotation.y = time;
    cube.rotation.x = time;
    renderer.render(scene, camera);

    requestAnimationFrame(render);
}
requestAnimationFrame(render);
