import "./style.css";
import * as THREE from "three";
import { Maze } from "./custom/objects/Maze";
import { AStar } from "./custom/solvers/AStar";

let scene, camera, cameraGroup, renderer;
let t;

init();
animate();

function init() {
	t = 0;

	// Scene init
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x36393f);

	// Camera init
	camera = new THREE.PerspectiveCamera(
		90, // FOV
		window.innerWidth / window.innerHeight // Aspect
	);
	camera.position.setZ(25);
	camera.position.setY(-25);
	camera.lookAt(0, 0, 0);

	cameraGroup = new THREE.Group();
	cameraGroup.add(camera);
	scene.add(cameraGroup);

	// Renderer init
	renderer = new THREE.WebGLRenderer({
		canvas: document.querySelector("#app"),
		antialias: true,
	});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	// Add ambient light
	const ambientlight = new THREE.AmbientLight(0xffffff, 0.7);
	scene.add(ambientlight);

	// Directional light
	const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
	directionalLight.position.set(0, 3, 10);
	directionalLight.rotation.set(50, -30, 0);
	scene.add(directionalLight);

	// Generate maze
	const maze = new Maze(35, 35);

	// Solve maze
	const solver = new AStar(maze);
	console.log(solver.solve(0, 35 * 35 - 1));

	// Draw maze mesh
	scene.add(maze.mesh);

	// Update renderer and camera on resize
	window.addEventListener("resize", handleWindowResize);
}

function animate() {
	requestAnimationFrame(animate);

	t += 0.001;
	cameraGroup.rotation.z = t;

	renderer.render(scene, camera);
}

function handleWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}
