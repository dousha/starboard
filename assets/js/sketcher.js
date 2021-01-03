function Nodule() {
	this.id = '';
	this.name = '';
	this.input = [];
	this.output = [];
	this.parameters = {};

	this.x = 0;
	this.y = 0;

	this.activeConnections = [];

	this.drawParam = function () {
		const label = document.createElement('span');
		label.classList.add('nodule-parameters');
		label.innerText = Object.keys(this.parameters).map(it => `${it}=${this.parameters[it]}`).join('\n');
		return label;
	};

	this.drawIo = function (xs, type) {
		const box = document.createElement('div');
		box.classList.add('nodule-handle-content');
		xs.forEach(it => {
			const node = document.createElement('span');
			node.classList.add('nodule-label');
			node.innerText = it.name;
			node.setAttribute('data-name', `${type}-${it.name}`);
			installPortEventListeners(node, it.name, this.id);
			box.append(node);
		});
		return box;
	};

	this.draw = function () {
		const outerBox = document.createElement('div');
		outerBox.classList.add('grip');
		outerBox.classList.add('block');
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
		content.append(nameLabel, paramLabel);
		leftHandle.append(this.drawIo(this.input, 'input'));
		rightHandle.append(this.drawIo(this.output, 'output'));
		outerBox.append(leftHandle, content, rightHandle);
		outerBox.style.top = `${this.y}px`;
		outerBox.style.left = `${this.x}px`;
		outerBox.setAttribute('data-id', this.id);
		installBlockEventListeners(outerBox, this.move.bind(this));
		return outerBox;
	};

	this.move = function (x, y) {
		if (!isNaN(x) && !isNaN(y)) {
			this.x = x;
			this.y = y;
			this.activeConnections.forEach(it => it.update());
		}
	};

	this.save = function () {
		let out = {};
		Object.assign(out, this);
		out.activeConnections = out.activeConnections.map(x => x.id);
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
		const element = document.getElementById(this.id);
		const fromModuleDom = document.querySelector(`[data-id="${this.fromModuleId}"]`);
		const toModuleDom = document.querySelector(`[data-id="${this.toModuleId}"]`);
		const fromModulePortDom = fromModuleDom.querySelector(`[data-name="output-${this.fromModulePort}"]`);
		const toModulePortDom = toModuleDom.querySelector(`[data-name="input-${this.toModulePort}"]`);
		const fromRect = fromModulePortDom.getClientRects()[0];
		const toRect = toModulePortDom.getClientRects()[0];
		this.updatePosition(element, fromRect, toRect);
	};

	this.draw = function () {
		const element = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		element.setAttribute('id', this.id);
		element.setAttribute('stroke', 'black');
		element.setAttribute('stroke-width', '2');
		element.classList.add('connection');
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
		this.updatePosition(element, fromRect, toRect);
		installConnectionEventListeners(element);
		return element;
	};

	this.updatePosition = function (element, fromRect, toRect) {
		const x1 = Math.floor(fromRect.x + fromRect.width / 2);
		const y1 = Math.floor(fromRect.y + fromRect.height / 2);
		const x2 = Math.floor(toRect.x + fromRect.width / 2);
		const y2 = Math.floor(toRect.y + fromRect.height / 2);
		element.setAttribute('x1', x1.toString());
		element.setAttribute('y1', y1.toString());
		element.setAttribute('x2', x2.toString());
		element.setAttribute('y2', y2.toString());
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

	this.drawNodules = function () {
		return this.nodules.map(it => it.draw());
	};

	this.drawConnections = function () {
		return this.connections.map(it => it.draw());
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
		const x = this.connections.findIndex(x => (x.fromModuleId === fromParts[0] && x.fromModulePort === fromParts[1]) || (x.toModuleId === toParts[0] && x.toModulePort === toParts[1]));
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
		fromNodule.activeConnections.push(conn);
		toNodule.activeConnections.push(conn);
		return conn;
	};

	this.breakConnection = function (id) {
		const connectionIndex = this.connections.findIndex(x => x.id === id);
		if (connectionIndex < 0) {
			console.error(id, 'does not exist');
			return true;
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
		if ('nodules' in obj && 'connections' in obj) {
			Object.assign(this, obj);
			this.nodules = this.nodules.map(it => {
				const nodule = new Nodule();
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
		// TODO
	};

	this.run = function () {
		// TODO
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

Nodule.fromJSON = function (str) {
	try {
		const obj = JSON.parse(str);
		const nodule = new Nodule();
		nodule.loadFromObject(obj);
		return nodule;
	} catch (e) {
		console.error(e);
	}
};
