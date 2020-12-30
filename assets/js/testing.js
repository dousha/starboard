window.addEventListener('load', () => {
	const o = {
		name: 'Testing',
		nodules: [
			{
				id: "constant-1",
				name: "Constant",
				input: [],
				output: [{
					name: "v",
					type: "number"
				}],
				parameters: {
					value: 42
				}
			}
		],
		connections: []
	};

	const sketch = new Sketch('');
	sketch.loadFromObject(o);

	loadSketch(sketch);

	console.debug(sketch);
});
