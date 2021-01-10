function clearElement(x) {
	while (x.lastElementChild) {
		x.removeChild(x.lastElementChild);
	}
}

function disable(x) {
	x.setAttribute('disabled', '1');
}

function enable(x) {
	x.removeAttribute('disabled');
}

function disableAllButtonsIn(x) {
	x.querySelectorAll('button').forEach(btn => {
		disable(btn);
	});
}

function enableAllButtonsIn(x) {
	x.querySelectorAll('button').forEach(btn => {
		enable(btn);
	});
}

function randomName(length = 8) {
	let out = '';
	for (let i = 0; i < length; i++) {
		out += randomChar();
	}
	return out;
}

function randomChar(alphabet = '0123456789abcdefghijklmnopqrstuvwxyz') {
	return alphabet.charAt(Math.floor(Math.random() * alphabet.length));
}

function loadDataPromise(url, method = 'GET') {
	return new Promise((resolve, reject) => {
		const req = new XMLHttpRequest();
		req.addEventListener('load', () => {
			resolve(req.responseText);
		});
		req.addEventListener('error', e => {
			reject(e);
		});
		req.open(method, url);
		req.send();
	})
}
