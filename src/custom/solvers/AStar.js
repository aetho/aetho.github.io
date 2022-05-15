import { BinaryHeap } from "../data-structures/BinaryHeap";

class AStar {
	#maze;
	#cells;
	#movementCost = 1;

	constructor(maze) {
		this.#maze = maze;
		this.#cells = maze.cells;
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

		const openSet = new BinaryHeap((a, b) => f[a] < f[b]);
		openSet.push(start);

		const closedSet = [];

		while (!openSet.isEmpty()) {
			let cur = openSet.pop();
			if (cur === goal) return [start, goal, parents];

			closedSet.push(cur);

			const neighbors = this.#maze.travNeighbors(cur);
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

	#h(start, goal) {
		const sCell = this.#cells[start]; // start cell
		const gCell = this.#cells[goal]; // goal cell
		return Math.abs(sCell.i - gCell.i) + Math.abs(sCell.j - gCell.j);
	}
}

export { AStar };
