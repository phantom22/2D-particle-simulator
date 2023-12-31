type CanvasSettings = {
    fixed_fps?:number;
};

    /** 
     * Cached value of `window.innerWidth`, this value reflects `canvas.width`. Read-only.
     * 
     * ---
     * this values is changed by `Display.adapt_canvas_size()`.
     */
let width:number,
    /** 
     * Cached value of `window.innerHeight`, this value reflects `canvas.height`. Read-only.
     * 
     * ---
     * this values is changed by `Display.adapt_canvas_size()`.
     */
    height:number,
    /** 
     * How far away is the offset x component from 0. Read-only.
     * 
     * ---
     * use `set_world_offset(x,y)` to change this value.
     */
    offset_x:number,
    /** 
     * How far away is the offset y component from 0. Read-only.
     * 
     * ---
     * use `set_world_offset(x,y)` to change this value.
     */
    offset_y:number,
    canvas: HTMLCanvasElement,
    ctx:CanvasRenderingContext2D,
    /** 
     * If true the canvas will keep updating (image and physics calculations).
     * 
     * ---
     * won't reset if already defined.
     */
    unpaused:boolean,
    /** This flag is set to true whenever the window is resized. On the next render frames the canvas width and height will be updated. Read-only. */
    _update_canvas_size:boolean,
    /** Time between two physics frames. Measured in milliseconds. Read-only. */
    fixed_delta_time:number,
    /** Cached value of `delta_time * time_scale`, updated each frame. Measured in milliseconds. Read-only.*/
    scaled_delta_time:number,
    /** Time took to render previous frame. Measured in milliseconds. Read-only. */
    delta_time:number,
    /** Increments by one at the end of each rendered frame. */
    frame_count:number,
    dinamic_fps_enabled:boolean,
    dinamic_fps_active:boolean,
    dinamic_fps_stall_frames:number,
    dinamic_fps_target_frame:number,
    dinamic_fps_counter:number,

    physics_interval_id:number,
    render_interval_id:number;

const UI_FONT = "Verdana";
let ui_font_size = 15,
    ui_padding = 5,
    ui_margin = 15,
    ui_offset_color = "#c2ac44",
    ui_fps_color = "#00ff00",
    ui_concurrent_fps_samples:number,
    ui_fps_samples:number[];

function unsafe_draw_particle(p:Particle) {
    if (p.is_visible() === false) return;

    const pos = p.screen_position();
    ctx.drawImage(MATERIAL_CACHE[p.material.type], pos[0], pos[1], particle_width, particle_width);
}

function draw_bulk(safe_loops:number) {
    for (let i=0; i<safe_loops; i++) {
        const o = i*20;
        unsafe_draw_particle(particles[o]);
        unsafe_draw_particle(particles[o+1]);
        unsafe_draw_particle(particles[o+2]);
        unsafe_draw_particle(particles[o+3]);
        unsafe_draw_particle(particles[o+4]);
        unsafe_draw_particle(particles[o+5]);
        unsafe_draw_particle(particles[o+6]);
        unsafe_draw_particle(particles[o+7]);
        unsafe_draw_particle(particles[o+8]);
        unsafe_draw_particle(particles[o+9]);
        unsafe_draw_particle(particles[o+10]);
        unsafe_draw_particle(particles[o+11]);
        unsafe_draw_particle(particles[o+12]);
        unsafe_draw_particle(particles[o+13]);
        unsafe_draw_particle(particles[o+14]);
        unsafe_draw_particle(particles[o+15]);
        unsafe_draw_particle(particles[o+16]);
        unsafe_draw_particle(particles[o+17]);
        unsafe_draw_particle(particles[o+18]);
        unsafe_draw_particle(particles[o+19]);
    }
}

