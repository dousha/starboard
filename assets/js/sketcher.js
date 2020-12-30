function drawBox() {
	//
}

function Nodule() {
	this.name = '';
	this.input = [];
	this.output = [];
	this.parameters = {};

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
			console.debug(it);
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
		return outerBox;
	};

	this.loadFromObject = function (o) {
		// TODO: type checking
		Object.assign(this, o);
	};
}

function Sketch(name) {
	this.vertices = [];
	this.edges = [];
	this.name = name || 'New Sketch';

	this.draw = function () {
		// TODO
	};

	this.loadFromObject = function (obj) {
		if ('vertices' in obj && 'edges' in obj && 'name' in obj) {
			Object.assign(this, obj);
		} else {
			throw new Error('Invalid sketch');
		}
	};

	this.toObject = function () {
		return {
			name: this.name,
			vertices: this.vertices,
			edges: this.edges
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
