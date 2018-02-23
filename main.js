function main()
{
    let canvas   = document.getElementById("fractal_canvas");
    let dropdown = document.getElementById("fractal_dropdown");

    dropdown.onchange = function() {
        let choice = dropdown.value;
        switch (choice) {
            case "mandelbrot": fractal = new MandelbrotRenderer(spec); break;
            case "julia":      fractal = new JuliaRenderer(spec);      break;
        }
        fractal.render();
    }

    canvas.addEventListener('wheel',
        function(e) {
            fractal.zoom_to_mouse(e);
            e.preventDefault();
        },
        false);

    var spec = { canvas:      canvas,
                 view_scale:  6,
                 view_center: [0,0],
                 max_iter:    1000};

    //render initial fractal
    var fractal;
    dropdown.onchange();

    //for julia set, handle constant changes
    let c_real_input = document.getElementById("c_real");
    let c_imag_input = document.getElementById("c_imag");
    c_real_input.onchange = function() {
        fractal.c[0] = c_real_input.value;
        fractal.render();
    }
    c_imag_input.onchange = function() {
        fractal.c[1] = c_imag_input.value;
        fractal.render();
    }
    c_real_input.onchange();
    c_imag_input.onchange();

}

main();
