function Constant(inputs, params) {
	return {
		v: params['value']
	};
}

function Output(inputs, params) {
	if ('in' in inputs) {
		console.log(inputs['in']);
		writeConsole(inputs['in']);
	}
}
