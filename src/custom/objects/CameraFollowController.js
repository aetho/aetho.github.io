import { Vector2, Vector3 } from "three";

class CameraFollowController {
	camera; // subject of the controller
	origin; // original position
	target; // follow target
	bounds; // area in which the camera can be. [left, right, bot, top]
	renderer;
	width; // width of canvas
	height; // height of canvas
	active; // denotes whether controller is currently controlling the camera
	speed; // follow speed

	#canvasSize;
	#dest; // position of where camera should be / moving towards

	constructor(camera, target, bounds, renderer) {
		this.camera = camera;
		this.origin = camera.position.clone();
		this.target = target;
		this.offset = new Vector3();
		this.bounds = bounds;
		this.renderer = renderer;

		this.active = true;
		this.speed = 0.1;

		this.#dest = new Vector3();
		this.#canvasSize = new Vector2();
	}

	update() {
		this.renderer.getSize(this.#canvasSize);
		this.width = this.#canvasSize.x;
		this.height = this.#canvasSize.y;

		if (this.active) {
			const targetNDC = this.target.position.clone().project(this.camera);
			const halfW = this.width / 2;
			const halfH = this.height / 2;
			const domXY = {
				x: Math.round(targetNDC.x * halfW + halfW),
				y: Math.round(halfH - targetNDC.y * halfH),
			};

			console.log(domXY);

			const delta = 2;
			if (domXY.x > this.width - this.bounds[0])
				this.#dest.addVectors(this.camera.position, new Vector3(delta, 0, 0));
			if (domXY.x < this.bounds[0])
				this.#dest.addVectors(this.camera.position, new Vector3(-delta, 0, 0));
			if (domXY.y > this.height - this.bounds[1])
				this.#dest.addVectors(this.camera.position, new Vector3(0, -delta, 0));
			if (domXY.y < this.bounds[1])
				this.#dest.addVectors(this.camera.position, new Vector3(0, delta, 0));

			this.#dest.setZ(15);
			this.camera.position.lerp(this.#dest, this.speed);
		} else {
			this.camera.position.lerp(this.origin, this.speed);
		}
	}
}

export { CameraFollowController };
