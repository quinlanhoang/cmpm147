// sketch.js - Experiment 3 - Alternate Worlds
// Author: Quinlan Hoang
// Date: 4/22/2024

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file
const VALUE1 = 1;
const VALUE2 = 2;

// Globals
let myInstance;
let canvasContainer;
var centerHorz, centerVert;
let tilesetImage;
let seed = 0;
let currentGrid = [];
let numRows, numCols;

class MyClass {
    constructor(param1, param2) {
        this.property1 = param1;
        this.property2 = param2;
    }

    myMethod() {
        // code to run when method is called
    }
}

function preload() {
    tilesetImage = loadImage("tilesetP8.png"); 
    tilesetImage = loadImage("tileset.png"); 
}

function setup() {
  // Check if the canvas container exists
  canvasContainer = $("#canvas-container");
  if (!canvasContainer) {
    console.error("Canvas container not found.");
    return;
  }

  // Create the canvas
  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  if (!canvas) {
    console.error("Failed to create canvas.");
    return;
  }

  // Append the canvas to the canvas container
  canvasContainer.append(canvas);

  // Create an instance of the class
  myInstance = new MyClass("VALUE1", "VALUE2");

  // Resize canvas if the page is resized
  $(window).resize(function() {
    resizeScreen();
  });
  resizeScreen();

  // Set the number of columns and rows based on the ASCII box
  let asciiBox = select("#asciiBox");
  if (asciiBox) {
    numCols = asciiBox.attribute("rows") | 0;
    numRows = asciiBox.attribute("cols") | 0;
  } else {
    numCols = 20; // Default number of columns
    numRows = 20; // Default number of rows
  }

  // Create a new canvas based on the number of columns and rows
  createCanvas(16 * numCols, 16 * numRows).parent("canvasContainer");
  select("canvas").elt.getContext("2d").imageSmoothingEnabled = false;

  // Set up event listeners
  select("#reseedButton").mousePressed(reseed);
  if (asciiBox) {
    asciiBox.input(reparseGrid);
  }

  // Generate initial grid
  reseed();
}


function draw() {
    background(220);
    myInstance.myMethod();
    drawGrid(currentGrid);
}

function drawGrid(grid) {
  background(128);

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] == '_') {
        placeTile(i, j, floor(random(4,7)), 9);
      } else if (grid[i][j] == '.') {
        // Place a random tile for '.'
        placeTile(i, j, floor(random(9,12)), 15); // Assuming 1 represents '.'
      } else if (grid[i][j] == '!') {
        // Place a random tile for '!'
        placeTile(i, j, floor(random(10, 12)), 9); // Assuming 2 represents '!'
      } else if (grid[i][j] == '?') {
        // Place 1-3 chests represented by '?'
        placeTile(i, j, floor(random(4)), 30);
      }
    }
  }
}

function placeTile(i, j, ti, tj) {
    image(tilesetImage, 16 * j, 16 * i, 16, 16, 8 * ti, 8 * tj, 8, 8);
}

function reseed() {
    seed = (seed | 0) + 1109;
    randomSeed(seed);
    noiseSeed(seed);
    select("#seedReport").html("seed " + seed);
    regenerateGrid();
}

function regenerateGrid() {
    select("#asciiBox").value(gridToString(generateGrid(numCols, numRows)));
    reparseGrid();
}

function reparseGrid() {
    currentGrid = stringToGrid(select("#asciiBox").value());
}

function gridToString(grid) {
    let rows = [];
    for (let i = 0; i < grid.length; i++) {
        rows.push(grid[i].join(""));
    }
    return rows.join("\n");
}

function stringToGrid(str) {
    let grid = [];
    let lines = str.split("\n");
    for (let i = 0; i < lines.length; i++) {
        let row = [];
        let chars = lines[i].split("");
        for (let j = 0; j < chars.length; j++) {
            row.push(chars[j]);
        }
        grid.push(row);
    }
    return grid;
}

