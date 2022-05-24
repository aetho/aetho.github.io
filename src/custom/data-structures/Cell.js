import { Vector3 } from "three";

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
	position;

	constructor(i, j, vertices) {
		this.#i = i;
		this.#j = j;
		this.#vertices = vertices;
		this.adj = [true, true, true, true]; // top, right, bot, left
		this.visited = false;
		this.position = new Vector3(
			(vertices[0].x + vertices[1].x) / 2,
			(vertices[0].y + vertices[3].y) / 2,
			vertices[0].z
		);
	}
}

export { Cell };
