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
    } catch (e) {
        console.error(e);
    }
};
