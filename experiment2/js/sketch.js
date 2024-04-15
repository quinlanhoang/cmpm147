// sketch.js - purpose and description here
// Author: Your Name
// Date:

// Here is how you might set up an OOP p5.js project
// Note that p5.js looks for a file called sketch.js

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file
const VALUE1 = 1;
const VALUE2 = 2;

// Globals
let myInstance;
let canvasContainer;
var centerHorz, centerVert;

let seed = 1000;

const sandColor = "#975038";
const skyColor = "#5e83bf";
const rockColor = "#7c5250";
const bushColor = "#ba924c";
const treeColor = "#2e3615";
const grassColor = "#505c3d";

class MyClass {
    constructor(param1, param2) {
        this.property1 = param1;
        this.property2 = param2;
    }

    myMethod() {
        // code to run when method is called
    }
}

function resizeScreen() {
  centerHorz = canvasContainer.width() / 2; // Adjusted for drawing logic
  centerVert = canvasContainer.height() / 2; // Adjusted for drawing logic
  console.log("Resizing...");
  resizeCanvas(canvasContainer.width(), canvasContainer.height());
  // redrawCanvas(); // Redraw everything based on new size
}

function reimagine() {
  seed++;
}

//event listener
$(document).ready(function() {
  $("#reimagine").click(function() {
    reimagine();
  });
});

// setup() function is called once when the program starts
function setup() {
  // place our canvas, making it fit our container
  canvasContainer = $("#canvas-container");
  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  canvas.parent("canvas-container");
  // resize canvas is the page is resized

  // create an instance of the class
  myInstance = new MyClass("VALUE1", "VALUE2");

  $(window).resize(function() {
    resizeScreen();
  });
  resizeScreen();
}

// draw() function is called repeatedly, it's the main animation loop
function draw() {
  randomSeed(seed);

  background(100);

  noStroke();

  fill(skyColor);
  rect(0, 0, width, height / 2.5);

  fill(sandColor);
  rect(0, height / 2.5, width, height / 1);
  
  fill(grassColor);
  beginShape();
  vertex(0, height / 1.5);  
  vertex(width, height / 3.5); 
  vertex(width, height / 3); 
  vertex(width * 0.8, height / 3 + 70); 
  vertex(width * 0.2, height / 3 + 10); 
  vertex(0, height / 3); 
  endShape(CLOSE);
  
  fill(rockColor);
  beginShape();
  vertex(10, height / 2);
  const steps = 20;
  for (let i = 4; i < steps + 1; i++) {
    let x = (width * i) / steps;
    let y =
      height / 3 - (random() * random() * random() * height) / 3 - height / 50;
    vertex(x, y);
  }
  vertex(width, height / 2);
  endShape(CLOSE);

  fill(treeColor);
  const trees = 5 * random();
  const scrub = mouseX / width;
  for (let i = 0; i < trees; i++) {
    let z = random();
    let x = width * ((random() + (scrub / 50 + millis() / 500000.0) / z) % 1);
    let s = width / 100 / z;
    let y = height / 2 + height / 20 / z;
    
    beginShape(); //trapezoid shape
    vertex(x - s / 2, y); // left bottom
    vertex(x + s / 2, y); // right bottom
    vertex(x + s / 4, y - s * 2); // right top
    vertex(x - s / 4, y - s * 2); // left top
    endShape(CLOSE);
  }

  fill(bushColor);
  const bushes = 50 * random();
  const plant = mouseX / width;
  for (let i = 0; i < bushes; i++) {
    let z = random();
    let x = width * ((random() + (scrub / 50 + millis() / 500000.0) / z) % 1);
    let s = width / 150 / z;
    let y = height / 2 + height / 20 / z;
    ellipse(x, y, s, s);
  }
}

// mousePressed() function is called once after every time a mouse button is pressed
function mousePressed() {
    // code to run when mouse is pressed
}