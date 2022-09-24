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
const colours = [0xa66cff, 0x9c9efe, 0x0afb4ff, 0xb1e1ff].reverse();
let maze;
let solver;
let lineBetween;

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
	// const maze = new Maze(mapW, mapH);
	maze = new Maze(mapW, mapH);
	// Draw maze mesh
	scene.add(maze.mesh);
	// Initiate A* solver
	solver = new AStar(maze);

	settings = {
		follow: false,
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
	// checkpoints.push(mapW * (mapH / 2) + mapW / 2); // center
	checkpoints.push(0); // bot left
	checkpoints.push(mapW - 1); // bot right
	checkpoints.push(mapW * mapH - 1); // top right
	checkpoints.push(mapW * (mapH - 1)); // top left

	lineBetween = new ProgressLine(0xa66cff, 0.3);
	scene.add(lineBetween.mesh);

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
	lineBetween.animate();

	camController.active = settings.follow;
	camController.update();
	renderer.render(scene, camera);
	stats.update();
}

function handleWheel(e) {
	const prevProg = pageProgress;
	pageProgress = (pageProgress + 1 * Math.sign(e.deltaY)) % checkpoints.length;
	if (pageProgress < 0) pageProgress = checkpoints.length - 1;

	const sol = solver
		.solve(checkpoints[prevProg], checkpoints[pageProgress])
		.map((el) => el.setZ(0.8));

	scene.remove(lineBetween.mesh);
	lineBetween = new ProgressLine(colours[pageProgress], 0.3, ...sol);
	lineBetween.progress = 1;
	scene.add(lineBetween.mesh);

	camController.target = maze.cells[checkpoints[pageProgress]];
}

function handleWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}
