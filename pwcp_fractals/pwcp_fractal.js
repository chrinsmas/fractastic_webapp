//FractalRender provides the most generic methods for fractal rendering,
//such as getting and setting the viewing area. Every fractal class should
//extend this one.
class FractalRenderer
{
    constructor(spec) {
        this.canvas = spec.canvas;
        if (!this.canvas) {
            throw "from FractalRenderer.constructor(): \
                   spec did not include a canvas";
        }

        //The view center and scale define the portion of the plane rendered.
        //They are in the units of the internal space, not in pixels.
        //view_scale gives the width of the canvas.
        this.view_center = spec.view_center || [0,0];
        this.view_scale  = spec.view_scale  || 10.0;
    }

    //Every renderer class should implement this method.
    render() {
        throw "from FractalRenderer.render(): \
               You should overwrite the base render method!";
    }

    get scale()  { return this.view_scale; }
    set scale(s) {
        this.view_scale = s;
        console.log("view_scale set to " +s)
    }

    get center()  { return this.view_center; }
    set center(c) {
        this.view_center = c;
        console.log("view_center set to " +c)
    }
}

//This class extends FractalRenderer to those fractals defined pointwise
//on the complex plane, such as the Julia and Mandelbrot sets. An important
//part of the spec is the source code for a fragment shader which the caller
//must provide. The following uniforms are provided to this shader:
// * uniform mat4 view_transform;
// * uniform float view_scale;
// * uniform float escape_radius;
// * uniform int max_iter;
class PointwiseCPFractalRenderer extends FractalRenderer
{
    constructor(spec) {
        super(spec); //call FractalRenderer constructor

        this.escape_radius = spec.escape_radius || 2;
        this.max_iter      = spec.max_iter      || 1000;

        //This generic vertex shader is all that is needed
        //for many fractals, as the
        //heavy-lifting is done by the fragment shader.
        var generic_vertexs_src = `
            attribute vec4 a_position;
            void main() {
                gl_Position = a_position;
            }
        `;

        //The spec need not provide a vertex shader,
        //but a fragment shader is required.
        if (spec.vertexs_src) this.vertexs_src = spec.vertexs_src;
        else                  this.vertexs_src = generic_vertexs_src;

        this.frags_src = spec.frags_src
        if (!this.frags_src) {
            throw "from PointwiseCPFractalRenderer.constructor(): \
                   spec did not include source code for a fragment shader";
        }   

        this.gl         = this.init_gl();
        this.gl_program = this.build_program(this.vertexs_src,
                                             this.frags_src);
    }

