let _width = screen.width, _height = screen.height, _canvas, _ctx, _updateCanvasSize = false, _unpaused = true;
class Display {
    particles = [];
    get unpaused() {
        return _unpaused;
    }
    set unpaused(value) {
        _unpaused = value;
    }
    constructor(query = "#display") {
        const canvas = document.querySelector(query);
        if (!(canvas instanceof HTMLCanvasElement))
            throw `The element with query ${query} is not an HTMLCanvasElement!`;
        canvas.width = _width;
        canvas.height = _height;
        _canvas = canvas;
        _ctx = canvas.getContext("2d");
        _updateCanvasSize = false;
        requestAnimationFrame(this.update.bind(this));
    }
    resizeCanvas() {
        _width = window.innerWidth;
        _height = window.innerHeight;
        _canvas.width = _width;
        _canvas.height = _height;
        _updateCanvasSize = false;
    }
    update() {
        if (_updateCanvasSize)
            this.resizeCanvas();
        if (_unpaused) {
            _ctx.clearRect(0, 0, _width, _height);
            for (let i = 0; i < this.particles.length; i++) {
                let particle = this.particles[i];
                _ctx.drawImage(_cache[particle.type], particle.position[0], particle.position[1]);
            }
        }
        requestAnimationFrame(this.update.bind(this));
    }
}
window.addEventListener("resize", () => _updateCanvasSize = true);
const _particleWidth = 10, _cache = [];
class Material {
    static maxTypeValue;
    static typeToName;
    type;
    position;
    acceleration;
    constructor(type, x, y) {
        if (typeof type === "undefined" || type < 0 || type > Material.maxTypeValue)
            throw `${type} is not a valid material type index!`;
        this.type = type;
        this.position = [x, y];
        this.acceleration = [0, 0];
    }
}
(function () {
    let colors = {
        sand: "#C2B280",
        stone: "#888C8D"
    }, keys = Object.keys(colors), cache = [];
    for (let i = 0; i < keys.length; i++) {
        let material = keys[i];
        let canvas = document.createElement("canvas");
        canvas.width = _particleWidth;
        canvas.height = _particleWidth;
        let ctx = canvas.getContext("2d");
        ctx.fillStyle = colors[material];
        ctx.fillRect(0, 0, _particleWidth, _particleWidth);
        _cache[i] = canvas;
    }
    Material.maxTypeValue = keys.length - 1;
    Material.typeToName = (type) => keys[type] || "invalid type";
})();
const display = new Display();
