import "./style.css";
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { GUI } from "dat.gui";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { Maze } from "./custom/objects/Maze";
import { AStar } from "./custom/solvers/AStar";
import { ProgressLine } from "./custom/objects/ProgressLine";
import { WebGLMultipleRenderTargets } from "three";

let scene, camera, cameraGroup, renderer, stats, controls;
let progLine;
let t, settings;

init();
animate();

function init() {
	// Scene init
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x36393f);

	// Camera init
	camera = new THREE.PerspectiveCamera(
		75, // FOV
		window.innerWidth / window.innerHeight // Aspect
	);
	camera.position.setZ(30);
	camera.position.setY(-30);
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

	// Global Lights
	const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
	scene.add(ambientLight);
	const dirLight = new THREE.DirectionalLight(0xffffff, 0.3);
	dirLight.position.set(0, -30, 50);
	dirLight.castShadow = true;
	scene.add(dirLight);

	// Generate maze
	const maze = new Maze(35, 35);
	// Draw maze mesh
	scene.add(maze.mesh);
	// Solve maze
	const solver = new AStar(maze);
	const sol = solver.solve(35 * 35 - 1, 0);
	const start = sol[0];
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
	scene.add(progLine.mesh);

	// timer
	t = 0;
	settings = {
		animate: false,
	};
	// stats
	stats = new Stats();
	document.body.appendChild(stats.dom);
	// control
	controls = new TrackballControls(camera, renderer.domElement);
	// GUI
	const gui = new GUI();
	gui.add(settings, "animate").name("Animate");

	// update renderer and camera on resize
	window.addEventListener("resize", handleWindowResize);
	window.addEventListener("wheel", handleWheel);
}

function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);

	if (settings.animate) {
		t += 0.005;
		let lineProgress = progLine.points.length * Math.abs(Math.sin(t));
		progLine.distance = lineProgress;
	}

	stats.update();
}

function handleWheel(e) {
	if (settings.animate) return;
	const distDelta = 0.3;
	if (e.deltaY > 0) progLine.distance += distDelta;
	if (e.deltaY < 0) progLine.distance -= distDelta;
}

function handleWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}
