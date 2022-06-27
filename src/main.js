import "./style.css";
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { GUI } from "dat.gui";
import { Maze } from "./custom/objects/Maze";
import { AStar } from "./custom/solvers/AStar";
import { ProgressLine } from "./custom/objects/ProgressLine";
import { CameraFollowController } from "./custom/objects/CameraFollowController";
import { Vector3 } from "three";

let scene, camera, renderer, stats;
let camController;
let progLine;
let settings;

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

	// Global Lights
	const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
	scene.add(ambientLight);
	const dirLight = new THREE.DirectionalLight(0xffffff, 0.3);
	dirLight.position.set(0, -30, 50);
	dirLight.castShadow = true;
	scene.add(dirLight);

	// Generate maze
	const mapW = 20;
	const mapH = 20;
	const maze = new Maze(mapW, mapH);
	// Draw maze mesh
	scene.add(maze.mesh);
	// Solve maze
	const solver = new AStar(maze);
	const sol = solver.solve(mapW * mapH - 1, 0);
	const goal = sol[1];
	const parents = sol[2];
	console.log(sol);

	// Draw progress
	const points = [];
	let current = goal;
	const solHeight = 0.9;
	while (current != undefined) {
		points.push(maze.cells[current].position.setZ(solHeight));
		current = parents[current];
	}
	progLine = new ProgressLine(0x0faaf0, 0.3, ...points);
	progLine.speed = 0.003;
	scene.add(progLine.mesh);

	settings = {
		follow: true,
	};

	// Camera controller
	const camBounds = [150, 150];
	camController = new CameraFollowController(
		camera,
		progLine,
		camBounds,
		renderer
	);
	camController.speed = 0.085;

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
	camController.active = settings.follow;

	progLine.animate();
	camController.update();
	renderer.render(scene, camera);
	stats.update();
}

function handleWheel(e) {
	if (settings.animate) return;
	const distDelta = 1;
	if (e.deltaY > 0) progLine.progress += distDelta;
	if (e.deltaY < 0) progLine.progress -= distDelta;
}

function handleWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}