function resizeScreen() {
    centerHorz = canvasContainer.width() / 2; // Adjusted for drawing logic
    centerVert = canvasContainer.height() / 2; // Adjusted for drawing logic
    console.log("Resizing...");
    resizeCanvas(canvasContainer.width(), canvasContainer.height());
}

function generateGrid(numCols, numRows) {
    let grid = [];

    // initialize main overlay with '_'
    for (let i = 0; i < numRows; i++) {
        let row = [];
        for (let j = 0; j < numCols; j++) {
            row.push('_');
        }
        grid.push(row);
    }

    // will generate 1-5 rooms
    let numRooms = floor(random(2, 6));
    let rooms = [];

    for (let room = 0; room < numRooms; room++) {
        // generates the random room
        let roomWidth = floor(random(4, 6)); // random width for the rooms
        let roomHeight = floor(random(4, 6)); // random height for the rooms
        let startX = floor(random(1, numCols - roomWidth - 1)); // random start x coordinate for the rooms
        let startY = floor(random(1, numRows - roomHeight - 1)); // random start y coordinate for the rooms

        let newRoom = {
            x: startX,
            y: startY,
            width: roomWidth,
            height: roomHeight
        };
        rooms.push(newRoom);

        // rooms are represented by '.'
        for (let x = startX; x < startX + roomWidth; x++) {
            for (let y = startY; y < startY + roomHeight; y++) {
                grid[x][y] = '.';
            }
        }

        // place chests in the room
        let numChests = floor(random(1, 4)); // random number of chests between 1 and 3
        for (let chest = 0; chest < numChests; chest++) {
            let chestX = floor(random(startX + 1, startX + roomWidth - 1)); // random x coordinate for chest within room
            let chestY = floor(random(startY + 1, startY + roomHeight - 1)); // random y coordinate for chest within room
            grid[chestX][chestY] = '?'; // chest represented by '?'
        }

        // generate pathway to connect rooms
        if (room > 0) {
            let prevRoom = rooms[room - 1];
            let pathStartX = floor(prevRoom.x + prevRoom.width / 2);
            let pathStartY = floor(prevRoom.y + prevRoom.height / 2);
            let pathEndX = floor(startX + roomWidth / 2);
            let pathEndY = floor(startY + roomHeight / 2);
            drawPath(grid, pathStartX, pathStartY, pathEndX, pathEndY);
        }
    }

    // outlines rooms with '!'
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            if (grid[i][j] === '.') {
                if (i > 0 && grid[i - 1][j] === '_') grid[i - 1][j] = '!';
                if (i < numRows - 1 && grid[i + 1][j] === '_') grid[i + 1][j] = '!';
                if (j > 0 && grid[i][j - 1] === '_') grid[i][j - 1] = '!';
                if (j < numCols - 1 && grid[i][j + 1] === '_') grid[i][j + 1] = '!';
            }
        }
    }

    return grid;
}

function drawPath(grid, startX, startY, endX, endY) {
    let currentX = startX;
    let currentY = startY;

    while (currentX !== endX || currentY !== endY) {
        if (currentX < endX) {
            currentX++;
        } else if (currentX > endX) {
            currentX--;
        }

        if (currentY < endY) {
            currentY++;
        } else if (currentY > endY) {
            currentY--;
        }

        if (grid[currentX][currentY] !== '.') {
            grid[currentX][currentY] = '.';
        }

        for (let i = 1; i <= 2; i++) {
            if (currentX + i < grid.length && grid[currentX + i][currentY] !== '.') {
                grid[currentX + i][currentY] = '.';
            }
            if (currentX - i >= 0 && grid[currentX - i][currentY] !== '.') {
                grid[currentX - i][currentY] = '.';
            }
            if (currentY + i < grid[0].length && grid[currentX][currentY + i] !== '.') {
                grid[currentX][currentY + i] = '.';
            }
            if (currentY - i >= 0 && grid[currentX][currentY - i] !== '.') {
                grid[currentX][currentY - i] = '.';
            }
        }
    }

    let chestX = startX + Math.floor((endX - startX) / 2);
    let chestY = startY + Math.floor((endY - startY) / 2);
    grid[chestX][chestY] = '?';
}
