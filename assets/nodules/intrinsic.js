function Constant(inputs, params) {
	return {
		v: params['value']
	};
}

function Output(inputs) {
	if ('in' in inputs) {
		console.log(inputs['in']);
		writeConsole(inputs['in']);
	}
}

function Mux(inputs) {
	if ('in' in inputs) {
		return {
			out1: inputs['in'],
			out2: inputs['in']
		};
	}
}

function Sum(inputs) {
	if ('x' in inputs && 'y' in inputs) {
		return {
			v: inputs['x'] + inputs['y']
		};
	}
}

function Negate(inputs) {
	if ('x' in inputs) {
		return {
			v: -inputs['x']
		};
	}
}

function Multiply(inputs) {
	if ('x' in inputs && 'y' in inputs) {
		return {
			v: inputs['x'] * inputs['y']
		}
	}
}

function Reciprocal(inputs) {
	if ('x' in inputs) {
		return {
			v: 1 / inputs['x']
		}
	}
}
