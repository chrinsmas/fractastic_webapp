class JuliaRenderer extends PointwiseCPFractalRenderer
{
    constructor(spec) {
        spec.escape_radius = 2.0; //all points further than 2 from the origin
                                  //cannot be in the julia set.

        spec.frags_src = `
            precision highp float;
            uniform mat4 view_transform;
            uniform float view_scale;
            uniform float escape_radius;
            uniform int max_iter;
            uniform vec2 c;

            void iterate(inout vec2 z) {
                vec2 tmp;
                tmp.x = z.x*z.x - z.y*z.y + c.x;
                tmp.y = 2.0*z.x*z.y       + c.y;
                z = tmp;
            }

            vec4 color(in vec2 z) {
                for (int i=0; i<100000; ++i) {
                    iterate(z);
                    if (length(z) > escape_radius) {
                        float b = exp(-0.01*sqrt(view_scale)*float(i));
                        return vec4(0.5*b,0.7*b,0.6*b,1);
                    } else if (i > max_iter) {
                        break;
                    }
                }
                return vec4(0,0,0,1);
            }

            void main() {
                vec4 fractal_coord = view_transform * gl_FragCoord;
                vec2 z = vec2(fractal_coord.x,  //we only need the first
                              fractal_coord.y); //two coordinates.
                gl_FragColor = color(z);
            }
        `;

        super(spec); //call PointwiseCPFractalRenderer constructor

        this.c = spec.c || [-0.4,0.6];
    }

    render() {
        //PointwiseCPFractalRenderer does not include this uniform by default.
        this.u_c = this.gl.getUniformLocation(this.gl_program, "c");
        this.gl.uniform2fv(this.u_c, this.c);

        //default renderer can handle the rest
        super.render();
    }
};
