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

	this.drawIo = function (xs) {
		const box = document.createElement('div');
		box.classList.add('nodule-handle-content');
		xs.forEach(it => {
			const node = document.createElement('span');
			node.classList.add('nodule-label');
			node.innerText = it.name;
			installHandelEventListeners(node, it.name, this.id);
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
		leftHandle.append(this.drawIo(this.input));
		rightHandle.append(this.drawIo(this.output));
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
		}
	};

	this.save = function () {
		let out = {};
		Object.assign(out, this);
		delete out.activeConnections;
		return out;
	};

	this.loadFromObject = function (o) {
		// TODO: type checking
		Object.assign(this, o);
	};
}

function Connection() {
	this.fromModuleId = '';
	this.fromModulePort = '';
	this.toModuleId = '';
	this.toModulePort = '';

	this.draw = function () {

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

	this.draw = function () {
		// TODO: load connections
		return this.nodules.map(it => it.draw());
	};

	this.makeConnection = function (from, to) {
		// `from` must be an output port
		const fromParts = from.split('.');
		const toParts = to.split('.');
		const fromNoduleIndex = this.nodules.findIndex(x => x.id === fromParts[0]);
		if (fromNoduleIndex < 0) {
			console.error(from, 'not found');
			return false;
		}
		const toNoduleIndex = this.nodules.findIndex(x => x.id === toParts[0]);
		if (toNoduleIndex < 0) {
			console.error(to, 'not found');
			return false;
		}
		const fromNodule = this.nodules[fromNoduleIndex];
		const toNodule = this.nodules[toNoduleIndex];
		const fromPortIndex = fromNodule.output.findIndex(x => x.name === fromParts[1]);
		if (fromPortIndex < 0) {
			console.error(from, 'port not found');
			return false;
		}
		const toPortIndex = toNodule.input.findIndex(x => x.name === toParts[1]);
		if (toPortIndex < 0) {
			console.error(to, 'port not found');
			return false;
		}
		// everything checks out!
	};

	this.loadFromObject = function (obj) {
		if ('nodules' in obj && 'connections' in obj) {
			Object.assign(this, obj);
			this.nodules = this.nodules.map(it => {
				const nodule = new Nodule();
				nodule.loadFromObject(it);
				return nodule;
			});
			// TODO: connections may need to do the same
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
