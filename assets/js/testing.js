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
				},
				y: 120,
				x: 80
			},
			{
				id: "constant-2",
				name: "Constant",
				input: [],
				output: [{
					name: "v",
					type: "number"
				}],
				parameters: {
					value: 1
				},
				y: 220,
				x: 80
			},
			{
				id: "output-1",
				name: "Output",
				input: [{
					name: "in",
					type: "any"
				}],
				output: [],
				parameters: {},
				y: 120,
				x: 340
			}
		],
		connections: []
	};

	const sketch = new Sketch('');
	sketch.loadFromObject(o);

	loadSketch(sketch);

	console.debug(sketch);
});
