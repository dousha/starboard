function plot1d(xs) {
	const plotPoints = xs.map((it, index) => [index, it]);
	return {
		animation: false,
		xAxis: {
			name: 'x',
			minorTick: {
				show: true
			},
			minorSplitLine: {
				show: true
			}
		},
		yAxis: {
			name: 'y',
			minorTick: {
				show: true
			},
			minorSplitLine: {
				show: true
			}
		},
		series: [
			{
				type: 'line',
				showSymbol: false,
				clip: true,
				data: plotPoints
			}
		]
	};
}

function plot2d(xs, ys) {
	const plotPoints = [];
	for (let i = 0; i < Math.min(xs.length, ys.length); i++) {
		plotPoints.push([xs[i], ys[i]]);
	}
	return {
		animation: false,
		xAxis: {
			name: 'x',
			minorTick: {
				show: true
			},
			minorSplitLine: {
				show: true
			}
		},
		yAxis: {
			name: 'y',
			minorTick: {
				show: true
			},
			minorSplitLine: {
				show: true
			}
		},
		series: [
			{
				type: 'line',
				showSymbol: false,
				clip: true,
				data: plotPoints
			}
		]
	};
}

function plot() {
	// TODO: support more chart type
	const urlParams = new URLSearchParams(window.location.search);
	const xName = urlParams.get('x');
	const yName = urlParams.get('y');
	const xValue = JSON.parse(localStorage[xName]);
	const yValue = JSON.parse(localStorage[yName]);
	let option;
	if (!yValue) {
		option = plot1d(xValue);
	} else {
		option = plot2d(xValue, yValue);
	}
	const box = document.getElementById('plot');
	const plot = echarts.init(box);

	plot.setOption(option);

	window.addEventListener('resize', () => {
		plot.resize();
	});
}

window.addEventListener('load', () => {
	plot();
});
