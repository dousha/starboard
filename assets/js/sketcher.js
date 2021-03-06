function Nodule(sketch) {
	this.id = '';
	this.name = '';
	this.input = [];
	this.output = [];
	this.parameters = {};
	this.paramTypes = {};

	this.x = 0;
	this.y = 0;

	this.activeConnections = [];

	this.getParamString = function () {
		return Object.keys(this.parameters).map(it => {
			const value = this.parameters[it];
			if (typeof value === 'object') {
				if (value instanceof Array) {
					return `${it}=[...]`;
				} else {
					return `${it}={...}`;
				}
			} else {
				return `${it}=${value.toString()}`;
			}
		}).join('\n');
	};

	this.drawParam = function () {
		const label = document.createElement('span');
		label.classList.add('nodule-parameters');
		label.innerText = this.getParamString();
		return label;
	};

	this.drawIo = function (xs, type) {
		const box = document.createElement('div');
		box.classList.add('nodule-handle-content');
		xs.forEach(it => {
			const node = document.createElement('span');
			node.classList.add('nodule-label');
			node.innerText = it.name;
			node.setAttribute('data-type', type);
			node.setAttribute('data-name', `${type}-${it.name}`);
			installPortEventListeners(node, it.name, this.id);
			box.append(node);
		});
		return box;
	};

	this.draw = function () {
		const outererBox = document.createElement('div');
		outererBox.classList.add('block-wrapper');
		const outerBox = document.createElement('div');
		outerBox.classList.add('grip');
		outerBox.classList.add('block');
		outerBox.setAttribute('tabindex', '-1');
		const leftHandle = document.createElement('div');
		leftHandle.classList.add('nodule-handle');
		const rightHandle = document.createElement('div');
		rightHandle.classList.add('nodule-handle');
		const content = document.createElement('div');
		content.classList.add('nodule-content');
		const nameLabel = document.createElement('span');
		nameLabel.classList.add('nodule-name');
		nameLabel.innerText = this.name;
		const paramLabel = this.drawParam();
		const idLabel = document.createElement('span');
		idLabel.classList.add('nodule-id');
		idLabel.innerText = this.id;
		content.append(nameLabel, paramLabel);
		leftHandle.append(this.drawIo(this.input, 'input'));
		rightHandle.append(this.drawIo(this.output, 'output'));
		outerBox.append(leftHandle, content, rightHandle);
		outerBox.setAttribute('data-id', this.id);
		installBlockEventListeners(outererBox, this.move.bind(this));
		outererBox.append(outerBox);
		outererBox.append(idLabel);
		outererBox.style.top = `${this.y}px`;
		outererBox.style.left = `${this.x}px`;
		return outererBox;
	};

	this.move = function (x, y) {
		if (!isNaN(x) && !isNaN(y)) {
			this.x = x;
			this.y = y;
			this.updateConnections();
		}
	};

	this.updateConnections = function () {
		this.activeConnections.forEach(it => {
			sketch.updateConnection(it);
		});
	};

	this.save = function () {
		return this;
	};

	this.generatePropertyList = function () {
		function generateInputPair(name, value) {
			const wrapper = document.createElement('tr');
			wrapper.classList.add('property-entry');
			const labelWrapper = document.createElement('td');
			const label = document.createElement('span');
			label.innerText = name;
			labelWrapper.append(label);
			const inputWrapper = document.createElement('td');
			const input = document.createElement('input');
			input.id = `input-${name}`;
			input.value = value;
			label.setAttribute('for', input.id);
			inputWrapper.append(input);
			wrapper.append(labelWrapper, inputWrapper);
			return wrapper;
		}

		const out = Object.keys(this.parameters).map(it => {
			const paramValue = this.parameters[it];
			return generateInputPair(it, paramValue)
		});
		out.unshift(generateInputPair('id', this.id));
		return out;
	};

	this.loadFromObject = function (o) {
		// TODO: type checking
		Object.assign(this, o);
	};
}

