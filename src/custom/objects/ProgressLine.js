class ProgressLine {
	mesh;
	vectors;
	progress;

	constructor(...vectors) {
		this.vectors = vectors;
		this.progress = 0;
	}
}

export { ProgressLine };
