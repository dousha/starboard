function Loader(base) {
	this.nodules = {};

	this.load = async function () {
		const index = await loadDataPromise(`${base}/index.json`);
		const items = JSON.parse(index);
		const loadingNodules = await Promise.all(items.map(it => loadDataPromise(`${base}/${it}`).then(x => JSON.parse(x))));
		await Promise.all(loadingNodules
			.filter(it => 'checksum' in it && 'nodules' in it && 'script' in it)
			.map(async (it) => {
				const script = await loadDataPromise(`${base}/${it.script}`);
				const encoder = new TextEncoder();
				const data = encoder.encode(script);
				const digest = await crypto.subtle.digest('SHA-256', data);
				const digestText = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
				if (it.checksum.toLowerCase().trim() !== digestText.toLowerCase().trim()) {
					console.error('Checksum mismatch, expected', it.checksum, 'actual', digestText);
				} else {
					(1, eval)(script);
					it.nodules.forEach(nodule => {
						this.nodules[nodule.name] = nodule;
					});
				}
			}));
		this.populateNoduleList();
	};

	this.createNodule = function (name) {
		const nodulePrototype = this.nodules[name];
		// everything else is fine, we just need to allocate a new name
		if (!window.sketch) {
			console.error('No sketch loaded');
			return;
		}
		const namePrefix = name.toLowerCase();
		const namePostfix = window.sketch.nodules.filter(x => x.id.startsWith(namePrefix)).length + 1;
		const noduleInstance = {};
		Object.assign(noduleInstance, nodulePrototype);
		noduleInstance['id'] = `${namePrefix}-${namePostfix}`;
		Object.keys(noduleInstance.parameters).forEach(param => {
			const paramConfig = noduleInstance.parameters[param];
			noduleInstance.parameters[param] = paramConfig.defaultValue;
		});
		const nodule = new Nodule();
		nodule.loadFromObject(noduleInstance);
		return nodule;
	};

	this.populateNoduleList = function () {
		const container = document.getElementById('nodule-list');
		Object.keys(this.nodules).forEach(it => {
			const wrapper = document.createElement('div');
			wrapper.classList.add('nodule-wrapper');
			// TODO: maybe a better one
			const name = document.createElement('span');
			name.innerText = it;
			wrapper.append(name);
			container.append(wrapper);
		});
	};
}
