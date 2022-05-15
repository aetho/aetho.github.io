import "./style.css";
import * as THREE from "three";
import { MazeGenerator } from "./Maze";

// Scene init
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x36393f);

// Camera init
const camera = new THREE.PerspectiveCamera(
	90, // FOV
	window.innerWidth / window.innerHeight // Aspect
);
camera.position.setZ(25);
camera.position.setY(-25);
camera.lookAt(0, 0, 0);

const cameraGroup = new THREE.Group();
cameraGroup.add(camera);
scene.add(cameraGroup);

// Renderer init
const renderer = new THREE.WebGLRenderer({
	canvas: document.querySelector("#app"),
	antialias: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Add light
const ambientlight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientlight);

// Directional light
const directionalLight = new THREE.DirectionalLight(0xfff4d6, 0.5);
directionalLight.position.set(0, 3, 10);
directionalLight.rotation.set(50, -30, 0);
scene.add(directionalLight);

// Generate Maze
const mazeGenerator = new MazeGenerator(35, 35);

// Draw maze mesh
const mazeMesh = mazeGenerator.mesh;
scene.add(mazeMesh);

// Update renderer and camera on resize
window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});

// draw loop
let t = 0;
function animate() {
	requestAnimationFrame(animate);

	t += 0.001;
	cameraGroup.rotation.z = t;

	renderer.render(scene, camera);
}
animate();