function draw_remaining_bulk(safe_loops:number) {
    const o = safe_loops*20;
    safe_draw_particle(particles[o]);
    safe_draw_particle(particles[o+1]);
    safe_draw_particle(particles[o+2]);
    safe_draw_particle(particles[o+3]);
    safe_draw_particle(particles[o+4]);
    safe_draw_particle(particles[o+5]);
    safe_draw_particle(particles[o+6]);
    safe_draw_particle(particles[o+7]);
    safe_draw_particle(particles[o+8]);
    safe_draw_particle(particles[o+9]);
    safe_draw_particle(particles[o+10]);
    safe_draw_particle(particles[o+11]);
    safe_draw_particle(particles[o+12]);
    safe_draw_particle(particles[o+13]);
    safe_draw_particle(particles[o+14]);
    safe_draw_particle(particles[o+15]);
    safe_draw_particle(particles[o+16]);
    safe_draw_particle(particles[o+17]);
    safe_draw_particle(particles[o+18]);
    safe_draw_particle(particles[o+19]);
}
/** This function, before drawing a particles, asserts that it's not an undefined value and if it's a visible particle. */
function safe_draw_particle(p:Particle) {
    if (p === undefined || p.is_visible() === false) return;

    const pos = p.screen_position();
    ctx.drawImage(MATERIAL_CACHE[p.material.type], pos[0], pos[1], particle_width, particle_width);
}

function update_particle(p:Particle) {
    if (p === undefined) return;

    p.step()
}

