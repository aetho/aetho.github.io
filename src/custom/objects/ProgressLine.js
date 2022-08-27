import * as THREE from "three";
class ProgressLine {
	active;
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
		this.#update();
		return this.#mesh;
	}

	get lineMesh() {
		const material = new THREE.LineBasicMaterial({ color: this.#color });
		const p = [];
		for (let i = 0; i < this.#segStart.length; i++) {
			p.push(this.#segStart[i], this.#segEnd[i]);
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
		this.active = true;
		this.points = points;
		this.lineWidth = lineWidth;
		this.speed = 0.005;
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
		let maxPoints = (this.points.length - 1) * 36; // 36 vertices per prism (6 per face, not reusing vertices)
		maxPoints = maxPoints < 0 ? 0 : maxPoints;
		const positions = new Float32Array(maxPoints * 3); // 3 coordinates per vertex

		geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

		// material
		const material = new THREE.MeshLambertMaterial({ color: this.#color });
		// const material = new THREE.MeshStandardMaterial({ color: this.#color });

		// mesh
		this.#mesh = new THREE.Mesh(geometry, material);
		this.#mesh.material.transparent = true;
		this.#mesh.frustumCulled = false;

		// compute segments
		this.#computeSegments();

		// update positions
		this.#update();
	}

	animate() {
		this.#mesh.material.opacity += this.active ? 0.03 : -0.03;
		if (this.#mesh.material.opacity < 0) this.#mesh.material.opacity = 0;
		if (this.#mesh.material.opacity > 1) this.#mesh.material.opacity = 1;
		// Do not update mesh if opacity !== 1
		if (this.#mesh.material.opacity !== 1) return;
		this.#mesh.visible = this.#mesh.material.opacity !== 0;

		if (this.#shadow < this.#relProg) this.#shadow += this.speed;
		if (this.#shadow > this.#relProg) this.#shadow -= this.speed;
		if (this.#shadow > 1) this.#shadow = 1;
		if (this.#shadow < 0) this.#shadow = 0;
		if (Math.abs(this.#shadow - this.#relProg) < this.speed)
			this.#shadow = this.#relProg;

		this.#update();
	}

	#update() {
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

		for (let i = 0, count = 0; i < v.length; i++, count += 3) {
			this.#writeToArray(positions, count, ...v[i].toArray());
		}

		const drawCount = v.length;
		this.#mesh.geometry.setDrawRange(0, drawCount);
		this.#mesh.geometry.attributes.position.needsUpdate = true; // required after the first render
		this.#mesh.geometry.computeVertexNormals();
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
		let a, b, c, d, e, f, g, h;

		if (dy == 0) {
			a = p[0]
				.clone()
				.setY(p[0].y - offset)
				.setZ(p[0].z + offset);
			b = p[1]
				.clone()
				.setY(p[1].y - offset)
				.setZ(p[1].z + offset);
			c = p[1]
				.clone()
				.setY(p[1].y + offset)
				.setZ(p[1].z + offset);
			d = p[0]
				.clone()
				.setY(p[0].y + offset)
				.setZ(p[0].z + offset);
			e = p[0]
				.clone()
				.setY(p[0].y - offset)
				.setZ(p[0].z - offset);
			f = p[1]
				.clone()
				.setY(p[1].y - offset)
				.setZ(p[1].z - offset);
			g = p[1]
				.clone()
				.setY(p[1].y + offset)
				.setZ(p[1].z - offset);
			h = p[0]
				.clone()
				.setY(p[0].y + offset)
				.setZ(p[0].z - offset);
		}

		if (dx == 0) {
			a = p[0]
				.clone()
				.setX(p[0].x - offset)
				.setZ(p[0].z + offset);
			b = p[0]
				.clone()
				.setX(p[0].x + offset)
				.setZ(p[0].z + offset);
			c = p[1]
				.clone()
				.setX(p[1].x + offset)
				.setZ(p[1].z + offset);
			d = p[1]
				.clone()
				.setX(p[1].x - offset)
				.setZ(p[1].z + offset);
			e = p[0]
				.clone()
				.setX(p[0].x - offset)
				.setZ(p[0].z - offset);
			f = p[0]
				.clone()
				.setX(p[0].x + offset)
				.setZ(p[0].z - offset);
			g = p[1]
				.clone()
				.setX(p[1].x + offset)
				.setZ(p[1].z - offset);
			h = p[1]
				.clone()
				.setX(p[1].x - offset)
				.setZ(p[1].z - offset);
		}

		// Top face
		v.push(a, b, d);
		v.push(b, c, d);
		// Bot face
		v.push(f, e, g);
		v.push(e, h, g);
		// Front face
		v.push(e, f, a);
		v.push(f, b, a);
		// Back face
		v.push(g, h, c);
		v.push(h, d, c);
		// Left face
		v.push(f, g, b);
		v.push(g, c, b);
		// Right face
		v.push(h, e, d);
		v.push(e, a, d);
	}

	#writeToArray(arr, startIdx, ...elements) {
		let tmpIdx = startIdx;
		for (let i = 0; i < elements.length; i++) {
			arr[tmpIdx++] = elements[i];
		}
	}
}

export { ProgressLine };
