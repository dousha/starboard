function clearElement(x) {
	while (x.lastElementChild) {
		x.removeChild(x.lastElementChild);
	}
}
