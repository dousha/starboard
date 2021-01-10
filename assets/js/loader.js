function Loader(base, sketch) {
	this.nodules = {};

	this.load = async function () {
		const index = await loadDataPromise(`${base}/index.json`);
		const items = JSON.parse(index);
		const loadingNodules = await Promise.all(items.map(it => loadDataPromise(`${base}/${it}`).then(x => JSON.parse(x))));
		await Promise.all(loadingNodules
			.filter(it => 'name' in it && 'checksum' in it && 'nodules' in it && 'script' in it)
			.map(async (it) => {
				const script = (await loadDataPromise(`${base}/${it.script}`)).replace(/[\r\n]/gmi, '');
				const encoder = new TextEncoder();
				const data = encoder.encode(script);
				const digest = await crypto.subtle.digest('SHA-256', data);
				const digestText = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
				if (it.checksum.toLowerCase().trim() !== digestText.toLowerCase().trim()) {
					console.error('Checksum mismatch, expected', it.checksum, 'actual', digestText);
				} else {
					console.debug('Loading', it.name);
					(1, eval)(script);
					it.nodules.forEach(nodule => {
						this.nodules[nodule.name] = nodule;
					});
					this.populateNoduleList(it.name, it.nodules);
				}
			}));
	};

	this.createNodule = function (name, x, y) {
		const nodulePrototype = this.nodules[name];
		// everything else is fine, we just need to allocate a new name
		if (!window.sketch) {
			console.error('No sketch loaded');
			return;
		}
		const namePrefix = name.toLowerCase();
		const namePostfix = window.sketch.nodules.filter(x => x.id.startsWith(namePrefix)).length + 1;
		const noduleInstance = {...nodulePrototype};
		noduleInstance['x'] = x;
		noduleInstance['y'] = y;
		noduleInstance['id'] = `${namePrefix}-${namePostfix}`;
		noduleInstance.parameters = Object.create({});
		if (nodulePrototype.parameters) {
			noduleInstance['paramTypes'] = nodulePrototype.parameters;
			Object.keys(nodulePrototype.parameters).forEach(param => {
				const paramConfig = nodulePrototype.parameters[param];
				noduleInstance.parameters[param] = paramConfig.default;
			});
		}
		const nodule = new Nodule(sketch);
		nodule.loadFromObject(noduleInstance);
		return nodule;
	};

	this.populateNoduleList = function (groupName, nodules) {
		const container = document.getElementById('nodule-list');
		const labelWrapper = document.createElement('div');
		labelWrapper.classList.add('nodule-list-label-wrapper')
		const label = document.createElement('span');
		label.innerText = groupName;
		label.classList.add('nodule-list-label');
		const hr = document.createElement('hr');
		hr.classList.add('nodule-list-label-splitter');
		labelWrapper.append(label, hr);
		container.append(labelWrapper);
		nodules.forEach(it => {
			const wrapper = document.createElement('div');
			wrapper.classList.add('nodule-wrapper');
			// TODO: maybe a better one
			const name = document.createElement('span');
			name.innerText = it.name;
			wrapper.append(name);
			wrapper.addEventListener('click', e => {
				e.preventDefault();
				e.stopPropagation();
				if (!window.sketch) {
					console.error('No sketch loaded');
					return;
				}
				const nodule = this.createNodule(it.name, window.contextMenuX, window.contextMenuY);
				window.sketch.addNodule(nodule);
				clearDialog();
			});
			container.append(wrapper);
		});
	};
}
