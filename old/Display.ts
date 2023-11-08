let _width = screen.width,
    _height = screen.height,
    _canvas: HTMLCanvasElement,
    _ctx:CanvasRenderingContext2D,
    _updateCanvasSize = false,
    unpaused = true;

const particleWidth = 10;
let ratio = 1;

class Display {
    particles = [] as Particle[];

    get unpaused() {
        return unpaused;
    }
    set unpaused(value:boolean) {
        unpaused = value;
    }

    constructor(query="#display") {
        const canvas = document.querySelector(query);

        this.applyEvents(canvas,query);

        canvas.width = _width;
        canvas.height = _height;
        _canvas = canvas;

        _ctx = canvas.getContext("2d");

        _updateCanvasSize = false;

        requestAnimationFrame(this.update.bind(this));
    }
    applyEvents(canvas:Element, query:string): asserts canvas is HTMLCanvasElement {
        if (!(canvas instanceof HTMLCanvasElement)) throw `The element with query ${query} is not an HTMLCanvasElement!`;

        canvas.addEventListener("mousedown", e => {
            e.preventDefault();
            switch (e.button) {
                // Left button
                case 0:
                    break;
                // Wheel/Middle button
                case 1:
                    break;
                // Right button
                case 2:
                    break;
                // Any other auxiliary button
                default:
                    break;
            }
        });

        canvas.addEventListener("mouseup", e => {
            e.preventDefault();
            switch (e.button) {
                // Left button
                case 0:
                    break;
                // Wheel/Middle button
                case 1:
                    break;
                // Right button
                case 2:
                    break;
                // Any other auxiliary button
                default:
                    break;
            }
        });
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
        if (unpaused) {
            _ctx.clearRect(0,0,_width,_height);
            for (let i=0; i<this.particles.length; i++) {
                let particle = this.particles[i];
                _ctx.drawImage(MATERIAL_CACHE[particle.material.type], particle.x, particle.y);
            }
        }
        requestAnimationFrame(this.update.bind(this));
    }
}

/** How many frames after the page loads should the fps detector wait? Default=5 */
let _waitFrames = 5,
/** Number of taken sample timestamps required for the fps detection. Default=10 */
    _fpsSamples = 10,
/** Very small number that helps preventing wrong fps detection. Default=0.004973808593749851 */
    _fpsCalculationEpsilon = 0.004973808593749851,
/** Detected refreshRate. Needs to be calculated only one time. Read-only. */
    _refreshRate: number;



window.addEventListener("resize", _ => _updateCanvasSize = true);
window.addEventListener("wheel", e => {
    ratio = Math.max(ratio + Math.sign(e.deltaY) *, 1);
});