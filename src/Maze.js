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

	adj;

	constructor(i, j) {
		this.#i = i;
		this.#j = j;
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
		this.vertices = [];
		this.cells = [];

		// Generate vertices
		for (let j = 0; j < this.mapHeight + 1; j++) {
			for (let i = 0; i < this.mapWidth + 1; i++) {
				this.vertices.push(new THREE.Vector3(i, j, 0));
			}
		}
	}
}

export { Cell, MazeGenerator };
