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
		this.sol = false;
	}
}

export { Cell };
