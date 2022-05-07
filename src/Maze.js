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

	constructor(i, j, vertices) {
		this.#i = i;
		this.#j = j;
		this.#vertices = vertices;
		this.adj = [true, true, true, true];
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
				this.vertices.push(new THREE.Vector3(i, j, 0));
			}
		}

		// Generate cells
		for (let j = 0; j < this.mapHeight; j++) {
			for (let i = 0; i < this.mapWidth; i++) {
				const cellVertices = [];
				cellVertices.push(this.vertices[(j + 1) * (this.mapWidth + 1) + i]); // top left, (i,j)
				cellVertices.push(this.vertices[(j + 1) * (this.mapWidth + 1) + i + 1]); // top right, (i,j)
				cellVertices.push(this.vertices[j * (this.mapWidth + 1) + i + 1]); // bot right, (i,j)
				cellVertices.push(this.vertices[j * (this.mapWidth + 1) + i]); // bot left, (i,j)
				this.cells.push(new Cell(i, j, cellVertices));
			}
		}
	}
}

export { Cell, MazeGenerator };
