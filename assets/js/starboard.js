window.addEventListener('load', () => {
	console.log('Load');
	if (localStorage['console-height']) {
		document.getElementById('console').style['height'] = localStorage['console-height'];
	}
	const consoleBoard = document.getElementById('console');
	const consoleFold = document.getElementById('console-fold');
	const consoleExpand = document.getElementById('console-expand');
	hide(document.getElementById('console-expand'));
	consoleFold.addEventListener('mousedown', e => {
		window.foldDragging = true;
		window.foldDragged = false;
		e.stopPropagation();
		e.preventDefault();
	});
	consoleFold.addEventListener('mouseup', e => {
		window.foldDragging = false;
		if (!window.foldDragged) {
			e.preventDefault();
			e.stopPropagation();
			hide(consoleBoard);
			hide(consoleFold);
			show(consoleExpand);
		}
	});
	window.addEventListener('mousemove', e => {
		if (window.foldDragging) {
			e.preventDefault();
			e.stopPropagation();
			window.foldDragged = true;
			const height = window.innerHeight - e.clientY;
			localStorage['console-height'] = `${height}px`;
			resizeConsole(height);
		}
	});
	consoleExpand.addEventListener('click', e => {
		e.preventDefault();
		e.stopPropagation();
		hide(consoleExpand);
		show(consoleFold);
		show(consoleBoard);
	});
	const board = document.getElementById('board');
	board.addEventListener('click', e => {
		e.preventDefault();
		hideContextMenu();
	});
	board.addEventListener('contextmenu', e => {
		e.preventDefault();
		e.stopPropagation();
		showContextMenu('board-context-menu', e.clientX, e.clientY);
		window.contextMenuX = e.clientX;
		window.contextMenuY = e.clientY;
	});
	document.querySelectorAll('.menu').forEach(menu => {
		menu.setAttribute('tabindex', '-1');
		menu.addEventListener('blur', () => {
			closeMenu();
		});
	});
	document.querySelectorAll('.dialog').forEach(dialog => {
		dialog.setAttribute('tabindex', '-1');
	});
	writeConsole('Ready\n');
});

function hide(e) {
	e.style.display = 'none';
}

function show(e) {
	e.style.display = 'block';
}

function resizeConsole(height) {
	const box = document.getElementById('console');
	box.style.height = `${height}px`;
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
		if (event.altKey || event.shiftKey) {
			e.style.cursor = 'crosshair';
		} else {
			e.style.cursor = 'auto';
		}
	}

	function click(event) {
		event.preventDefault();
		event.stopPropagation();
		if (event.altKey || event.shiftKey) {
			const id = e.getAttribute('data-id');
			deleteConnectionById(id);
		}
	}
}

