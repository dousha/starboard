function Loader(base) {
	this.nodules = [];

	this.load = function () {
		loadDataPromise(`${base}/index.json`).then(res => {
			const items = JSON.parse(res);
			Promise.all(items.map(path => loadDataPromise(`${base}/${path}`)))
				.then(things => {
					things.map(it => JSON.parse(it))
						.forEach(it => {
							if ('checksum' in it && 'nodules' in it && 'script' in it) {
								const checksum = it.checksum.toLowerCase().trim();
								loadDataPromise(`${base}/${it.script}`).then(x => {
									const encoder = new TextEncoder();
									const data = encoder.encode(x);
									const digestPromise = crypto.subtle.digest('SHA-256', data).then(result =>
										Array.from(new Uint8Array(result)).map(b => b.toString(16).padStart(2, '0')).join('')
									);
									digestPromise.then(digest => {
										if (digest.toLowerCase().trim() === checksum) {
											console.debug('Loaded', it.script);
											// the (1, ) part is essential if we need to
											// load things into the global context
											// yes, it is horrible. we need to encapsulate it
											// in a later stage
											(1, eval)(x);
											this.nodules.push(...it.nodules);
										} else {
											console.error('Checksum mismatch! Expected', digest, 'Got', checksum);
										}
									});
								});
							} else {
								console.error('Invalid nodule library')
								console.error(it);
							}
						}); // TODO
				});
		});
	};
}
