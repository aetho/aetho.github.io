import * as THREE from "three";
class ProgressLine {
	points;
	lineWidth;

	#color;
	get color() {
		return this.#color;
	}

	#mesh;
	get mesh() {
		this.update();
		return this.#mesh;
	}

	#prog;
	get progress() {
		return this.#prog;
	}
	set progress(value) {
		this.#prog = value > 1 ? 1 : value;
		this.#prog = value < 0 ? 0 : value;
		this.update();
	}

	constructor(color, lineWidth, ...points) {
		this.points = points;
		this.#prog = 1;
		this.lineWidth = lineWidth;
		this.#color = color;

		this.init();
		this.update();
	}

	init() {
		// geometry
		const geometry = new THREE.BufferGeometry();

		// attributes
		let maxPoints = (this.points.length - 1) * 24; // 24 vertices per prism
		maxPoints = maxPoints < 0 ? 0 : maxPoints;
		const positions = new Float32Array(maxPoints * 3); // 3 coordinates per vertex
		const indices = new Uint16Array(maxPoints);

		geometry.setIndex(new THREE.BufferAttribute(indices, 1));
		geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

		// material
		const material = new THREE.MeshLambertMaterial({ color: this.#color });

		// mesh
		this.#mesh = new THREE.Mesh(geometry, material);

		// update positions
		this.update();
	}

	update() {
		// compute vertex positions
		const m = Math.floor(this.#prog * this.points.length - 1);
		const v = [];
		for (let i = 0; i < m; i++) {
			const p1 = this.points[i];
			const p2 = this.points[i + 1];
			const offset = this.lineWidth / 2;

			if (p2.x - p1.x > 0) {
				// p2 is right of p1
				v.push(
					p1
						.clone()
						.setX(p1.x - offset)
						.setY(p1.y - offset),
					p2
						.clone()
						.setX(p2.x + offset)
						.setY(p2.y - offset),
					p2
						.clone()
						.setX(p2.x + offset)
						.setY(p2.y + offset),
					p1
						.clone()
						.setX(p1.x - offset)
						.setY(p1.y + offset)
				);
			} else if (p2.x - p1.x < 0) {
				// p2 is left of p1
				v.push(
					p2
						.clone()
						.setX(p2.x - offset)
						.setY(p2.y - offset),
					p1
						.clone()
						.setX(p1.x + offset)
						.setY(p1.y - offset),
					p1
						.clone()
						.setX(p1.x + offset)
						.setY(p1.y + offset),
					p2
						.clone()
						.setX(p2.x - offset)
						.setY(p2.y + offset)
				);
			} else if (p2.y - p1.y > 0) {
				// p2 above p1
				v.push(
					p1
						.clone()
						.setX(p1.x - offset)
						.setY(p1.y - offset),
					p1
						.clone()
						.setX(p1.x + offset)
						.setY(p1.y - offset),
					p2
						.clone()
						.setX(p2.x + offset)
						.setY(p2.y + offset),
					p2
						.clone()
						.setX(p2.x - offset)
						.setY(p2.y + offset)
				);
			} else if (p2.y - p1.y < 0) {
				// p2 below p1
				v.push(
					p2
						.clone()
						.setX(p2.x - offset)
						.setY(p2.y - offset),
					p2
						.clone()
						.setX(p2.x + offset)
						.setY(p2.y - offset),
					p1
						.clone()
						.setX(p1.x + offset)
						.setY(p1.y + offset),
					p1
						.clone()
						.setX(p1.x - offset)
						.setY(p1.y + offset)
				);
			}
		}

		// update mesh
		const positions = this.#mesh.geometry.attributes.position.array;
		const indices = this.#mesh.geometry.index.array;

		for (let i = 0, count = 0; i < v.length; i++, count += 3) {
			this.#writeToArray(positions, count, ...v[i].toArray());
		}

		for (let i = 0, count = 0; i < v.length / 2; i++) {
			const a = 4 * i;
			const b = 4 * i + 1;
			const c = 4 * i + 2;
			const d = 4 * i + 3;
			this.#writeToArray(indices, count, a, b, d);
			count += 3;
			this.#writeToArray(indices, count, b, c, d);
			count += 3;
		}

		const drawCount = (v.length / 2) * 3;
		this.#mesh.geometry.setDrawRange(0, drawCount);
		this.#mesh.geometry.attributes.position.needsUpdate = true; // required after the first render
		this.#mesh.geometry.index.needsUpdate = true; // required after the first render
		this.#mesh.geometry.computeVertexNormals();
	}

	#writeToArray(arr, startIdx, ...elements) {
		let tmpIdx = startIdx;
		for (let i = 0; i < elements.length; i++) {
			arr[tmpIdx++] = elements[i];
		}
	}

	// #meshBetween()
}

export { ProgressLine };
