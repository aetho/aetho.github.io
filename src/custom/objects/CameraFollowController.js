import { Vector3 } from "three";

class CameraFollowController {
	camera; // subject of the controller
	origin; // original position
	target; // follow target
	offset; // offset from target
	bounds; // area in which the camera can be. [left, right, bot, top]
	active; // denotes whether controller is currently controlling the camera
	speed; // follow speed

	#dest; // position of where camera should be / moving towards

	constructor(camera, target, bounds) {
		this.camera = camera;
		this.origin = camera.position.clone();
		this.target = target;
		this.offset = new Vector3();
		this.bounds = bounds;
		this.active = true;
		this.speed = 0.1;

		this.#dest = new Vector3();
	}

	update() {
		if (this.active) {
			this.#dest.addVectors(this.target.position, this.offset);
			this.camera.position.lerp(this.#dest, this.speed);

			this.camera.position.x = this.#clamp(
				this.camera.position.x,
				this.bounds[0],
				this.bounds[1]
			);

			this.camera.position.y = this.#clamp(
				this.camera.position.y,
				this.bounds[2],
				this.bounds[3]
			);
		} else {
			this.camera.position.lerp(this.origin, this.speed);
		}
	}

	#clamp(num, min, max) {
		let tmp = num;
		if (tmp < min) tmp = min;
		if (tmp > max) tmp = max;
		return tmp;
	}
}

export { CameraFollowController };
