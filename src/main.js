import "./style.css";
import * as THREE from "three";
import { MazeGenerator } from "./Maze";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Scene init
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x36393f);

// Camera init
const camera = new THREE.PerspectiveCamera(
	90, // FOV
	window.innerWidth / window.innerHeight // Aspect
);
camera.position.setZ(20);
camera.lookAt(0, 0, 0);

// Renderer init
const renderer = new THREE.WebGLRenderer({
	canvas: document.querySelector("#app"),
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);

// Add light
const ambientlight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientlight);

// Directional light
const directionalLight = new THREE.DirectionalLight(0xfff4d6, 0.5);
directionalLight.position.set(0, 3, 10);
directionalLight.rotation.set(50, -30, 0);
scene.add(directionalLight);

// Generate Maze
const mazeGenerator = new MazeGenerator(100, 100);

// Draw maze mesh
const mazeMesh = mazeGenerator.mesh;
scene.add(mazeMesh);

// draw loop
function animate() {
	requestAnimationFrame(animate);
	controls.update();
	renderer.render(scene, camera);
}
animate();