function Connection() {
	this.id = randomName();
	this.fromModuleId = '';
	this.fromModulePort = '';
	this.toModuleId = '';
	this.toModulePort = '';

	this.update = function () {
		const elements = document.querySelectorAll(`[data-id="${this.id}"]`);
		const fromModuleDom = document.querySelector(`[data-id="${this.fromModuleId}"]`);
		const toModuleDom = document.querySelector(`[data-id="${this.toModuleId}"]`);
		const fromModulePortDom = fromModuleDom.querySelector(`[data-name="output-${this.fromModulePort}"]`);
		const toModulePortDom = toModuleDom.querySelector(`[data-name="input-${this.toModulePort}"]`);
		const fromRect = fromModulePortDom.getClientRects()[0];
		const toRect = toModulePortDom.getClientRects()[0];
		elements.forEach(element => {
			this.updatePosition(element, fromRect, toRect);
		});
	};

	this.draw = function () {
		const shownElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		shownElement.setAttribute('data-id', this.id);
		shownElement.classList.add('connection');
		const hiddenElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		hiddenElement.setAttribute('data-id', this.id);
		hiddenElement.classList.add('connection-event');
		const fromModuleDom = document.querySelector(`[data-id="${this.fromModuleId}"]`);
		const toModuleDom = document.querySelector(`[data-id="${this.toModuleId}"]`);
		if (fromModuleDom == null || toModuleDom == null) {
			console.error('Cannot draw line from', this.fromModuleId, this.fromModulePort, 'to', this.toModuleId, this.toModulePort);
			return undefined;
		}
		const fromModulePortDom = fromModuleDom.querySelector(`[data-name="output-${this.fromModulePort}"]`);
		const toModulePortDom = toModuleDom.querySelector(`[data-name="input-${this.toModulePort}"]`);
		if (fromModulePortDom == null || toModulePortDom == null) {
			console.error('Cannot draw line from', this.fromModuleId, this.fromModulePort, 'to', this.toModuleId, this.toModulePort);
			return undefined;
		}
		const fromRect = fromModulePortDom.getClientRects()[0];
		const toRect = toModulePortDom.getClientRects()[0];
		this.updatePosition(shownElement, fromRect, toRect);
		this.updatePosition(hiddenElement, fromRect, toRect);
		installConnectionEventListeners(shownElement);
		installConnectionEventListeners(hiddenElement);
		return [shownElement, hiddenElement];
	};

	this.updatePosition = function (element, fromRect, toRect) {
		const x1 = Math.round(fromRect.x + fromRect.width + 2);
		const y1 = Math.round(fromRect.y + fromRect.height / 2);
		const x2 = Math.round(toRect.x - 2);
		const y2 = Math.round(toRect.y + fromRect.height / 2);
		const diff = Math.min(500, Math.max(40, -4 * (x2 - x1)));
		element.setAttribute('d', `M ${x1} ${y1} C ${x1 + diff} ${y1}, ${x2 - diff} ${y2}, ${x2} ${y2}`);
		// element.setAttribute('x1', x1.toString());
		// element.setAttribute('y1', y1.toString());
		// element.setAttribute('x2', x2.toString());
		// element.setAttribute('y2', y2.toString());
	};

	this.save = function () {
		return this;
	};

	this.loadFromObject = function (o) {
		// TODO: type checking
		Object.assign(this, o);
	};
}