function installBlockEventListeners(e, cb = () => {
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

	function doubleClick(event) {
		event.preventDefault();
		event.stopPropagation();
		window.editingNoduleId = e.querySelector('.nodule-id').innerText;
		openNodulePropertyEditor();
	}

	function rightClick(event) {
		event.preventDefault();
		event.stopPropagation();
		window.editingNoduleId = e.querySelector('.nodule-id').innerText;
		showContextMenu('nodule-context-menu', event.clientX, event.clientY);
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

function appendBoard(x) {
	const board = document.getElementById('board');
	board.append(x);
}

function setConnections(xs) {
	const lines = document.getElementById('line-container');
	clearElement(lines);
	xs.forEach(x => appendConnection(x));
}

function appendConnection(xs) {
	xs.forEach(x => {
		document.getElementById('line-container').appendChild(x);
	});
}

function deleteConnectionById(id) {
	if (window.sketch.breakConnection(id)) {
		document.querySelectorAll(`[data-id="${id}"]`).forEach(it => it.remove());
	}
}

function newSketch() {
	const sketch = new Sketch('New Sketch');
	loadSketch(sketch);
	window.sketchNamed = false;
}

function saveSketch() {
	if (!window.sketch) {
		console.error('No sketch loaded');
		return;
	}
	if (!window.sketchNamed) {
		showDialog('dialog-save');
	} else {
		sketchSaveWorker();
	}
}

function saveSketchWithName() {
	if (!window.sketch) {
		console.error('No sketch loaded');
		return;
	}
	const name = document.getElementById('sketch-name').value;
	if (name.trim().length < 1) {
		alert('Sketch name cannot be empty');
		return;
	}
	window.sketch.name = name;
	setTitle(name);
	sketchSaveWorker();
	clearDialog();
}

function sketchSaveWorker() {
	const sketch = window.sketch.toObject();
	const sketchDescriptor = {
		name: sketch.name,
		saveTime: (new Date()).toString(),
		actualName: window.sketchActualName ? window.sketchActualName : randomName()
	};
	const glob = JSON.stringify(sketch);
	const descriptorGlob = JSON.stringify(sketchDescriptor);
	if (window.localStorage) {
		window.localStorage['starboard_' + sketchDescriptor.actualName] = descriptorGlob;
		window.localStorage['_starboard_' + sketchDescriptor.actualName] = glob;
		// TODO: better dialog
		alert('Saved ' + sketch.name);
	} else {
		writeConsole(glob);
	}
}

function openSketch() {
	if (window.localStorage) {
		const content = document.getElementById('saved-sketches');
		clearElement(content);
		Object.keys(window.localStorage)
			.filter(it => it.startsWith('starboard_'))
			.map(it => window.localStorage[it])
			.map(it => JSON.parse(it))
			.map((it, index) => {
				const row = document.createElement('tr');
				const idCol = document.createElement('td');
				idCol.innerText = index.toString();
				const nameCol = document.createElement('td');
				nameCol.innerText = it.name;
				const mtimeCol = document.createElement('td');
				mtimeCol.innerText = it.saveTime;
				row.append(idCol, nameCol, mtimeCol);
				row.addEventListener('click', () => {
					window.sketchActualName = it.actualName;
					loadSketchFromLocalStorage(it.actualName);
					clearDialog();
				});
				return row;
			})
			.forEach(row => {
				content.append(row);
			});
		showDialog('dialog-open');
	} else {
		showDialog('dialog-import');
	}
}

function openSketchFromUrl() {
	const div = document.getElementById('dialog-open-url').querySelector('.dialog-action');
	disableAllButtonsIn(div);
	const url = document.getElementById('open-url').value;
	if (url.trim().length > 0) {
		Sketch.fromRemote(url).then(sketch => {
			loadSketch(sketch);
			clearDialog();
		}).finally(() => {
			enableAllButtonsIn(div);
		});
	}
}

function loadSketch(sketch) {
	window.sketch = sketch;
	window.sketchNamed = true;
	setTitle(sketch.name);
	setBoard(sketch.drawNodules());
	setConnections(sketch.drawConnections());
}

function reloadSketch() {
	// TODO
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

function loadSketchFromLocalStorage(name) {
	const json = window.localStorage['_starboard_' + name];
	if (!json) {
		console.error(name, 'not found');
		return;
	}
	loadSketchFromJson(json);
}

function run() {
	if (window.sketch) {
		writeConsole(`[${(new Date()).toLocaleString()}] Starting...\n`);
		window.sketch.run();
		writeConsole(`\n[${(new Date()).toLocaleString()}] Done\n`);
	} else {
		console.error('No sketch is loaded');
	}
}

function showContextMenu(name, x, y) {
	const box = document.getElementById(name);
	if (!box) {
		console.error(name, 'not found');
		return;
	}
	box.style.top = `${y}px`;
	box.style.left = `${x}px`;
	show(box);
}

function hideContextMenu() {
	const boxes = document.querySelectorAll('.context-menu');
	boxes.forEach(box => box.style.display = 'none');
}

function showDialog(name) {
	const dialog = document.getElementById(name);
	if (!dialog) {
		console.error(name, 'not found');
		return;
	}
	dialog.style.display = 'flex';
	hideContextMenu();
	dialog.focus();
}

function clearDialog() {
	const dialogs = document.querySelectorAll('.dialog');
	dialogs.forEach(dialog => dialog.style.display = 'none');
}

function saveNoduleProperties() {
	const box = document.getElementById('property-list');
	const nodule = window.sketch.getNoduleById(window.editingNoduleId);
	if (!nodule) {
		console.error(window.editingNoduleId, 'not found');
		return;
	}
	const noduleElement = document.querySelector(`[data-id="${window.editingNoduleId}"]`).parentElement;
	box.childNodes.forEach(item => {
		const key = item.firstChild.firstChild.innerText;
		const value = item.lastChild.firstChild.value;
		if (key === 'id') {
			if (window.editingNoduleId !== value) {
				nodule.id = value;
				noduleElement.querySelector('.nodule-id').innerText = value;
			}
		} else {
			// TODO: more granular type verification
			const typeInfo = nodule.paramTypes[key];
			let parsedValue;
			switch (typeInfo.type) {
				case 'number':
					parsedValue = Number(value);
					break;
				case 'string':
					parsedValue = value.toString();
					break;
				case 'any':
				case 'unknown':
				default:
					parsedValue = value;
					break;
			}
			nodule.parameters[key] = parsedValue;
		}
		noduleElement.querySelector('.nodule-parameters').innerText = nodule.getParamString();
	});
	clearDialog();
}

function openSketchPropertyEditor() {
	// TODO
	showDialog('sketch-edit');
}

function saveSketchProperties() {
	// TODO
}

function openSketchExportDialog() {
	if (window.sketch) {
		document.getElementById('export').value = JSON.stringify(window.sketch.toObject());
	}
	showDialog('dialog-export');
}

function openNodulePropertyEditor() {
	const nodule = window.sketch.getNoduleById(window.editingNoduleId);
	const container = document.getElementById('property-list');
	clearElement(container);
	nodule.generatePropertyList().forEach(x => container.append(x));
	showDialog('dialog-nodule-edit');
}

function removeSelectedModule() {
	hideContextMenu();
	if (!window.sketch) {
		console.error('No sketch loaded');
		return;
	}
	if (window.sketch.deleteNodule(window.editingNoduleId)) {
		document.querySelector(`[data-id="${window.editingNoduleId}"]`).parentElement.remove();
	}
}

function importSketch() {
	const stuff = document.getElementById('import').value;
	const sketch = Sketch.fromJSON(stuff);
	if (sketch) {
		loadSketch(sketch);
	}
}

function openMenu(name, parent) {
	const menu = document.getElementById(name);
	const rect = parent.getClientRects()[0];
	if (!rect || !menu) {
		return;
	}
	menu.style.top = `${rect.y + rect.height}px`;
	menu.style.left = `${rect.x}px`;
	show(menu);
	menu.focus();
}

function closeMenu() {
	document.querySelectorAll('.menu').forEach(it => it.style.display = 'none');
}
