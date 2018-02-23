//canvas factor ** This can be gone once we have side bar on our html
let canvasHeightFactor = 0.97;
let canvasWidthFactor = 0.75;

function setup() {
    //Creates Canvas Area
    canvas = createCanvas(windowWidth * canvasWidthFactor, windowHeight * canvasHeightFactor);
    canvas.parent("fractalTree")

    //Creates Sliders to get user input for branch angle, length, thickness, right and left tilth factors
    //createSlider(min,max,[value],[step])
    angleSlider = createSlider(0, PI / 4, PI / 8, 0.01).parent("angle");
    lengthSlider = createSlider(0, 200, 100, 0.1).parent("length");
    thicknessSlider = createSlider(0, 10, 6, 0.1).parent("thickness");
    rightTiltFactorSlider = createSlider(0, 2, 1.5, 0.01).parent("rightTilt");
    leftTiltFactorSlider = createSlider(0, 2, 1.5, 0.01).parent("leftTilt");

    //Set Frame Rate - 25 FPS
    frameRate(25);
}

function draw() {
    //Sets greyscale integer value as background color
    background(32);

    //Sets tree start point to the bottom center of Canvas
    translate(width / 2, height);

    //Gets input values for branch angle, length, thickness, right and left tilth factors
    angle = angleSlider.value();
    len = lengthSlider.value();
    thickness = thicknessSlider.value();
    rightTiltFactor = rightTiltFactorSlider.value();
    leftTiltFactor = leftTiltFactorSlider.value();

    //Recursive call for draw branches
    branch(len, thickness);
}
//Resets canvas size as winodw size changes
function windowResized() {
    resizeCanvas(windowWidth * canvasWidthFactor, windowHeight * canvasHeightFactor);
}

function branch(len, thickness) {

    //Sets weight
    //strokeWeight(weight)
    strokeWeight(thickness);
    //Draws branches with descreasing value of Length
    if (len > lengthSlider.value() / 10) {
        stroke(255);
    }
    //change the end of trees to green
    else { stroke(166, 214, 40); }

    //start branch from bottom to up
    line(0, 0, 0, -len);
    //translate start point up to 0, -len
    translate(0, -len);

    //If there are more branches to make, split off and make.
    if (len > lengthSlider.value() / 20) {

    //Right branching
      //stores/saves the branch moves
      push();
      //rotates direction to right 45 degree = PI/4
      //multiplys user_input for rightTiltFactor value
      rotate(angle * rightTiltFactor);
      //reduces length and thickness to 78%
      branch(len * 0.78, thickness * 0.78);
      //back to where it started
      pop();

    //Left branching
      push();
      rotate(-angle * leftTiltFactor);
      branch(len * 0.78, thickness * 0.78);
      pop();
    }
}

//Saves image as jpg file
function saveImage() {
    save('tree_fractal.jpg');
}
