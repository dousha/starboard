window.addEventListener('load', () => {
	newSketch();
	const loader = new Loader('./assets/nodules', window.sketch);
	loader.load();
});
