import * as THREE from "three";
class ProgressLine {
	points;
	lineWidth;
	speed;

	#color;
	get color() {
		return this.#color;
	}

	#segStart;
	#segEnd;

	#mesh;
	get mesh() {
		this.update();
		return this.#mesh;
	}

	get lineMesh() {
		const material = new THREE.LineBasicMaterial({ color: this.#color });
		const p = [];
		for (let i = 0; i < this.#segStart.length; i++) {
			p.push(this.#segStart[i], this.#segEnd[i]);
			// p.push(this.#segStart[i], this.#segEnd[i]);
		}

		const geometry = new THREE.BufferGeometry().setFromPoints(p);
		return new THREE.Line(geometry, material);
	}

	#shadow;
	get #absShadow() {
		return this.#shadow * (this.points.length - 1);
	}

	// Position of shadow
	get position() {
		const fIndex = Math.floor(this.#absShadow);
		const part = this.#absShadow - Math.floor(this.#absShadow);
		const p1 = this.points[fIndex];
		let p2 = this.points[fIndex + 1];
		if (!p2) p2 = p1.clone();
		const pos = p1.clone().lerp(p2, part);
		return pos;
	}

	#absProg;
	get distance() {
		return this.#absProg;
	}
	set distance(value) {
		this.#absProg = value;
		if (value > this.points.length - 1) this.#absProg = this.points.length - 1;
		if (value < 0) this.#absProg = 0;

		this.#relProg = this.#absProg / (this.points.length - 1);
	}

	#relProg;
	get progress() {
		return this.#relProg;
	}
	set progress(value) {
		this.#relProg = value;
		if (value > 1) this.#relProg = 1;
		if (value < 0) this.#relProg = 0;

		this.#absProg = this.#relProg * (this.points.length - 1);
	}

	constructor(color, lineWidth, ...points) {
		this.points = points;
		this.lineWidth = lineWidth;
		this.speed = 0.004;
		this.#color = color;
		this.#relProg = 0;
		this.#absProg = 0;
		this.#shadow = 0;

		this.init();
	}

	init() {
		// geometry
		const geometry = new THREE.BufferGeometry();

		// attributes
		let maxPoints = (this.points.length - 1) * 24; // 24 vertices per prism
		maxPoints = maxPoints < 0 ? 0 : maxPoints;
		const positions = new Float32Array(maxPoints * 3); // 3 coordinates per vertex
		// const indices = new Uint16Array(maxPoints);

		// geometry.setIndex(new THREE.BufferAttribute(indices, 1));
		geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

		// material
		const material = new THREE.MeshLambertMaterial({ color: this.#color });

		// mesh
		this.#mesh = new THREE.Mesh(geometry, material);
		this.#mesh.frustumCulled = false;

		// compute segments
		this.#computeSegments();

		// update positions
		this.update();
	}

	animate() {
		if (this.#shadow < this.#relProg) this.#shadow += this.speed;
		if (this.#shadow > this.#relProg) this.#shadow -= this.speed;
		if (this.#shadow >= 1) this.#shadow = 1;
		if (this.#shadow <= 0) this.#shadow = 0;
		if (Math.abs(this.#shadow - this.#relProg) < 0.01)
			this.#shadow = this.#relProg;
		this.update();
	}

	update() {
		const v = [];
		const fIndex = Math.floor(this.#absShadow);
		const part = this.#absShadow - Math.floor(this.#absShadow);

		// Full segments
		for (let i = 0; i < fIndex; i++) {
			this.#addLineBetween(this.#segStart[i], this.#segEnd[i], v);
		}

		// Partial segment
		if (part > 0) {
			const p2 = new THREE.Vector3().lerpVectors(
				this.#segStart[fIndex],
				this.#segEnd[fIndex],
				part
			);
			this.#addLineBetween(this.#segStart[fIndex], p2, v);
		}

		// update mesh
		const positions = this.#mesh.geometry.attributes.position.array;
		// const indices = this.#mesh.geometry.index.array;

		for (let i = 0, count = 0; i < v.length; i++, count += 3) {
			this.#writeToArray(positions, count, ...v[i].toArray());
		}

		const drawCount = v.length;
		this.#mesh.geometry.setDrawRange(0, drawCount);
		this.#mesh.geometry.attributes.position.needsUpdate = true; // required after the first render
		// this.#mesh.geometry.index.needsUpdate = true; // required after the first render
		this.#mesh.geometry.computeVertexNormals();

		// console.log(positions);
	}

	#computeSegments() {
		// compute segment start & ends
		const revPoints = this.points.reverse();
		this.#segStart = [revPoints[0]];
		this.#segEnd = [];

		for (let i = 1; i < revPoints.length; i++) {
			const pCur = revPoints[i].clone(); // cur point
			if (revPoints[i + 1]) {
				const pNext = revPoints[i + 1].clone(); // next point
				const delta = new THREE.Vector3().subVectors(pNext, pCur).normalize();
				this.#segStart.push(
					pCur.clone().add(delta.multiplyScalar(this.lineWidth / 2))
				);
			}

			if (revPoints[i - 1]) {
				const pPrev = revPoints[i - 1].clone(); // prev point
				const delta = new THREE.Vector3().subVectors(pCur, pPrev).normalize();
				this.#segEnd.push(
					pCur.clone().add(delta.multiplyScalar(this.lineWidth / 2))
				);
			}
		}
	}

	#addLineBetween(p1, p2, v) {
		// identify order
		const p = [p1, p2].sort((a, b) => {
			return a.x - b.x + (a.y - b.y);
		});

		const dx = p[1].x - p[0].x;
		const dy = p[1].y - p[0].y;
		const offset = this.lineWidth / 2;

		if (dy == 0) {
			const a = p[0].clone().setY(p[0].y - offset);
			const b = p[1].clone().setY(p[1].y - offset);
			const c = p[1].clone().setY(p[1].y + offset);
			const d = p[0].clone().setY(p[0].y + offset);
			v.push(a, b, d);
			v.push(b, c, d);
		}

		if (dx == 0) {
			const a = p[0].clone().setX(p[0].x - offset);
			const b = p[0].clone().setX(p[0].x + offset);
			const c = p[1].clone().setX(p[1].x + offset);
			const d = p[1].clone().setX(p[1].x - offset);
			v.push(a, b, d);
			v.push(b, c, d);
		}
	}

	#writeToArray(arr, startIdx, ...elements) {
		let tmpIdx = startIdx;
		for (let i = 0; i < elements.length; i++) {
			arr[tmpIdx++] = elements[i];
		}
	}
}

export { ProgressLine };
