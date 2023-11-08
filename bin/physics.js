/** Canvas width. Set to window.innerWidth. */
let width = 0, 
/** Canvas height. Set to window.innerHeight. */
height = 0, 
/** Canvas offset x. How far away is the x component from 0. */
offset_x = 0, 
/** Canvas offset y. How far away is the y component from 0. */
offset_y = 0, _canvas, ctx, 
/** If true the canvas will keep updating (image and physics calculations). */
unpaused = true, 
/** Current canvas zoom. 1 is the default value. */
zoom = 1, min_zoom = 0.1, max_zoom = 5, 
/** This flag is set to true whenever the window is resized. On the next render frames the canvas width and height will be updated. */
_updateCanvasSize = false, 
/** Time between two physics frames. Measured in milliseconds. Read-only. */
fixedDeltaTime, 
/** Time took to render current frame. Measured in milliseconds. Read-only. */
deltaTime, physicsIntervalId, renderIntervalId, 
/** -1 = none, 0 = drawing, 1 = moving, 2 = removing/inspecting */
_drag_type = -1, _drag_before_pos = null;
function draw_particle(p) {
    if (p === undefined || p.is_visible() === false)
        return;
    const pos = p.screen_position();
    ctx.drawImage(MATERIAL_CACHE[p.material.type], pos[0], pos[1]);
}
class Display {
    /** How many frames after the page loads should the fps detector wait? Default=5 */
    static WAIT_FRAMES = 5;
    /** Number of taken sample timestamps required for the fps detection. Default=10 */
    static FPS_SAMPLES = 10;
    /** Very small number that helps preventing wrong fps detection. Default=0.004973808593749851 */
    static FPS_CALCULATION_EPSILON = 0.004973808593749851;
    /** The refresh rate of the screen. Needs to be calculated only one time. Read-only. */
    static REFRESH_RATE;
    /** Is the current device a mobile phone? Needed for performance tweaks. Read-only. */
    static IS_RUN_ON_PHONE = (function (a) {
        return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4));
    })(navigator.userAgent || navigator.vendor || window.opera);
    /** Max render frames per second. Read-only.*/
    fps;
    /** Max physics frames per second. Read-only.*/
    fixedFps;
    constructor(query, settings = {}) {
        const c = document.querySelector(query);
        if (c instanceof HTMLCanvasElement) {
            c.width = width;
            c.height;
            _canvas = c;
            ctx = c.getContext("2d");
            this.#applySettings(settings);
            this.#init().then(fps => this.start(fps, settings.fixedFps));
        }
        else
            throw `Couldn't find canvas with query '${query}'`;
    }
    #applySettings({} = {}) {
    }
    #applyEvents() {
        const zoomDelta = 1 / this.fps;
        _canvas.addEventListener("wheel", e => {
            zoom = Math.min(min_zoom, Math.max(zoom - Math.sign(e.deltaY) * zoomDelta, max_zoom));
        });
        _canvas.addEventListener("mousedown", e => {
            e.preventDefault();
            switch (e.button) {
                // Left button
                case 0:
                    _drag_type = 0;
                    break;
                // Wheel/Middle button
                case 1:
                    _drag_type = 1;
                    break;
                // Right button
                case 2:
                    _drag_type = 2;
                    break;
                // Any other auxiliary button
                default:
                    break;
            }
            _drag_before_pos = [e.clientX, e.clientY];
        });
        _canvas.addEventListener("mousemove", e => {
            if (_drag_type === -1)
                return;
            const currentPos = [e.clientX, e.clientY];
            switch (_drag_type) {
                // Left button
                case 0:
                    break;
                // Wheel/Middle button
                case 1:
                    set_offset(offset_x + _drag_before_pos[0] - currentPos[0], offset_y + _drag_before_pos[1] - currentPos[1]);
                    break;
                // Right button
                case 2:
                    break;
                // Any other auxiliary button
                default:
                    _drag_type = -1;
                    return;
            }
            _drag_before_pos = currentPos;
        });
        _canvas.addEventListener("mouseup", e => {
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
            _drag_type = -1;
        });
        _canvas.addEventListener("mouseleave", _ => {
            _drag_type = -1;
        });
    }
    /** Method used to detect screen refresh rate. If refresh rate was already calculated => resolve with that value */
    #init() {
        return new Promise(resolve => {
            if (Display.REFRESH_RATE !== undefined) {
                resolve(Display.REFRESH_RATE);
                return;
            }
            /** timestamps[0] is the start of the elapsed time; timestamps[i] (with 0<i<FPS_SAMPLES+1) is where all the sample fps timestamps are. */
            const timestamps = [];
            let id, framesToWait = Display.WAIT_FRAMES;
            function frameStep(timestamp) {
                if (framesToWait > 0) {
                    framesToWait--;
                    if (framesToWait === 0)
                        timestamps.push(timestamp);
                }
                else if (timestamps.length - 1 < Display.FPS_SAMPLES) {
                    timestamps.push(timestamp);
                }
                else {
                    const avg = timestamps
                        .map((v, i) => v - timestamps[i - 1]) // calc deltaTime between each timestamp
                        .slice(1) // remove timestamps[0] which is non relevant to the calculation
                        .reduce((a, b) => a + b) / (timestamps.length - 1) - Display.FPS_CALCULATION_EPSILON * 2; // divide the sum of the deltas by the sampleCount
                    let o;
                    if (avg <= 2.777778)
                        o = 360;
                    else if (avg <= 4.166667)
                        o = 240;
                    else if (avg <= 6.060606)
                        o = 165;
                    else if (avg <= 6.944444)
                        o = 144;
                    else if (avg <= 8.333333)
                        o = 120;
                    else if (avg <= 11.111111)
                        o = 90;
                    else if (avg <= 13.333333)
                        o = 75;
                    else if (avg <= 16.666667)
                        o = 60;
                    else if (avg <= 33.333333)
                        o = 30;
                    else
                        o = Math.floor(1000 / avg);
                    Object.defineProperty(Display, "REFRESH_RATE", { value: o, writable: false });
                    cancelAnimationFrame(id);
                    resolve(o);
                    return;
                }
                id = requestAnimationFrame(frameStep);
            }
            id = requestAnimationFrame(frameStep);
        });
    }
    start(fps, fixedFps) {
        Object.defineProperty(this, "fps", { value: fps, writable: false });
        let _fixedFps = fixedFps | fps;
        Object.defineProperty(this, "fixedFps", { value: _fixedFps, writable: false });
        fixedDeltaTime = 1000 / _fixedFps;
        unpaused = true;
        this.#applyEvents();
        _updateCanvasSize = true;
        physicsIntervalId = setInterval(this.fixedPhysicsStep.bind(this), fixedDeltaTime);
        renderIntervalId = requestAnimationFrame(this.renderFrame.bind(this, 0, 0));
    }
    fixedPhysicsStep() {
        if (document.hidden === false && unpaused) {
            for (let i = 0; i < particles.length; i++)
                particles[i].step();
        }
    }
    adaptResolution() {
        if (_updateCanvasSize) {
            width = window.innerWidth;
            height = window.innerHeight;
            _canvas.width = width;
            _canvas.height = height;
            _updateCanvasSize = false;
            update_bounds();
        }
    }
    renderFrame(currFrame, prevFrame) {
        this.adaptResolution();
        deltaTime = currFrame - prevFrame;
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i += 10) {
            draw_particle(particles[i]);
            draw_particle(particles[i + 1]);
            draw_particle(particles[i + 2]);
            draw_particle(particles[i + 3]);
            draw_particle(particles[i + 4]);
            draw_particle(particles[i + 5]);
            draw_particle(particles[i + 6]);
            draw_particle(particles[i + 7]);
            draw_particle(particles[i + 8]);
            draw_particle(particles[i + 9]);
        }
        renderIntervalId = requestAnimationFrame(nextFrame => this.renderFrame.call(this, nextFrame, currFrame));
    }
}
Object.defineProperty(Display, "IS_RUN_ON_PHONE", { writable: false });
window.addEventListener("resize", _ => _updateCanvasSize = true);
const particles = [], PARTICLE_WIDTH = 10, INV_PARTICLE_WIDTH = 1 / PARTICLE_WIDTH;
/** Visibility bounds - any particle with a x value higher than this can be visible horizontally. */
let bounds_min_x = 0, 
/** Visibility bounds - any particle with a y value higher than this can be visible vertically. */
bounds_min_y = 0, 
/** Visibility bounds - any particle with a x smaller than this can be visible horizontally. */
bounds_max_x = 0, 
/** Visibility bounds - any particle with a y value smaller than this can be visible horizontally. */
bounds_max_y = 0;
/** Updates the visibility bounds of the canvas for 2D culling. */
function update_bounds() {
    bounds_min_x = offset_x - PARTICLE_WIDTH;
    bounds_max_x = width + offset_x;
    bounds_min_y = offset_y - PARTICLE_WIDTH;
    bounds_max_y = height + offset_y;
}
function set_offset(x_value, y_value) {
    offset_x = x_value;
    offset_y = y_value;
    bounds_min_x = x_value - PARTICLE_WIDTH;
    bounds_max_x = width + x_value;
    bounds_min_y = y_value - PARTICLE_WIDTH;
    bounds_max_y = height + y_value;
}
function set_width(value) {
    width = value;
    bounds_max_x = value + offset_x;
}
function set_height(value) {
    height = value;
    bounds_max_y = height + offset_y;
}
function set_offset_x(value) {
    offset_x = value;
    bounds_min_x = value - PARTICLE_WIDTH;
    bounds_max_x = width + value;
    console.log(DEBUG_get_bounds());
}
function set_offset_y(value) {
    offset_y = value;
    bounds_min_y = value - PARTICLE_WIDTH;
    bounds_max_y = height + value;
}
/** Converts the event.y to the actual world position. */
function DOM_to_world(clientX, clientY) {
    const rect = _canvas.getBoundingClientRect(), scaleX = _canvas.width / rect.width, scaleY = _canvas.height / rect.height;
    return [
        (clientX - rect.left) * scaleX,
        (clientY - rect.top) * scaleY
    ];
}
/** Converts screen position (absolute position) to world position. */
function screen_to_world(x, y) {
    return [
        x + offset_x,
        y + offset_y
    ];
}
/** Converts world position to screen position. */
function world_to_screen(x, y) {
    return [
        x - offset_x,
        y - offset_y
    ];
}
class Particle {
    /** Particles x position. */
    x;
    /** Particles y position. */
    y;
    /** Particles x speed. Measured in m/ms. */
    vx;
    /** Particles y speed. Measured in m/ms. */
    vy;
    /** Particles x acceleration. Measured in m/ms^2. */
    ax;
    /** Particles y acceleration. Measured in m/ms^2. */
    ay;
    /** Particles material.  */
    material;
    collides_with = [];
    is_grounded = false;
    snap_to_grid = false;
    constructor(material_type, x, y, vx = 0, vy = 0, ax = 0, ay = 0) {
        this.material = new Material(material_type);
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.ax = ax;
        this.ay = ay;
    }
    /** Called during the fixedUpdate, this calculates the new speed and position of the particle. */
    step() {
        this.vx += this.ax * fixedDeltaTime;
        this.vy += this.ay * fixedDeltaTime;
        this.x += this.vx * fixedDeltaTime;
        this.y += this.vy * fixedDeltaTime;
    }
    region() {
        return [
            ~~(this.x * INV_PARTICLE_REGION_SIZE),
            ~~(this.y * INV_PARTICLE_REGION_SIZE)
        ];
    }
    is_visible() {
        return this.x > bounds_min_x && this.x < bounds_max_x && this.y > bounds_min_y && this.y < bounds_max_y;
    }
    screen_position() {
        const screen_pos_x = this.x - offset_x, screen_pos_y = this.y - offset_y;
        return this.snap_to_grid === true ? [
            ~~(screen_pos_x * INV_PARTICLE_WIDTH) * PARTICLE_WIDTH,
            ~~(screen_pos_y * INV_PARTICLE_WIDTH) * PARTICLE_WIDTH
        ] : [
            screen_pos_x,
            screen_pos_y
        ];
    }
    stop_horizontal_movement() {
        this.ax = 0;
        this.vx = 0;
    }
    stop_vertical_movement() {
        this.ay = 0;
        this.vy = 0;
    }
}
const PARTICLE_REGION_SIZE = PARTICLE_WIDTH * 5, INV_PARTICLE_REGION_SIZE = 1 / PARTICLE_REGION_SIZE;
const MATERIAL_CACHE = [];
;
class Material {
    static MATERIALS = {
        sand: "#C2B280",
        stone: "#888C8D"
    };
    static MAX_TYPE_VALUE = Object.keys(Material.MATERIALS).length - 1;
    static TYPE_TO_NAME;
    type;
    constructor(type) {
        if (type === undefined || type < 0 || type > Material.MAX_TYPE_VALUE)
            throw `${type} is not a valid material type index!`;
        this.type = type;
    }
}
(function () {
    const keys = Object.keys(Material.MATERIALS), size = PARTICLE_WIDTH;
    for (let i = 0; i < keys.length; i++) {
        let material = keys[i], canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        let ctx = canvas.getContext("2d");
        ctx.fillStyle = Material.MATERIALS[material];
        ctx.fillRect(0, 0, size, size);
        MATERIAL_CACHE[i] = canvas;
    }
    Material.MAX_TYPE_VALUE = keys.length - 1;
    Material.TYPE_TO_NAME = (type) => keys[type] || "invalid type";
})();
function DEBUG_read_particle(id) {
    if (!particles[id])
        throw `${id} is not a valid particle id!`;
    let { x, y, vx, vy, ax, ay } = particles[id];
    return {
        x, y,
        vx: vx * 1000, vy: vy * 1000,
        ax: ax * 1000000, ay: ay * 1000000
    };
}
function DEBUG_get_bounds() {
    return { bounds_min_x, bounds_max_x, bounds_min_y, bounds_max_y };
}
const display = new Display("#display");
