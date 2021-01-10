window.addEventListener('load', () => {
	const clipboard = new ClipboardJS(document.getElementById('btn-export'));
	clipboard.on('success', () => {
		clearDialog();
	});
	newSketch();
	window.sketch.loadNoduleRepo().then(() => console.log('Load finished'));
});
