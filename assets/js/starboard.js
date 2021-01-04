window.addEventListener('load', () => {
	console.log('Load');
	const consoleBoard = document.getElementById('console');
	const consoleFold = document.getElementById('console-fold');
	const consoleExpand = document.getElementById('console-expand');
	hide(document.getElementById('console-expand'));
	consoleFold.addEventListener('click', e => {
		e.preventDefault();
		e.stopPropagation();
		hide(consoleBoard);
		hide(consoleFold);
		show(consoleExpand);
	});
	consoleExpand.addEventListener('click', e => {
		e.preventDefault();
		e.stopPropagation();
		hide(consoleExpand);
		show(consoleFold);
		show(consoleBoard);
	});
	writeConsole('Ready\n');
});

function hide(e) {
	e.style.display = 'none';
}

function show(e) {
	e.style.display = 'block';
}

function installPortEventListeners(e, name, parentName) {
	let lastX = 0, lastY = 0;

	e.addEventListener('mousedown', dragMouseDown);
	e.addEventListener('dblclick', doubleClick);
	e.addEventListener('mouseup', elementMouseUp);
	e.addEventListener('mouseenter', hover);

	function dragMouseDown(event) {
		event.preventDefault();
		event.stopPropagation();
		const type = e.getAttribute('data-type');
		if (!type || type === 'input') {
			return;
		}
		const rect = e.getClientRects()[0];
		lastX = Math.round(rect.x + rect.width / 2);
		lastY = Math.round(rect.y + rect.height / 2);
		document.addEventListener('mouseup', dragMouseUp);
		document.addEventListener('mousemove', dragMouseMove);
		window.portDraggingStarted = true;
		const line = document.getElementById('live-line');
		line.setAttribute('x1', lastX.toString());
		line.setAttribute('x2', lastX);
		line.setAttribute('y1', lastY.toString());
		line.setAttribute('y2', lastY);
		window.sourcePort = `${parentName}.${name}`;
		show(document.getElementById('live-line'));
	}

	function dragMouseMove(event) {
		event.preventDefault();
		const line = document.getElementById('live-line');
		const x = event.clientX;
		const y = event.clientY;
		line.setAttribute('x2', x.toString());
		line.setAttribute('y2', y.toString());
	}

	function dragMouseUp() {
		document.removeEventListener('mouseup', dragMouseUp);
		document.removeEventListener('mousemove', dragMouseMove);
		window.portDraggingStarted = false;
		hide(document.getElementById('live-line'));
	}

	function elementMouseUp(event) {
		event.preventDefault();
		const toPortName = `${parentName}.${name}`;
		console.debug(`Source port = ${window.sourcePort}, target port = ${toPortName}`);
		if (window.sourcePort && window.sourcePort !== toPortName) {
			if (!window.sketch) {
				console.error('No sketch loaded');
			} else {
				const conn = window.sketch.makeConnection(window.sourcePort, toPortName);
				if (conn != null) {
					appendConnection(conn.draw());
				}
			}
		}
	}

	function doubleClick(event) {
		event.preventDefault();
		event.stopPropagation();
		console.debug('Label double click');
	}

	function hover() {
		const type = e.getAttribute('data-type');
		if (!type) {
			return;
		}
		if (!window.portDraggingStarted) {
			if (type === 'input') {
				e.style.cursor = 'not-allowed';
			} else {
				e.style.cursor = 'crosshair';
			}
		} else {
			if (type === 'output') {
				e.style.cursor = 'no-drop';
			} else {
				e.style.cursor = 'crosshair';
			}
		}
	}
}

function installConnectionEventListeners(e) {
	e.addEventListener('mouseenter', hoverStart);
	e.addEventListener('click', click);

	function hoverStart(event) {
		if (event.altKey) {
			e.style.cursor = 'crosshair';
		} else {
			e.style.cursor = 'auto';
		}
	}

	function click(event) {
		event.preventDefault();
		event.stopPropagation();
		if (event.altKey) {
			const id = e.getAttribute('data-id');
			if (window.sketch.breakConnection(id)) {
				document.querySelectorAll(`[data-id="${id}"]`).forEach(it => it.remove());
			}
		}
	}
}

function installBlockEventListeners(e, cb = (x, y) => {
}) {
	let dX = 0, dY = 0, lastX = 0, lastY = 0;

	e.addEventListener('mousedown', dragMouseDown);
	e.addEventListener('dblclick', doubleClick);
	e.addEventListener('contextmenu', rightClick);

	function dragMouseDown(event) {
		event.preventDefault();
		lastX = e.clientX;
		lastY = e.clientY;
		document.addEventListener('mouseup', dragMouseUp);
		document.addEventListener('mousemove', dragMouseMove);
		e.style.cursor = "grabbing";
	}

	function dragMouseMove(event) {
		event.preventDefault();
		updatePosition(event);
	}

	function dragMouseUp(event) {
		updatePosition(event);
		document.removeEventListener('mouseup', dragMouseUp);
		document.removeEventListener('mousemove', dragMouseMove);
		e.style.cursor = "grab";
	}

	function updatePosition(event) {
		dX = lastX - event.clientX;
		dY = lastY - event.clientY;
		lastX = event.clientX;
		lastY = event.clientY;
		const x = e.offsetLeft - dX;
		const y = e.offsetTop - dY;
		cb(x, y);
		e.style.top = `${y}px`;
		e.style.left = `${x}px`;
	}

	function doubleClick(e) {
		e.preventDefault();
		console.debug('Double click!');
	}

	function rightClick(e) {
		e.preventDefault();
		console.debug('Right click!');
	}
}

function writeConsole(x) {
	document.getElementById('console-output').innerText += x;
}

function setStatus(x) {
	document.getElementById('status').innerText = x;
}

function setTitle(x) {
	document.getElementById('title').innerText = x;
}

function setBoard(xs) {
	const board = document.getElementById('board');
	clearElement(board);
	xs.forEach(x => board.append(x));
}

function setConnections(xs) {
	const lines = document.getElementById('line-container');
	clearElement(lines);
	xs.forEach(x => lines.appendChild(x));
}

function appendConnection(xs) {
	xs.forEach(x => {
		document.getElementById('line-container').appendChild(x);
	});
}

function loadSketch(sketch) {
	window.sketch = sketch;
	setTitle(sketch.name);
	setBoard(sketch.drawNodules());
	setConnections(sketch.drawConnections());
}

function loadSketchFromJson(json) {
	try {
		const sketch = Sketch.fromJSON(json);
		loadSketch(sketch);
	} catch (e) {
		console.error(e);
		setStatus('Cannot load this sketch');
	}
}

function run() {
	if (window.sketch) {
		window.sketch.run();
	} else {
		console.error('No sketch is loaded');
	}
}
