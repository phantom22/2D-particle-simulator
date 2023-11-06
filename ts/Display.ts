let _width = screen.width,
    _height = screen.height,
    _canvas: HTMLCanvasElement,
    _ctx:CanvasRenderingContext2D,
    _updateCanvasSize = false,
    _unpaused = true;

class Display {
    particles = [] as Material[];

    get unpaused() {
        return _unpaused;
    }
    set unpaused(value:boolean) {
        _unpaused = value;
    }

    constructor(query="#display") {
        const canvas = document.querySelector(query);
        if (!(canvas instanceof HTMLCanvasElement)) throw `The element with query ${query} is not an HTMLCanvasElement!`;

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
    update()  {
        if (_updateCanvasSize) this.resizeCanvas();
        if (_unpaused) {
            _ctx.clearRect(0,0,_width,_height);
            for (let i=0; i<this.particles.length; i++) {
                let particle = this.particles[i];
                _ctx.drawImage(_cache[particle.type], particle.position[0], particle.position[1]);
            }
        }
        requestAnimationFrame(this.update.bind(this));
    }
}

window.addEventListener("resize", () => _updateCanvasSize = true);