class Display {
    /** How many frames after the page loads should the fps detector wait? Default=5 */
    static readonly WAIT_FRAMES = 10;
    /** Number of taken sample timestamps required for the fps detection. Default=10 */
    static readonly FPS_SAMPLES = 10;
    /** Very small number that helps preventing wrong fps detection. Default=0.004973808593749851 */
    static readonly FPS_CALCULATION_EPSILON = 0.01;
    /** The refresh rate of the screen. Needs to be calculated only one time. Read-only. */
    static readonly REFRESH_RATE:number;
    /** Is the current device a mobile phone? Needed for performance tweaks. Read-only. */
    static readonly IS_RUN_ON_PHONE = (function(a){
        return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))})
        /** @ts-ignore */
        (navigator.userAgent||navigator.vendor||window.opera);

    /** Max render frames per second. Read-only.*/
    readonly fps:number;
    /** Max physics frames per second. Read-only.*/
    readonly fixed_fps:number;

    constructor(query:string, settings:CanvasSettings = {}) {
        const c = document.querySelector(query);
        if (c instanceof HTMLCanvasElement) {
            c.width = width;
            c.height
            canvas = c;
            ctx = c.getContext("2d");
            this.#applySettings(settings);
            this.#init().then(fps => this.start(fps, settings.fixed_fps));
        }
        else throw `Couldn't find canvas with query '${query}'`;
    }
    #applySettings({}:CanvasSettings={}) {

    }
    /** Method used to detect screen refresh rate. If refresh rate was already, resolve immediately with that value. */
    #init(): Promise<number> {
        return new Promise(resolve => {

            if (Display.REFRESH_RATE !== undefined) {
                resolve(Display.REFRESH_RATE);
                return;
            }

            /** timestamps[0] is the start of the elapsed time; timestamps[i] (with 0<i<FPS_SAMPLES+1) is where all the sample fps timestamps are. */
            const timestamps:number[] = [];
            let id, framesToWait = Display.WAIT_FRAMES;

            function frameStep(timestamp:number) {
                if (framesToWait > 0) {
                    framesToWait--;
                    if (framesToWait === 0) timestamps.push(timestamp);
                }
                else if (timestamps.length-1 < Display.FPS_SAMPLES) {
                    timestamps.push(timestamp);
                }
                else {
                    const avg = timestamps
                                      .map((v,i)=>v-timestamps[i-1]) // calc delta_time between each timestamp
                                      .slice(1) // remove timestamps[0] which is non relevant to the calculation
                                      .reduce((a,b)=>a+b)/(timestamps.length-1) - Display.FPS_CALCULATION_EPSILON * 2; // divide the sum of the deltas by the sampleCount
                    let o;
                    if (avg <= 2.777778) o = 360;
                    else if (avg <= 4.166667) o = 240;
                    else if (avg <= 6.060606) o = 165;
                    else if (avg <= 6.944444) o = 144;
                    else if (avg <= 8.333333) o = 120;
                    else if (avg <= 11.111111) o = 90;
                    else if (avg <= 13.333333) o = 75;
                    else if (avg <= 16.666667) o = 60;
                    else if (avg <= 33.333333) o = 30;
                    else o = Math.floor(1000/avg);

                    Object.defineProperty(Display,"REFRESH_RATE",{value:o,writable:false});
                    cancelAnimationFrame(id);
                    resolve(o);
                    return;
                }
                id = requestAnimationFrame(frameStep);
            }
            id = requestAnimationFrame(frameStep);
        });
    }
    /**
     * This method is called before the rendering loop is started. It's defined as follows:
     * 
     * - finalize fps.
     * - if fixed_fps is higher than fps, clamp it down; calculate fixed_delta_time.
     * - apply event listeners to canvas.
     * - initialize frame_count.
     * - set canvas resolution to window.innerWidth, window.innerHeight
     * - center camera to 0,0.
     * - begin physics and rendering loop.
     */
    start(fps:number, fixed_fps:number) {
        Object.defineProperty(this,"fps",{value:fps,writable:false});
        if (fixed_fps === undefined || fixed_fps > fps) fixed_fps = fps;
        Object.defineProperty(this,"fixed_fps",{value:fixed_fps,writable:false});
        fixed_delta_time = 1000 / fixed_fps;
        applyEventListeners(fps);
        if (fps > 60) {
            dinamic_fps_enabled = true;
            dinamic_fps_active = false;
            dinamic_fps_stall_frames = ~~(fps/60);
            dinamic_fps_counter = 0;
            dinamic_fps_target_frame = 0;
        }

        unpaused = unpaused ?? true;
        frame_count = 0;
        ui_concurrent_fps_samples = Math.ceil(fps * 0.7);
        ui_fps_samples = [];

        // adapt canvas size
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        // reset update flag
        _update_canvas_size = false;
        // center the camera to 0,0
        set_world_offset(0 - width*0.5, 0 - height*0.5)

        physics_interval_id = setInterval(this.fixed_physics_step.bind(this), fixed_delta_time);
        render_interval_id = requestAnimationFrame(this.render_step.bind(this,1000/fps,0))
    }
    /**
     * This method controls the physics calculation process. It's defined as follows:
     * 
     * - if the document is hidden or `unpaused` is set to false, skip calculations all together.
     * - for each particle, before the calculation check wether the particle should be updated.
     */
    fixed_physics_step() {
        if (document.hidden===false && unpaused) {
            for (let i=0; i<particles.length; i+=20) {
                update_particle(particles[i]);
                update_particle(particles[i+1]);
                update_particle(particles[i+2]);
                update_particle(particles[i+3]);
                update_particle(particles[i+4]);
                update_particle(particles[i+5]);
                update_particle(particles[i+6]);
                update_particle(particles[i+7]);
                update_particle(particles[i+8]);
                update_particle(particles[i+9]);
                update_particle(particles[i+10]);
                update_particle(particles[i+11]);
                update_particle(particles[i+12]);
                update_particle(particles[i+13]);
                update_particle(particles[i+14]);
                update_particle(particles[i+15]);
                update_particle(particles[i+16]);
                update_particle(particles[i+17]);
                update_particle(particles[i+18]);
                update_particle(particles[i+19]);
            }
        }
    }
    /**
     * Updates the canvas resolution to window.innerWidth, window.innerHeight; after that it centers the camera to the current screen center
     * which automatically updates bounds, cell_offset and grid. 
     * 
     * This method is triggered by the `_update_canvas_size` flag, changed by the onresize event listener of the window.
     */
    adapt_canvas_size() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        camera_look_at_screen_center();

        _update_canvas_size = false;

    }
    multithreaded_render_step(currFrame?:DOMHighResTimeStamp,prevFrame?:DOMHighResTimeStamp) {

        throw "unimplemented!";
        
        if (_update_canvas_size) this.adapt_canvas_size();
        
        delta_time = currFrame - prevFrame;
        ui_fps_samples.push(1000 / delta_time);
        if (ui_fps_samples.length === ui_concurrent_fps_samples + 1) {
            ui_fps_samples.shift();
        }
        const current_fps = ui_fps_samples.reduce((a,b) => a+b) / ui_fps_samples.length;
        //if (dinamic_fps_enabled && current_fps < 60) {
        //    dinamic_fps_active = true;
        //    dinamic_fps_target_frame
        //}

        scaled_delta_time = delta_time * time_scale;
        if (_is_pressing_reverse_time_scale_button) scaled_delta_time = -scaled_delta_time;

        if (selected_particle > -1) {
            camera_look_at_centerered_cell(particles[selected_particle].x, particles[selected_particle].y)
        }

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(GRID_CACHE, 0, 0);

        const safe_loops = ~~(particles.length / 20);
        draw_bulk(safe_loops);
        draw_remaining_bulk(safe_loops);

        ctx.font = `${ui_font_size}px ${UI_FONT}`;

        ctx.fillStyle = ui_offset_color;
        ctx.fillText(`${offset_x.toFixed(2)},${(-offset_y).toFixed(2)}`, 8, 17);

        ctx.fillStyle = ui_fps_color;
        ctx.fillText(`${~~current_fps}`, width - 27, 17, 25)

        frame_count++;

        render_interval_id = requestAnimationFrame(nextFrame => this.render_step.call(this,nextFrame,currFrame));
    }
    /**
     * This method controls the rendering process. It's defined as follows:
     * 
     * - update canvas size, if needed.
     * - calculate delta_time and scaled_delta_time.
     * - if there is a selected particle, center the camera to its position.
     * - clear previous frame.
     * - draw grid.
     * - draw particles.
     * - draw current offset in the top left corner.
     * - draw current fps in the top right corner.
     * - increment frame_count.
     * - request next animation frame.
     */
    render_step(currFrame?:DOMHighResTimeStamp,prevFrame?:DOMHighResTimeStamp) {
        if (_update_canvas_size) this.adapt_canvas_size();
        
        delta_time = currFrame - prevFrame;
        ui_fps_samples.push(1000 / delta_time);
        const current_fps = ui_fps_samples.reduce((a,b) => a+b) / ui_fps_samples.length;
        if (ui_fps_samples.length === ui_concurrent_fps_samples + 1) {
            ui_fps_samples.shift();
        }

        scaled_delta_time = delta_time * time_scale;
        if (_is_pressing_reverse_time_scale_button) scaled_delta_time = -scaled_delta_time;

        if (selected_particle > -1) {
            camera_look_at_centerered_cell(particles[selected_particle].x, particles[selected_particle].y)
        }

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(GRID_CACHE, 0, 0);

        const safe_loops = ~~(particles.length / 20);
        draw_bulk(safe_loops);
        draw_remaining_bulk(safe_loops);

        ctx.font = `${ui_font_size}px ${UI_FONT}`;

        ctx.fillStyle = ui_offset_color;
        ctx.fillText(`${offset_x.toFixed(2)},${(-offset_y).toFixed(2)}`, 8, 17);

        ctx.fillStyle = ui_fps_color;
        ctx.fillText(`${~~current_fps}`, width - 27, 17, 25)

        frame_count++;

        render_interval_id = requestAnimationFrame(nextFrame => this.render_step.call(this,nextFrame,currFrame));
    }
}
Object.defineProperty(Display,"IS_RUN_ON_PHONE",{writable:false});