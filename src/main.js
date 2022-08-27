import "./style.css";
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { GUI } from "dat.gui";
import { Maze } from "./custom/objects/Maze";
import { AStar } from "./custom/solvers/AStar";
import { ProgressLine } from "./custom/objects/ProgressLine";
import { CameraFollowController } from "./custom/objects/CameraFollowController";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let scene, camera, renderer, stats;
let camController;
let settings;
let pageProgress = 0;
const checkpoints = [];
const solutions = [];
const colours = [0xa66cff, 0x9c9efe, 0x0afb4ff, 0xb1e1ff].reverse();

init();
animate();

function init() {
	// Scene init
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x36393f);

	// Camera init
	camera = new THREE.PerspectiveCamera(
		30, // FOV
		window.innerWidth / window.innerHeight, // Aspect
		0.01,
		1000
	);
	camera.position.set(0, -20, 30);
	camera.lookAt(0, 0, 0);
	camera.position.y -= 1.5;
	scene.add(camera);

	// Renderer init
	renderer = new THREE.WebGLRenderer({
		canvas: document.querySelector("#app"),
		antialias: true,
	});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	// Orbit controls
	// const controls = new OrbitControls(camera, renderer.domElement);

	// Global Lights
	const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
	scene.add(ambientLight);
	const dirLight = new THREE.DirectionalLight(0xffffff, 0.3);
	dirLight.position.set(0, -30, 50);
	dirLight.castShadow = true;
	scene.add(dirLight);

	// Generate maze
	const mapW = 16;
	const mapH = 16;
	const maze = new Maze(mapW, mapH);
	// Draw maze mesh
	scene.add(maze.mesh);
	// Initiate A* solver
	const solver = new AStar(maze);

	settings = {
		follow: true,
	};

	// Camera controller
	const camBounds = [150, 150];
	camController = new CameraFollowController(
		camera,
		new THREE.Object3D(),
		camBounds,
		renderer
	);

	// Set checkpoints
	checkpoints.push(mapW * (mapH / 2) + mapW / 2); // center
	checkpoints.push(0); // bot left
	checkpoints.push(mapW - 1); // bot right
	checkpoints.push(mapW * mapH - 1); // top right
	checkpoints.push(mapW * (mapH - 1)); // top left
	// Initialize progress lines between checkpoints
	for (let i = 0; i < checkpoints.length - 1; i++) {
		const sol = solver
			.solve(checkpoints[i], checkpoints[i + 1])
			.map((el) => el.setZ(0.8 + i * 0.01));
		solutions.push(new ProgressLine(colours[i], 0.2 + i * 0.01, ...sol));
	}

	for (let i = 0; i < solutions.length; i++) {
		scene.add(solutions[i].mesh);
	}

	// stats
	stats = new Stats();
	document.body.appendChild(stats.dom);
	// GUI
	const gui = new GUI();
	gui.add(settings, "follow").name("Follow solution");

	// update renderer and camera on resize
	window.addEventListener("resize", handleWindowResize);
	window.addEventListener("wheel", handleWheel);
}

function animate() {
	requestAnimationFrame(animate);
	solutions.forEach((el) => el.animate());

	camController.active = settings.follow;
	camController.update();
	renderer.render(scene, camera);
	stats.update();
}

function handleWheel(e) {
	const distDelta = 1;
	if (e.deltaY > 0) {
		pageProgress += distDelta;
		if (pageProgress <= 0) pageProgress = 0;
		if (pageProgress >= solutions.length) pageProgress = solutions.length;
		camController.target = solutions[pageProgress - 1];
	}
	if (e.deltaY < 0) {
		pageProgress -= distDelta;
		if (pageProgress <= 0) pageProgress = 0;
		if (pageProgress >= solutions.length) pageProgress = solutions.length;
		camController.target = solutions[pageProgress];
	}

	for (let i = 0; i < solutions.length; i++) {
		solutions[i].progress = i === pageProgress - 1 ? 1 : 0;
	}
}

function handleWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}
