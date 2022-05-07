import * as THREE from "three";

class Cell {
	#i;
	get i() {
		return this.#i;
	}

	#j;
	get j() {
		return this.#j;
	}

	#vertices;
	get vertices() {
		return this.#vertices;
	}

	adj;
	visited;

	constructor(i, j, vertices) {
		this.#i = i;
		this.#j = j;
		this.#vertices = vertices;
		this.adj = [true, true, true, true]; // top, right, bot, left
		this.visited = false;
	}
}

class MazeGenerator {
	mapWidth;
	mapHeight;
	vertices;
	cells;

	constructor(mapWidth, mapHeight) {
		this.mapWidth = mapWidth;
		this.mapHeight = mapHeight;
		this.Generate();
	}

	Generate() {
		this.vertices = []; // length: (mapHeight+1)*(mapWidth+1)
		this.cells = []; // length: mapHeight*mapWidth

		// Generate vertices
		for (let j = 0; j < this.mapHeight + 1; j++) {
			for (let i = 0; i < this.mapWidth + 1; i++) {
				this.vertices.push(
					new THREE.Vector3(i - this.mapWidth / 2, j - this.mapHeight / 2, 0)
				);
			}
		}

		// Generate cells
		for (let j = 0; j < this.mapHeight; j++) {
			for (let i = 0; i < this.mapWidth; i++) {
				const cellVertices = [];
				cellVertices.push(this.vertices[(j + 1) * (this.mapWidth + 1) + i]); // top left, (i,j+1)
				cellVertices.push(this.vertices[(j + 1) * (this.mapWidth + 1) + i + 1]); // top right, (i+1,j+1)
				cellVertices.push(this.vertices[j * (this.mapWidth + 1) + i + 1]); // bot right, (i+1,j)
				cellVertices.push(this.vertices[j * (this.mapWidth + 1) + i]); // bot left, (i,j)
				this.cells.push(new Cell(i, j, cellVertices));
			}
		}

		// Generate Maze
		// Iterative Randomized DFS: https://en.wikipedia.org/wiki/Maze_generation_algorithm
		const cellStack = [];

		// Step 1
		// Randomly choose initial cell, mark it visited and push it to stack
		const initIdx = Math.floor(Math.random() * this.cells.length);
		this.cells[initIdx].visited = true;
		cellStack.push(initIdx); // stack of indices

		// Step 2
		while (cellStack.length > 0) {
			// Step 2.1
			const curIdx = cellStack.pop();
			const cur = this.cells[curIdx];

			// Step 2.2.0
			let adjIdx = []; // indices of adjacent cells
			if (cur.adj[0] && cur.j != this.mapHeight - 1)
				// Add top adjacent cell
				adjIdx.push((cur.j + 1) * this.mapWidth + cur.i);

			if (cur.adj[2] && cur.j != 0)
				// Add bot adjacent cell
				adjIdx.push((cur.j - 1) * this.mapWidth + cur.i);

			if (cur.adj[1] && cur.i != this.mapWidth - 1)
				// Add right adjacent cell
				adjIdx.push(cur.j * this.mapWidth + cur.i + 1);

			if (cur.adj[3] && cur.i != 0)
				// Add left adjacent cell
				adjIdx.push(cur.j * this.mapWidth + cur.i - 1);

			// Filter such that only indices of unvisited cells remain
			adjIdx = adjIdx.filter((idx) => !this.cells[idx].visited);

			if (adjIdx.length > 0) {
				// Step 2.2.1
				cellStack.push(curIdx);

				// Step 2.2.2
				const chosenIdx = adjIdx[Math.floor(Math.random() * adjIdx.length)];
				const chosen = this.cells[chosenIdx];

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
}

export { Cell, MazeGenerator };
