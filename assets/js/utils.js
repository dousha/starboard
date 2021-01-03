function clearElement(x) {
	while (x.lastElementChild) {
		x.removeChild(x.lastElementChild);
	}
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
