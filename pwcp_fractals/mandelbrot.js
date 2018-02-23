class MandelbrotRenderer extends PointwiseCPFractalRenderer
{
    constructor(spec) {
        spec.escape_radius = 2.0; //all points further than 2 from the origin
                                  //cannot be in the mandelbrot set.

        spec.frags_src = MandelbrotRenderer.create_frags();

        console.log(spec.frags_src);

        super(spec); //call PointwiseCPFractalRenderer constructor
    }

    static create_frags() {
        let iterate = `
            void iterate(inout vec2 z, in vec2 c) {
                vec2 tmp;
                tmp.x = z.x*z.x - z.y*z.y + c.x;
                tmp.y = 2.0*z.x*z.y       + c.y;
                z = tmp;
            }
        `;

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

        let colors = ["#798CFF", "#74CDFB", "#6FF8E1", "#6AF598", "#81F165",
                      "#C5EE60", "#EBCB60", "#E77D57", "#E45277", "#E14EBE",
                      "#B54ADE"];

        let unrolled_color_loop = function(colors) {
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

        let frags_src = `
            precision highp float;
            uniform mat4 view_transform;
            uniform float view_scale;
            uniform float escape_radius;
            uniform int max_iter;

            ${iterate}

            //preforms the escape time algorithm for coloring
            vec4 color(in vec2 c) {
                vec2 z = vec2(0,0); //z_0 = 0 by definition for mandelbrot
                for (int i=0; i<100; ++i) {
                    ${unrolled_color_loop(colors)}
                }
                return vec4(0,0,0,1); //interior color
            }

            void main() {
                //convert from pixel coordinates to fractal coordinates:
                vec4 fractal_coord = view_transform * gl_FragCoord;
                vec2 c = vec2(fractal_coord.x,  //we only need the first
                              fractal_coord.y); //two coordinates.
                gl_FragColor = color(c);
            }
        `;

        return frags_src;
    }
};
