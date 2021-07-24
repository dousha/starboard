function Time(input, params) {
	if ('from' in params && 'to' in params && 'tick' in params) {
		const out = [];
		for (let i = Number(params['from']); i < Number(params['to']); i += Number(params['tick'])) {
			out.push(i);
		}
		return {
			t: out
		};
	}
}

function ConstantSignal(input, params) {
	if ('t' in input && 'v' in params) {
		const out = new Array(input['t'].length);
		for (let i = 0; i < out.length; i++) {
			out[i] = Number(params['v']);
		}
		return {
			v: out
		};
	}
}

function CosineWave(input, params) {
	const amplitude = 'A' in params ? Number(params['A']) : 1;
	const omega = 'omega' in params ? Number(params['omega']) : 1;
	const phi = 'phi' in params ? Number(params['phi']) : 0;
	if ('t' in input) {
		const out = new Array(input['t'].length);
		for (let i = 0; i < out.length; i++) {
			out[i] = amplitude * Math.cos(omega * input['t'][i] + phi);
		}
		return {
			v: out
		};
	}
}

function Mixer(input) {
	if ('xs' in input && 'ys' in input) {
		const out = new Array(input['xs'].length);
		for (let i = 0; i < input['xs'].length; i++) {
			out[i] = input['xs'][i] * input['ys'][i];
		}
		return {
			v: out
		};
	}
}

function Plot(input) {
	if ('t' in input && 'v' in input) {
		localStorage['__x'] = JSON.stringify(input['t']);
		localStorage['__y'] = JSON.stringify(input['v']);
		openPlotterWindow('__x', '__y');
	}
}
