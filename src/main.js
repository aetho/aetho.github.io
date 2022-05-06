import "./style.css";
import * as THREE from "three";
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

// Add cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial();
const cube = new THREE.Mesh(geometry, material);
cube.position.setZ(0);
scene.add(cube);

// draw loop
function animate() {
	requestAnimationFrame(animate);
	controls.update();

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
	renderer.render(scene, camera);
}
animate();
