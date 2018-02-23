//canvas factor ** This can be gone once we have side bar on our html
//let canvasFactor = 0.98;
let canvasWidthFactor = 0.80;

var WIDTH;
var HEIGHT;
var triList = [];
var counter = 0;


function setup() {

	WIDTH = windowWidth*canvasWidthFactor;
//	WIDTH = windowWidth;
//	HEIGHT = WIDTH;
  HEIGHT = windowHeight;

	frameRate(0.001);
	createCanvas(WIDTH, HEIGHT);
	resetSketch();
	//triList.push(new Triangle(WIDTH/2, 100, HEIGHT/2*0.7));
	//redraw();
}

function draw() {
	//Sets greyscale integer value as background color
	background(32);
	drawAll();

}

//Resets canvas size as winodw size changes
function windowResized() {
    resizeCanvas(windowWidth,windowHeight);
}

//Generates triangles
function generate() {
	counter++;
	if(counter > 8) {
		counter = 0;
		triList.length = 0;
		resetSketch();
	}
	else {
		splitAll();
		redraw();
	}
}

//Resketches the triangle
function resetSketch() {
	clear();
	triList.push(new Triangle(WIDTH/2, 100, HEIGHT/2*0.7));
	draw();
}

//Saves image as jpg file
function saveImage() {
    save('sierpinski_triangle.jpg');
}
