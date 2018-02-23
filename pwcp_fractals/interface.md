# Interface for `PointwiseCPFractalRenderer` and derived classes

To create an instance of `PointwiseCPFractalRenderer`, or derived classes such as `JuliaRenderer`, 
you must first define a specification. This specification is subject to change, but currently
the only *required* element is a canvas on which to draw upon. The example below provides a full
list of available options and their defaults.

```javascript
var spec = { canvas        : canvas,
             view_scale    : 10.0, //defines the width of the viewport in fractal units
             view_center   : [0,0],
             max_iter      : 1000,
             escape_radius : 2,
             c             : [-0.4,0.6], //only relevant for the Julia set.
             frags_src     : undefined   //typically there is no need to provide this. Most derived
           };                            //classes will define their own.
```

Then, you may create an instance by passing spec to the constructor. For example, with the mandelbrot set:

```javascript
var mandelbrot = new MandelbrotRenderer(spec);
```

All of the parameters defined in the specification can be freely changed at anytime by accessing the appropriate
`PointwiseCPFractalRender.whatever`. Additionally, all instances of `PointwiseCPFractalRenderer` expose the 
following functions:

```javascript
//draw the fractal to the canvas. Be sure to call this after making any changes.
render();

//given a mouse event and a zoom_factor, change center and scale to zoom towards/away
//from the mouse. Calls render() at the end.
zoom_to_mouse(e, zoom_factor=0.1);
```

