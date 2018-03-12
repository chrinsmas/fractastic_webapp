class MandelbrotRenderer extends PointwiseCPFractalRenderer
{
    constructor(spec) {
        spec.escape_radius = 2.0; //all points further than 2 from the origin
                                  //cannot be in the mandelbrot set.
      
        let dec = ["#798CFF", "#74CDFB", "#6FF8E1", "#6AF598", "#81F165",
                   "#C5EE60", "#EBCB60", "#E77D57", "#E45277", "#E14EBE",
                   "#B54ADE"];
        spec.exterior_colors = spec.exterior_colors || dec;

        spec.frags_src = MandelbrotRenderer.create_frags_src(
                          spec.exterior_colors);

        super(spec); //call PointwiseCPFractalRenderer constructor
    }

    static create_frags_src(exterior_colors) 
    {
        let iterate = `
            void iterate(inout vec2 z, in vec2 c) {
                vec2 tmp;
                tmp.x = z.x*z.x - z.y*z.y + c.x;
                tmp.y = 2.0*z.x*z.y       + c.y;
                z = tmp;
            }
        `;

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
                    ${PointwiseCPFractalRenderer.unrolled_color_loop(
                                                      exterior_colors)}
                }
                return vec4(0,0,0,1); //interior color
            }

            void main() {
                //convert from pixel coordinates to fractal coordinates:
                vec4 fractal_coord = view_transform * gl_FragCoord;
                vec2 z = vec2(fractal_coord.x,  //we only need the first
                              fractal_coord.y); //two coordinates.
                gl_FragColor = color(z);
            }
        `;

        return frags_src;
    }
};
