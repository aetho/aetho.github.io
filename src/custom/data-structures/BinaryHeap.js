class BinaryHeap {
	#heap;
	#comparator;
	#top;

	get count() {
		return this.#heap.length;
	}

	isEmpty() {
		return this.#heap.length === 0;
	}

	constructor(comparator = (a, b) => a < b) {
		this.#heap = [];
		// NOTE: default comparator results in a Min-Heap
		this.#comparator = comparator;
		this.#top = 0;
	}

	toArray() {
		return this.#heap;
	}

	push(...elements) {
		for (let i = 0; i < elements.length; i++) {
			this.#heap.push(elements[i]);
			let current = this.count - 1;
			let parent = this.#parent(current);
			this.propUp(current, parent);
		}
	}

	propUp(current, parent) {
		while (this.#comparator(this.#heap[current], this.#heap[parent])) {
			this.#swap(current, parent);
			[current, parent] = [parent, this.#parent(parent)];
		}
	}

	pop() {
		if (this.count === 0) return undefined;
		this.#swap(this.#top, this.count - 1);
		const popped = this.#heap.pop();

		let current = this.#top;
		let child = this.#children(current);
		this.propDown(current, child);

		return popped;
	}

	propDown(current, child) {
		let chosen;

		while (
			this.#comparator(this.#heap[child[0]], this.#heap[current]) ||
			this.#comparator(this.#heap[child[1]], this.#heap[current])
		) {
			if (!this.#heap[child[1]]) chosen = child[0];
			else
				chosen = this.#comparator(this.#heap[child[0]], this.#heap[child[1]])
					? child[0]
					: child[1];
			this.#swap(current, chosen);
			current = chosen;
			child = this.#children(current);
		}
	}

	peek() {
		return this.#heap[this.#top];
	}

	remove(element) {
		let current = this.#heap.indexOf(element);
		this.#swap(current, this.count - 1);
		this.#heap.pop();

		this.propUp(current, this.#parent(current));
		current = this.#heap.indexOf(element);
		this.propDown(current, this.#children(current));
	}

	includes(searchElement) {
		return this.#heap.includes(searchElement);
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

export { BinaryHeap };
