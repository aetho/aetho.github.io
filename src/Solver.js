import { MinHeap } from "./Structures";

class AStar {
	#map;
	#mapWidth;
	#movementCost = 1;

	constructor(mazeGenerator) {
		this.#map = mazeGenerator.cells;
		this.#mapWidth = mazeGenerator.mapWidth;
	}

	/**
	 *
	 * @param {number} start - index of starting cell
	 * @param {number} goal  - index of destination cell
	 */
	solve(start, goal) {
		const g = { start: 0 };
		const f = { start: this.#h(start, goal) };
		const parents = {};

		const openSet = new MinHeap((a, b) => f[a] < f[b]);
		openSet.push(start);

		const closedSet = [];

		while (!openSet.isEmpty()) {
			let cur = openSet.pop();
			if (cur === goal) return [start, goal, parents];

			closedSet.push(cur);

			const neighbors = this.#travNeighbors(cur);
			for (let i = 0; i < neighbors.length; i++) {
				const cost = g[cur] + this.#movementCost;
				if (openSet.includes(neighbors[i]) && cost < g[neighbors[i]])
					openSet.remove(neighbors[i]);

				if (closedSet.includes(neighbors[i]) && cost < g[neighbors[i]])
					closedSet.splice(neighbors[i], 1);

				if (
					!openSet.includes(neighbors[i]) &&
					!closedSet.includes(neighbors[i])
				) {
					g[neighbors[i]] = cost;
					f[neighbors[i]] = g[neighbors[i]] + this.#h(cur, neighbors[i]);
					openSet.push(neighbors[i]);
					parents[neighbors[i]] = cur;
				}
			}
		}
	}

	/**
	 *
	 * @param {number} n - cell index
	 * @returns indices of traversable neighbors
	 */
	#travNeighbors(n) {
		if (n < 0 || n > this.#map.length) return;
		const [j, i] = [Math.floor(n / this.#mapWidth), n % this.#mapWidth];

		let top = (j + 1) * this.#mapWidth + i;
		let right = j * this.#mapWidth + i + 1;
		let bot = (j - 1) * this.#mapWidth + i;
		let left = j * this.#mapWidth + i - 1;

		const neighbors = [];

		if (!(top < 0 || top > this.#map.length || this.#map[n].adj[0]))
			neighbors.push(top);
		if (!(right < 0 || right > this.#map.length || this.#map[n].adj[1]))
			neighbors.push(right);
		if (!(bot < 0 || bot > this.#map.length || this.#map[n].adj[2]))
			neighbors.push(bot);
		if (!(left < 0 || left > this.#map.length || this.#map[n].adj[3]))
			neighbors.push(left);

		return neighbors;
	}

	#h(start, goal) {
		const sCell = this.#map[start]; // start cell
		const gCell = this.#map[goal]; // goal cell
		return Math.abs(sCell.i - gCell.i) + Math.abs(sCell.j - gCell.j);
	}
}

export { AStar };
