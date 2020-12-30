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
	print('Ready');
});

function hide(e) {
	e.style.display = 'none';
}

function show(e) {
	e.style.display = 'block';
}

function installHandelEventListeners(e, name, parentName) {
	let lastX = 0, lastY = 0;

	e.addEventListener('mousedown', dragMouseDown);
	e.addEventListener('dblclick', doubleClick);
	e.addEventListener('mouseup', elementMouseUp);

	function dragMouseDown(event) {
		event.preventDefault();
		event.stopPropagation();
		const rect = e.getClientRects()[0];
		lastX = Math.round(rect.x + rect.width / 2);
		lastY = Math.round(rect.y + rect.height / 2);
		document.addEventListener('mouseup', dragMouseUp);
		document.addEventListener('mousemove', dragMouseMove);
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
		hide(document.getElementById('live-line'));
	}

	function elementMouseUp(event) {
		event.preventDefault();
		console.debug(`Source port = ${window.sourcePort}, target port = ${parentName}.${name}`);
	}

	function doubleClick(e) {
		e.preventDefault();
		e.stopPropagation();
		console.debug('Label double click');
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

	function dragMouseUp() {
		document.removeEventListener('mouseup', dragMouseUp);
		document.removeEventListener('mousemove', dragMouseMove);
		e.style.cursor = "grab";
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

function print(x) {
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

function loadSketch(sketch) {
	setTitle(sketch.name);
	setBoard(sketch.draw());
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