function Sketch(name) {
	this.nodules = [];
	this.connections = [];
	this.name = name || 'New Sketch';
	this.noduleCollections = ['./assets/nodules'];

	this.loadNoduleRepo = function () {
		const loader = new Loader(this.noduleCollections, this);
		return loader.load();
	};

	this.drawNodules = function () {
		return this.nodules.map(it => it.draw());
	};

	this.drawConnections = function () {
		return this.connections.map(it => it.draw());
	};

	this.addNodule = function (nodule) {
		this.nodules.push(nodule);
		appendBoard(nodule.draw());
	};

	this.deleteNodule = function (name) {
		const noduleIndex = this.getNoduleIndexById(name);
		if (noduleIndex >= 0) {
			const nodule = this.nodules[noduleIndex];
			const connectionsToBeDeleted = [...nodule.activeConnections]; // <- prevent concurrent modification
			connectionsToBeDeleted.forEach(id => {
				console.debug('deleting connection', id);
				deleteConnectionById(id);
			});
			this.nodules.splice(noduleIndex, 1);
			return true;
		} else {
			return false;
		}
	};

	this.makeConnection = function (from, to) {
		// `from` must be an output port, `to` must be an input port
		const fromParts = from.split('.');
		const toParts = to.split('.');
		const fromNoduleIndex = this.nodules.findIndex(x => x.id === fromParts[0]);
		if (fromNoduleIndex < 0) {
			console.error(from, 'not found');
			return undefined;
		}
		const toNoduleIndex = this.nodules.findIndex(x => x.id === toParts[0]);
		if (toNoduleIndex < 0) {
			console.error(to, 'not found');
			return undefined;
		}
		const fromNodule = this.nodules[fromNoduleIndex];
		const toNodule = this.nodules[toNoduleIndex];
		const fromPortIndex = fromNodule.output.findIndex(x => x.name === fromParts[1]);
		if (fromPortIndex < 0) {
			console.error(from, 'port not found');
			return undefined;
		}
		const toPortIndex = toNodule.input.findIndex(x => x.name === toParts[1]);
		if (toPortIndex < 0) {
			console.error(to, 'port not found');
			return undefined;
		}
		// test if source port or the target port is occupied
		const x = this.connections.findIndex(x => x.toModuleId === toParts[0] && x.toModulePort === toParts[1]);
		if (x >= 0) {
			console.error('Port already occupied');
			return undefined;
		}
		// everything checks out!
		const conn = new Connection();
		conn.fromModuleId = fromParts[0];
		conn.fromModulePort = fromParts[1];
		conn.toModuleId = toParts[0];
		conn.toModulePort = toParts[1];
		this.connections.push(conn);
		fromNodule.activeConnections.push(conn.id);
		toNodule.activeConnections.push(conn.id);
		return conn;
	};

	this.updateConnection = function (id) {
		const connectionIndex = this.connections.findIndex(x => x.id === id);
		if (connectionIndex >= 0) {
			const connection = this.connections[connectionIndex];
			connection.update();
		}
	};

	this.breakConnection = function (id) {
		const connectionIndex = this.connections.findIndex(x => x.id === id);
		if (connectionIndex < 0) {
			console.error(id, 'does not exist');
			return false;
		} else {
			const connection = this.connections[connectionIndex];
			const fromModuleIndex = this.nodules.findIndex(x => x.id === connection.fromModuleId);
			const toModuleIndex = this.nodules.findIndex(x => x.id === connection.toModuleId);
			const fromModule = this.nodules[fromModuleIndex];
			const toModule = this.nodules[toModuleIndex];
			const fromModuleActiveIndex = fromModule.activeConnections.findIndex(x => x.id === id);
			const toModuleActiveIndex = toModule.activeConnections.findIndex(x => x.id === id);
			if (fromModuleIndex >= 0) {
				fromModule.activeConnections.splice(fromModuleActiveIndex, 1);
			}
			if (toModuleActiveIndex >= 0) {
				toModule.activeConnections.splice(toModuleActiveIndex, 1);
			}
			this.connections.splice(connectionIndex, 1);
			return true;
		}
	};

	this.loadFromObject = function (obj) {
		if ('nodules' in obj && 'connections' in obj && 'name' in obj && 'noduleCollections' in obj) {
			Object.assign(this, obj);
			this.nodules = this.nodules.map(it => {
				const nodule = new Nodule(this);
				nodule.loadFromObject(it);
				return nodule;
			});
			this.connections = this.connections.map(it => {
				const connection = new Connection();
				connection.loadFromObject(it);
				return connection;
			});
		} else {
			throw new Error('Invalid sketch');
		}
	};

	this.compile = function () {
		const terminalBlocks = this.nodules.filter(x => x.output.length < 1);
		return terminalBlocks.map(it => this.compileNodule(it)).join(';');
	};

	this.compileNodule = function (nodule) {
		const initial = nodule.name;
		const params = JSON.stringify(nodule.parameters);
		// we can use a little bit of optimization here?
		const inputs = this.connections.filter(it => it.toModuleId === nodule.id);
		if (inputs.length === 0) {
			// source
			return `${initial}({},${params})`;
		} else {
			// sink
			const tween = inputs.map(it => {
				const source = this.getNoduleById(it.fromModuleId)
				const expr = this.compileNodule(source);
				return {
					expr: expr,
					sinkPort: it.toModulePort,
					sourcePort: it.fromModulePort
				}
			}).reduce((a, v) => {
				return a + `"${v.sinkPort}":${v.expr}["${v.sourcePort}"],`;
			}, '');
			return `${initial}({${tween}},${params})`;
		}
	};

	this.run = function () {
		const output = this.compile();
		eval(output); // yeet, this is like, fucked up terribly
	};

	this.getNoduleIndexById = function (id) {
		return this.nodules.findIndex(x => x.id === id);
	};

	this.getNoduleById = function (id) {
		const index = this.getNoduleIndexById(id);
		return this.nodules[index];
	};

	this.toObject = function () {
		return {
			name: this.name,
			nodules: this.nodules,
			connections: this.connections
		};
	};
}

Sketch.fromJSON = function (str) {
	try {
		const obj = JSON.parse(str);
		const sketch = new Sketch();
		sketch.loadFromObject(obj);
		return sketch;
	} catch (e) {
		console.error(e);
	}
};

Sketch.fromRemote = function (url) {
	return loadDataPromise(url).then(data => Sketch.fromJSON(data));
};

Nodule.fromJSON = function (str) {
	try {
		const obj = JSON.parse(str);
		const nodule = new Nodule(this);
		nodule.loadFromObject(obj);
		return nodule;
	} catch (e) {
		console.error(e);
	}
};
