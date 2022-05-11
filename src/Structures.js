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

class MinHeap {
	#heap;
	#comparator;
	#top;

	get count() {
		return this.#heap.length;
	}

	get isEmpty() {
		return this.#heap.length === 0;
	}

	constructor(comparator = (a, b) => a < b) {
		this.#heap = [];
		this.#comparator = comparator;
		this.#top = 0;
	}

	toArray() {
		return this.#heap;
	}

	push(...values) {
		for (let i = 0; i < values.length; i++) {
			this.#heap.push(values[i]);
			let current = this.count - 1;
			let parent = this.#parent(current);
			while (this.#comparator(this.#heap[current], this.#heap[parent])) {
				this.#swap(current, parent);
				[current, parent] = [parent, this.#parent(parent)];
			}
		}
	}

	pop() {}

	peek() {
		return this.#heap[this.#top];
	}

	#swap(i, j) {
		[this.#heap[i], this.#heap[j]] = [this.#heap[j], this.#heap[i]];
	}
	#parent(i) {
		return Math.floor((i - 1) / 2);
	}
	#children(i) {
		return [2 * i + 1, 2 * i + 2];
	}
}

export { Cell, MinHeap };
