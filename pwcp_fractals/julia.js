class JuliaRenderer extends PointwiseCPFractalRenderer
{
    constructor(spec) {
        spec.escape_radius = 2.0; //all points further than 2 from the origin
                                  //cannot be in the julia set.

        spec.max_iter = spec.max_iter || 1000;
        
        let dec = ["#798CFF", "#74CDFB", "#6FF8E1", "#6AF598", "#81F165",
                   "#C5EE60", "#EBCB60", "#E77D57", "#E45277", "#E14EBE",
                   "#B54ADE"];
        spec.exterior_colors = spec.exterior_colors || dec;

        spec.frags_src = JuliaRenderer.create_frags_src(spec.exterior_colors, 
                                                        spec.max_iter);

        super(spec); //call PointwiseCPFractalRenderer constructor

        this.c = spec.c || [-0.4,0.6];
        this.max_iter = 12;
    }

    render() {
        //PointwiseCPFractalRenderer does not include this uniform by default.
        this.u_c = this.gl.getUniformLocation(this.gl_program, "c");
        this.gl.uniform2fv(this.u_c, this.c);

        //default renderer can handle the rest
        super.render();
    }
   
    set exterior_colors(colors) {
        this.frags_src = JuliaRenderer.create_frags_src(colors, this.max_iter);
        this.gl_program = this.build_program(this.vertexs_src,
                                             this.frags_src);
    } 

    static create_frags_src(exterior_colors, max_iter) 
    {
        let frags_src = `
            precision highp float;
            uniform mat4 view_transform;
            uniform float view_scale;
            uniform float escape_radius;
            uniform int max_iter;
            uniform vec2 c;

            void iterate(inout vec2 z, in vec2 c_whatever) {
                vec2 tmp;
                tmp.x = z.x*z.x - z.y*z.y + c.x;
                tmp.y = 2.0*z.x*z.y       + c.y;
                z = tmp;
            }

            vec4 color(in vec2 z) {
                for (int i=0; i<${Math.ceil(max_iter/exterior_colors.length)}; ++i) {
                    ${PointwiseCPFractalRenderer.unrolled_color_loop(exterior_colors)}
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

        return frags_src;
    }

};