    render() {
        let gl = this.gl;

        //This block creates an attribute and buffer for vertex position
        //data. It bind a single large rectangle the buffer which will be
        //our "canvas" for the fragment shader to draw upon.
        var pos_atr_loc = gl.getAttribLocation(this.gl_program, "a_position");
        var position_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                -1.0, -1.0,
                 1.0, -1.0,
                -1.0,  1.0,
                -1.0,  1.0,
                 1.0, -1.0,
                 1.0,  1.0]),
            gl.STATIC_DRAW
        );
        gl.enableVertexAttribArray(pos_atr_loc);
        gl.vertexAttribPointer(pos_atr_loc, 2, gl.FLOAT, false, 0, 0);

        //set the viewport size in pixels.
        gl.viewport(0,0,gl.canvas.width, gl.canvas.height);

        //clear the viewport.
        gl.clearColor(1,0,0,1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        //at this point we bind the uniforms.
        gl.uniformMatrix4fv(this.u_view_transform, false, this.get_view_transform());
        gl.uniform1f(this.u_view_scale, this.view_scale);
        gl.uniform1f(this.u_escape_radius, this.escape_radius);
        gl.uniform1i(this.u_max_iter, this.max_iter);

        //finally we draw
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    //takes a fractal and a mouse event and zooms that fractal in
    zoom_to_mouse(e, zoom_factor=0.1) {
            //get a vector from the center of the canvas to the mouse, in pixels.
            let pos_pixels_mouse = [
                e.pageX - this.canvas.offsetLeft - this.canvas.width/2,
                e.pageY - this.canvas.offsetTop  - this.canvas.height/2
            ]

            //get some useful info
            let old_center = this.center;
            let old_scale  = this.scale;
            let cw         = this.canvas.width;
            let ch         = this.canvas.height;
            let aspect     = cw / ch;

            //this coordinates of mouse
            let pos_this_mouse = [
                pos_pixels_mouse[0] * (old_scale          / cw) + old_center[0],
               -pos_pixels_mouse[1] * ((old_scale/aspect) / ch) + old_center[1]
            ];

            console.log("mouse scroll event at this coordinates "
                        + pos_this_mouse);

            //vector from old center to mouse
            let offset = [
                pos_this_mouse[0] - old_center[0],
                pos_this_mouse[1] - old_center[1]
            ];

            //zoom in appropriately
            let new_scale = old_scale;
            if (e.deltaY < 0) new_scale *= 1 - zoom_factor;
            else              new_scale *= 1 + zoom_factor;
            this.scale  = new_scale;

            //translate view_center to keep mouse cursor in the same position
            let dir = 1;
            if (e.deltaY > 0) dir = -1;
            this.center = [
                old_center[0] + dir*zoom_factor*offset[0],
                old_center[1] + dir*zoom_factor*offset[1]
            ];

            //finally, re-render
            this.render();
    }

    ///////////////////////////////////////////////////////////////////
    // Methods below this point should be considered private and     //
    // should never be called by external code.                      //
    ///////////////////////////////////////////////////////////////////

    //returns an array representing the transformation matrix from
    //pixel coordinates to fractal coordinates. This matrix is later
    //sent to the fragment shader.
    get_view_transform()
    {
        //assume scale gives canvas width in complex units
        let s = this.view_scale/this.canvas.width;

        let aspect = this.canvas.width / this.canvas.height;
        let offx   = this.view_center[0] - this.view_scale/2;
        let offy   = this.view_center[1] - this.view_scale/(2*aspect);

        return [s,      0,    0, 0,
                0,      s,    0, 0,
                0,      0,    s, 0,
                offx,   offy, 0, s];
    }

    init_gl() {
        var gl = this.canvas.getContext("webgl");
        if (!gl) {
            alert("ERROR: unable to get WebGL context");
        }
        return gl;
    }

    build_program(vertexs_src, frags_src) {
        let gl = this.gl;

        var vertexs = this.create_shader(gl, gl.VERTEX_SHADER, vertexs_src);
        var frags   = this.create_shader(gl, gl.FRAGMENT_SHADER, frags_src);

        var program = gl.createProgram();

        gl.attachShader(program, vertexs);
        gl.attachShader(program, frags);

        gl.linkProgram(program);
        var success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!success) {
            console.log(gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return undefined;
        }

        gl.useProgram(program);

        //get and store uniform memory locations
        this.u_view_transform = gl.getUniformLocation(program, "view_transform");
        this.u_view_scale     = gl.getUniformLocation(program, "view_scale");
        this.u_max_iter       = gl.getUniformLocation(program, "max_iter");
        this.u_escape_radius  = gl.getUniformLocation(program, "escape_radius");

        return program;
    }

    create_shader(gl, type, source)
    {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source)
        gl.compileShader(shader);

        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            console.log(gl.getShaderInfoLog(shader));
            return shader;
        } else {
            console.log(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
        }
    }

    static unrolled_color_loop(colors) {
        function hex_to_vec4(hex) {
            let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            let rgb = result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
            if (!rgb) return null;

            let r = rgb.r / 255.0;
            let g = rgb.g / 255.0;
            let b = rgb.b / 255.0;
            let vec4 = `vec4(${r},${g},${b},1)`;

            return vec4;
        }

        let out = "";
        for (let i=0; i<colors.length; ++i) {
            let fac = 0.1*(i % 10);
            console.log(fac);
            out += `iterate(z,c);
                    if (length(z) > escape_radius) {
                        float b = exp(-0.1*sqrt(view_scale)*float(i));
                        return vec4(b,b,b,1)*${hex_to_vec4(colors[i])};
                    }`;
        }
        return out;
    };
}
