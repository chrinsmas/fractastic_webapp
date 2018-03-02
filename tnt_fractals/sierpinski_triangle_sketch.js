//Sets up triangle info
function Triangle(a, b, c)
{
	this.a = a;
	this.b = b;
	this.c = c;
}

//Sets up prototype for triangles
Triangle.prototype.draw = function()
{
	var a1 = this.a;
	var b1 = this.b;

	var a2 = this.a - this.c;
	var b2 = this.b + this.c;

	var a3 = this.a + this.c;
	var b3 = this.b + this.c;

	//fill with soft pick color
	fill(205,145,158)
	//
	triangle(a1, b1, a2, b2, a3, b3);
};

Triangle.prototype.split = function()
{
	//stores current index
	var currentIndex = triList.indexOf(this);
	//adding more array at 1
	triList.splice(currentIndex, 1);

	//create new triangle objects with half the height of current triangle
	triList.push(new Triangle(this.a, this.b, this.c/2));
	triList.push(new Triangle(this.a-this.c/2, this.b+this.c/2, this.c/2));
	triList.push(new Triangle(this.a+this.c/2, this.b+this.c/2, this.c/2));
};

function splitAll()
{
	var toSplit = [];
	for (var i = 0; i < triList.length; i++)
	{
		var triangle = triList[i];
		toSplit.push(triangle);
	}

	for (var i = 0; i < toSplit.length; i++)
		toSplit[i].split();
}

function drawAll()
{
	for (var i = 0; i < triList.length; i++)
	{
		var triangle = triList[i];
		triangle.draw();
	}
}
