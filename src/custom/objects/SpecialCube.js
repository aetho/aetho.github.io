import * as THREE from "three";

class SpecialCube {
	#size;
	set size(value) {
		this.#size = value < 0 ? 0 : value;
		this.update();
	}
	get size() {
		return this.#size;
	}

	#color;
	set color(value) {
		this.#color = value;
		this.update();
	}
	get color() {
		return this.#color;
	}

	#speed;
	set speed(value) {
		this.#speed = value;
		this.update();
	}
	get speed() {
		return this.#speed;
	}

	#position;
	set position(value) {
		this.#position = value;
		this.update();
	}
	get position() {
		return this.#position;
	}

	#mesh;
	get mesh() {
		this.update();
		return this.#mesh;
	}

	#name;
	get name() {
		return this.#name;
	}

	constructor(
		size = 1,
		color = 0xffffff,
		speed = 1,
		position = new THREE.Vector3(0, 0, 0),
		name = "SpecialCube"
	) {
		this.#size = size;
		this.#color = color;
		this.#speed = speed;
		this.#position = position;
		this.#name = name;
		this.init();
	}

	init() {
		// geometry
		const geometry = new THREE.BufferGeometry();

		// attributes
		const maxPoints = 36; // 6 per face, not reusing vertices
		const positions = new Float32Array(maxPoints * 3); // 3 coordinates per vertex

		geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

		// material
		const material = new THREE.MeshStandardMaterial({ color: this.#color });
		this.#mesh = new THREE.Mesh(geometry, material);
		this.#mesh.name = this.#name;
	}

	update() {
		// points
		const hs = this.#size / 2;
		const a = new THREE.Vector3(-hs, -hs, -hs);
		const b = new THREE.Vector3(hs, -hs, -hs);
		const c = new THREE.Vector3(hs, hs, -hs);
		const d = new THREE.Vector3(-hs, hs, -hs);
		const e = new THREE.Vector3(-hs, -hs, hs);
		const f = new THREE.Vector3(hs, -hs, hs);
		const g = new THREE.Vector3(hs, hs, hs);
		const h = new THREE.Vector3(-hs, hs, hs);

		const v = []; // vertices
		v.push(e, f, h, f, g, h); // top face
		v.push(a, d, b, d, c, b); // bot face
		v.push(a, b, e, b, f, e); // front face
		v.push(c, d, h, g, c, h); // back face
		v.push(b, c, f, c, g, f); // right face
		v.push(d, a, h, a, e, h); // left face

		// update mesh
		const positions = this.#mesh.geometry.attributes.position.array;

		for (let i = 0, idx = 0; i < v.length; i++, idx += 3) {
			const vArray = v[i].toArray();
			positions[idx] = vArray[0];
			positions[idx + 1] = vArray[1];
			positions[idx + 2] = vArray[2];
		}

		this.#mesh.name = this.#name;
		this.#mesh.material.color = new THREE.Color(this.#color);
		this.#mesh.position.copy(this.#position);
		this.#mesh.geometry.setDrawRange(0, 36);
		this.#mesh.geometry.attributes.position.needsUpdate = true; // required after the first render
		this.#mesh.geometry.computeVertexNormals();
	}

	animate() {
		this.#mesh.rotation.x += this.#speed;
		this.#mesh.rotation.y += this.#speed;
		this.#mesh.rotation.z += this.#speed;
	}
}

export { SpecialCube };
