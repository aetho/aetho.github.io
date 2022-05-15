import * as THREE from "three";
import { Vector3 } from "three";
import { Cell } from "./Structures";

class MazeGenerator {
	#mapWidth;
	get mapWidth() {
		return this.#mapWidth;
	}

	#mapHeight;
	get mapHeight() {
		return this.#mapHeight;
	}

	#vertices;

	#cells;
	get cells() {
		return this.#cells;
	}

	#mesh;
	get mesh() {
		return this.#mesh;
	}

	constructor(mapWidth, mapHeight) {
		this.#mapWidth = mapWidth;
		this.#mapHeight = mapHeight;
		this.generate();
	}

	generate() {
		this.#generateMaze();
		this.#generateMesh();
	}

	#generateMaze() {
		this.#vertices = []; // length: (mapHeight+1)*(mapWidth+1)
		this.#cells = []; // length: mapHeight*mapWidth

		// Generate vertices
		for (let j = 0; j < this.#mapHeight + 1; j++) {
			for (let i = 0; i < this.#mapWidth + 1; i++) {
				this.#vertices.push(
					new THREE.Vector3(i - this.#mapWidth / 2, j - this.#mapHeight / 2, 0)
				);
			}
		}

		// Generate cells
		for (let j = 0; j < this.#mapHeight; j++) {
			for (let i = 0; i < this.#mapWidth; i++) {
				const cellVertices = [];
				cellVertices.push(this.#vertices[(j + 1) * (this.#mapWidth + 1) + i]); // top left, (i,j+1)
				cellVertices.push(
					this.#vertices[(j + 1) * (this.#mapWidth + 1) + i + 1]
				); // top right, (i+1,j+1)
				cellVertices.push(this.#vertices[j * (this.#mapWidth + 1) + i + 1]); // bot right, (i+1,j)
				cellVertices.push(this.#vertices[j * (this.#mapWidth + 1) + i]); // bot left, (i,j)
				this.#cells.push(new Cell(i, j, cellVertices));
			}
		}

		// Generate Maze
		// Iterative Randomized DFS: https://en.wikipedia.org/wiki/Maze_generation_algorithm
		const cellStack = [];

		// Step 1
		// Randomly choose initial cell, mark it visited and push it to stack
		const initIdx = Math.floor(Math.random() * this.#cells.length);
		this.#cells[initIdx].visited = true;
		cellStack.push(initIdx); // stack of indices

		// Step 2
		while (cellStack.length > 0) {
			// Step 2.1
			const curIdx = cellStack.pop();
			const cur = this.#cells[curIdx];

			// Step 2.2.0
			let adjIdx = []; // indices of adjacent cells
			if (cur.adj[0] && cur.j != this.#mapHeight - 1)
				// Add top adjacent cell
				adjIdx.push((cur.j + 1) * this.#mapWidth + cur.i);

			if (cur.adj[2] && cur.j != 0)
				// Add bot adjacent cell
				adjIdx.push((cur.j - 1) * this.#mapWidth + cur.i);

			if (cur.adj[1] && cur.i != this.#mapWidth - 1)
				// Add right adjacent cell
				adjIdx.push(cur.j * this.#mapWidth + cur.i + 1);

			if (cur.adj[3] && cur.i != 0)
				// Add left adjacent cell
				adjIdx.push(cur.j * this.#mapWidth + cur.i - 1);

			// Filter such that only indices of unvisited cells remain
			adjIdx = adjIdx.filter((idx) => !this.#cells[idx].visited);

			if (adjIdx.length > 0) {
				// Step 2.2.1
				cellStack.push(curIdx);

				// Step 2.2.2
				const chosenIdx = adjIdx[Math.floor(Math.random() * adjIdx.length)];
				const chosen = this.#cells[chosenIdx];

				// Step 2.2.3
				if (cur.i - chosen.i === -1) {
					// current cell is left of chosen
					cur.adj[1] = false;
					chosen.adj[3] = false;
				} else if (cur.i - chosen.i === 1) {
					// current cell is right of chosen
					cur.adj[3] = false;
					chosen.adj[1] = false;
				} else if (cur.j - chosen.j === -1) {
					// current cell is below chosen cell
					cur.adj[0] = false;
					chosen.adj[2] = false;
				} else if (cur.j - chosen.j === 1) {
					// current cell is above chosen cell
					cur.adj[2] = false;
					chosen.adj[0] = false;
				}

				// Step 2.2.4
				chosen.visited = true;
				cellStack.push(chosenIdx);
			}
		}
	}

	#generateMesh(wallHeight = 1, wallWidth = 0.5, wallColor = [1, 1, 1]) {
		const geometry = new THREE.BufferGeometry();

		const indices = [];

		const vertices = [];
		const normals = [];
		const colors = [];

		const halfWidth = wallWidth / 2;

		/**
		 * Extrudes a given quad in the positive z-direction
		 * @param {Vector3[]} qVertices - An array describing a quad in the xy-plane. (Vertices are expected to be listed clockwise)
		 * @param {number} height - Height of extrusion
		 */
		function AddQuadPrism(qVertices, height, color) {
			const v = [...qVertices];
			for (let n = 0; n < qVertices.length; n++) {
				v.push(qVertices[n].clone().setZ(qVertices[n].z + height));
			}

			const faces = [
				{
					name: "top",
					v: [4, 5, 6, 7],
					n: [0, 0, 1],
				},
				{
					name: "bot",
					v: [1, 0, 3, 2],
					n: [0, 0, -1],
				},
				{
					name: "left",
					v: [4, 7, 3, 0],
					n: [-1, 0, 0],
				},
				{
					name: "right",
					v: [6, 5, 1, 2],
					n: [1, 0, 0],
				},
				{
					name: "front",
					v: [7, 6, 2, 3],
					n: [0, 1, 0],
				},
				{
					name: "back",
					v: [5, 4, 0, 1],
					n: [0, -1, 0],
				},
			];

			for (let i = 0; i < faces.length; i++) {
				const startIdx = vertices.length / 3;
				const a = startIdx;
				const b = startIdx + 1;
				const c = startIdx + 2;
				const d = startIdx + 3;

				const face = faces[i];

				vertices.push(...v[face.v[0]].toArray());
				vertices.push(...v[face.v[1]].toArray());
				vertices.push(...v[face.v[2]].toArray());
				vertices.push(...v[face.v[3]].toArray());

				normals.push(...face.n, ...face.n, ...face.n, ...face.n);
				colors.push(...color, ...color, ...color, ...color);

				indices.push(a, c, b);
				indices.push(c, a, d);
			}
		}

		// Maze vertices
		for (let n = 0; n < this.#vertices.length; n++) {
			const v = [
				this.#vertices[n]
					.clone()
					.add(new THREE.Vector3(-halfWidth, halfWidth, 0)),
				this.#vertices[n]
					.clone()
					.add(new THREE.Vector3(halfWidth, halfWidth, 0)),
				this.#vertices[n]
					.clone()
					.add(new THREE.Vector3(halfWidth, -halfWidth, 0)),
				this.#vertices[n]
					.clone()
					.add(new THREE.Vector3(-halfWidth, -halfWidth, 0)),
			];
			AddQuadPrism(v, wallHeight, wallColor);
		}

		// Maze walls
		for (let n = 0; n < this.#cells.length; n++) {
			const c = this.#cells[n];
			const tl = c.vertices[0];
			const tr = c.vertices[1];
			const br = c.vertices[2];
			const bl = c.vertices[3];

			if (c.adj[0]) {
				const v = [
					tl.clone().add(new THREE.Vector3(halfWidth, halfWidth, 0)),
					tr.clone().add(new THREE.Vector3(-halfWidth, halfWidth, 0)),
					tr.clone().add(new THREE.Vector3(-halfWidth, -halfWidth, 0)),
					tl.clone().add(new THREE.Vector3(halfWidth, -halfWidth, 0)),
				];
				AddQuadPrism(v, wallHeight, wallColor);
			}
			if (c.adj[1]) {
				const v = [
					tr.clone().add(new THREE.Vector3(-halfWidth, -halfWidth, 0)),
					tr.clone().add(new THREE.Vector3(halfWidth, -halfWidth, 0)),
					br.clone().add(new THREE.Vector3(halfWidth, halfWidth, 0)),
					br.clone().add(new THREE.Vector3(-halfWidth, halfWidth, 0)),
				];
				AddQuadPrism(v, wallHeight, wallColor);
			}
			if (c.adj[2]) {
				const v = [
					bl.clone().add(new THREE.Vector3(halfWidth, halfWidth, 0)),
					br.clone().add(new THREE.Vector3(-halfWidth, halfWidth, 0)),
					br.clone().add(new THREE.Vector3(-halfWidth, -halfWidth, 0)),
					bl.clone().add(new THREE.Vector3(halfWidth, -halfWidth, 0)),
				];
				AddQuadPrism(v, wallHeight, wallColor);
			}
			if (c.adj[3]) {
				const v = [
					tl.clone().add(new THREE.Vector3(-halfWidth, -halfWidth, 0)),
					tl.clone().add(new THREE.Vector3(halfWidth, -halfWidth, 0)),
					bl.clone().add(new THREE.Vector3(halfWidth, halfWidth, 0)),
					bl.clone().add(new THREE.Vector3(-halfWidth, halfWidth, 0)),
				];
				AddQuadPrism(v, wallHeight, wallColor);
			}
		}

		geometry.setIndex(indices);
		geometry.setAttribute(
			"position",
			new THREE.Float32BufferAttribute(vertices, 3)
		);
		geometry.setAttribute(
			"normal",
			new THREE.Float32BufferAttribute(normals, 3)
		);
		geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

		const material = new THREE.MeshLambertMaterial({
			vertexColors: true,
		});
		this.#mesh = new THREE.Mesh(geometry, material);
	}
}

export { MazeGenerator };
