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
camera.position.setZ(10);
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
directionalLight.position.set(0, 3, 0);
directionalLight.rotation.set(50, -30, 0);
scene.add(directionalLight);

// Generate Maze
const mazeGenerator = new MazeGenerator(25, 25);
const mazeVertices = mazeGenerator.vertices;

const sphGeo = new THREE.SphereGeometry(0.1);
const sphMat = new THREE.MeshLambertMaterial();

for (let n = 0; n < mazeVertices.length; n++) {
	const sphere = new THREE.Mesh(sphGeo, sphMat);
	sphere.position.set(...mazeVertices[n].toArray());
	scene.add(sphere);
}

// draw loop
function animate() {
	requestAnimationFrame(animate);
	controls.update();
	renderer.render(scene, camera);
}
animate();
