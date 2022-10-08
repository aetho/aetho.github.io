import "./style.css";
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { GUI } from "dat.gui";
import { Maze } from "./custom/objects/Maze";
import { AStar } from "./custom/solvers/AStar";
import { ProgressLine } from "./custom/objects/ProgressLine";
import { CameraFollowController } from "./custom/objects/CameraFollowController";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { SpecialCube } from "./custom/objects/SpecialCube";

let canvasDOM, scene, camera, renderer, stats;
let camContainer;
let pageProgress = 0;
const colours = [0xa66cff, 0x9c9efe, 0x0afb4ff, 0xb1e1ff];
const checkpoints = [];

let maze;
let solver;
let lineBetween;
let cubes = [];

let pointer = { x: 0, y: 0 };
let raycaster;
let INTERSECTED;

let settings = {
	camSpeed: 0.1,
	mazeWidth: 16,
	mazeHeight: 16,
	wallHeight: 0.2,
	wallWidth: 0.2,
	wallColour: 0xffffff,
	floorColour: 0x4b4b4b,
	lineWidth: 0.2,
	lineHeight: 0.1,
	lineColour: colours[2],
	cubeSize: 0.5,
	cubeColour: colours[0],
	cubeSpeed: 0.05,
};
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
	camera.position.set(0, -30, 25);
	camera.lookAt(0, 0, 0);

	camContainer = new THREE.Object3D();
	camContainer.add(camera);
	scene.add(camContainer);
	// scene.add(camera);

	// Renderer init
	canvasDOM = document.querySelector("#app");
	renderer = new THREE.WebGLRenderer({
		canvas: canvasDOM,
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
	maze = new Maze(
		settings.mazeWidth,
		settings.mazeHeight,
		settings.wallHeight,
		settings.wallWidth,
		settings.wallColour,
		settings.floorColour
	);
	// Draw maze mesh
	scene.add(maze.mesh);
	// Initiate A* solver
	solver = new AStar(maze);

	// Set checkpoints
	const mapW = settings.mazeWidth;
	const mapH = settings.mazeHeight;
	checkpoints.push(maze.coord2idx(0, 0)); // bot left
	checkpoints.push(maze.coord2idx(mapW - 1, 0)); // bot right
	checkpoints.push(maze.coord2idx(mapW - 1, mapH - 1)); // top right
	checkpoints.push(maze.coord2idx(0, mapH - 1)); // top left

	lineBetween = new ProgressLine(settings.lineColour, settings.lineWidth);
	scene.add(lineBetween.mesh);

	// Checkpoint Cubes
	for (let i = 0; i < checkpoints.length; i++) {
		const cube = new SpecialCube(
			settings.cubeSize,
			settings.cubeColour,
			settings.cubeSpeed
		);
		cube.position = maze.cells[checkpoints[i]].position.clone();
		cube.position.setZ(0.5);
		cube.mesh.rotation.x = Math.random() * 100;
		cube.mesh.rotation.y = Math.random() * 100;
		cube.mesh.rotation.z = Math.random() * 100;

		cubes.push(cube);
		scene.add(cubes[i].mesh);
	}

	// Raycast
	raycaster = new THREE.Raycaster();

	// Orbit controls
	// const controls = new OrbitControls(camera, renderer.domElement);
	// controls.enableZoom = false;
	// controls.enableRotate = false;

	// stats
	stats = new Stats();
	document.body.appendChild(stats.dom);
	// GUI
	const gui = new GUI();
	gui.add(settings, "camSpeed").name("Camera Speed");

	window.addEventListener("mousemove", handlePointerMove);
	window.addEventListener("wheel", handleWheel);
	window.addEventListener("resize", handleWindowResize);
}

function animate(time) {
	requestAnimationFrame(animate);
	time *= 0.001;

	camContainer.rotation.z = time * settings.camSpeed;
	lineBetween.animate();
	for (let i = 0; i < cubes.length; i++) cubes[i].animate();

	raycaster.setFromCamera(pointer, camera);
	const intersects = raycaster
		.intersectObjects(scene.children, false)
		.filter((el) => el.object.name == "SpecialCube");

	if (intersects.length > 0) {
		if (INTERSECTED != intersects[0].object) {
			if (INTERSECTED)
				INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

			INTERSECTED = intersects[0].object;
			INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
			INTERSECTED.currentScale = INTERSECTED.scale.clone();
			INTERSECTED.material.emissive.setHex(0x333333);
			INTERSECTED.scale.set(1.5, 1.5, 1.5);
		}
	} else {
		if (INTERSECTED) {
			INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
			INTERSECTED.scale.copy(INTERSECTED.currentScale);
		}

		INTERSECTED = null;
	}

	if (INTERSECTED) canvasDOM.style.cursor = "pointer";
	else canvasDOM.style.cursor = "initial";

	renderer.render(scene, camera);
	stats.update();
}

function handlePointerMove(e) {
	pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
	pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

function handleWheel(e) {
	const prevProg = pageProgress;
	pageProgress = (pageProgress + 1 * Math.sign(e.deltaY)) % checkpoints.length;
	if (pageProgress < 0) pageProgress = checkpoints.length - 1;

	const sol = solver.solve(checkpoints[prevProg], checkpoints[pageProgress]);

	scene.remove(lineBetween.mesh);
	lineBetween = new ProgressLine(
		settings.lineColour,
		settings.lineWidth,
		...sol
	);
	lineBetween.progress = 1;
	lineBetween.mesh.position.z += settings.lineHeight;
	scene.add(lineBetween.mesh);
}

function handleWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}
