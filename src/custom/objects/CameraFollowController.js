class CameraFollowController {
	camera;
	target;
	bounds;

	constructor(camera, target, bounds) {
		this.camera = camera;
		this.target = target;
		this.bounds = bounds;
	}

	update() {
		// Rough PSEUDO
		// check if target in bounds
		// if yes - no change
		// else - update camera position to keep target in bounds
	}
}

export { CameraFollowController };
