type CanvasSettings = {
    fixed_fps?:number;
};

    /** Canvas width. Set to window.innerWidth. */
let width = 0,
    /** Canvas height. Set to window.innerHeight. */
    height = 0,
    /** Canvas offset x. How far away is the x component from 0. */
    offset_x = 0,
    /** Canvas offset y. How far away is the y component from 0. */
    offset_y = 0,
    canvas: HTMLCanvasElement,
    ctx:CanvasRenderingContext2D,
    /** If true the canvas will keep updating (image and physics calculations). */
    unpaused = true,
    /** This flag is set to true whenever the window is resized. On the next render frames the canvas width and height will be updated. */
    _update_canvas_size = false,
    /** Time between two physics frames. Measured in milliseconds. Read-only. */
    fixed_delta_time:number,
    /** Time took to render current frame. Measured in milliseconds. Read-only. */
    delta_time:number,
    /** Increments by one each rendered frame. */
    frame_count:number,
    physics_interval_id:number,
    render_interval_id:number;

function draw_particle(p:Particle) {
    if (p === undefined || p.is_visible() === false) return;

    const pos = p.screen_position();
    ctx.drawImage(MATERIAL_CACHE[p.material.type], pos[0], pos[1], PARTICLE_WIDTH, PARTICLE_WIDTH);
}

class Display {
    /** How many frames after the page loads should the fps detector wait? Default=5 */
    static readonly WAIT_FRAMES = 5;
    /** Number of taken sample timestamps required for the fps detection. Default=10 */
    static readonly FPS_SAMPLES = 10;
    /** Very small number that helps preventing wrong fps detection. Default=0.004973808593749851 */
    static readonly FPS_CALCULATION_EPSILON = 0.004973808593749851;
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
    /** Method used to detect screen refresh rate. If refresh rate was already calculated => resolve with that value */
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
    start(fps:number, fixed_fps:number) {
        Object.defineProperty(this,"fps",{value:fps,writable:false});
        fixed_fps = fixed_fps || fps;
        Object.defineProperty(this,"fixed_fps",{value:fixed_fps,writable:false});
        fixed_delta_time = 1000 / fixed_fps;
        applyEventListeners(fps);

        unpaused = true;
        frame_count = 0;

        // this.adapt_canvas_size()
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        _update_canvas_size = false;
        // center_world_pos(0,0)
        set_offset(0 - width*0.5, 0 - height*0.5)

        physics_interval_id = setInterval(this.fixed_physics_step.bind(this), fixed_delta_time);
        render_interval_id = requestAnimationFrame(this.render_step.bind(this,0,0))
    }
    fixed_physics_step() {
        if (document.hidden===false && unpaused) {
            for (let i=0; i<particles.length; i++)
                particles[i].step();
        }
    }
    adapt_canvas_size() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        _update_canvas_size = false;
        const new_center_x = (bounds_min_x + bounds_max_x + PARTICLE_WIDTH * scale) * 0.5,
              new_center_y = (bounds_min_y + bounds_max_y + PARTICLE_WIDTH * scale) * 0.5;

        //update_bounds();
        // update_grid();
        set_offset(new_center_x - width*0.5, new_center_y - height*0.5)

    }
    render_step(currFrame?:DOMHighResTimeStamp,prevFrame?:DOMHighResTimeStamp) {
        if (_update_canvas_size) this.adapt_canvas_size();
        
        delta_time = currFrame - prevFrame;

        ctx.clearRect(0,0,width,height);
        ctx.drawImage(GRID_CACHE, 0, 0);

        for (let i=0; i<particles.length; i += 10) {
            draw_particle(particles[i]);
            draw_particle(particles[i+1]);
            draw_particle(particles[i+2]);
            draw_particle(particles[i+3]);
            draw_particle(particles[i+4]);
            draw_particle(particles[i+5]);
            draw_particle(particles[i+6]);
            draw_particle(particles[i+7]);
            draw_particle(particles[i+8]);
            draw_particle(particles[i+9]);
        }

        ctx.fillStyle = "red";
        ctx.fillText(`${offset_x},${offset_y}`,8,10);

        frame_count++;

        render_interval_id = requestAnimationFrame(nextFrame => this.render_step.call(this,nextFrame,currFrame));
    }
}
Object.defineProperty(Display,"IS_RUN_ON_PHONE",{writable:false});

window.addEventListener("resize", _ => _update_canvas_size = true);