function generateGrid(numCols, numRows) {
    let grid = [];
  
    // Initialize main overlay with '_'
    for (let i = 0; i < numRows; i++) {
      let row = [];
      for (let j = 0; j < numCols; j++) {
        row.push("_");
      }
      grid.push(row);
    }
  
    // Generate 1-5 rooms
    let numRooms = floor(random(2, 6));
    let rooms = [];
  
    for (let room = 0; room < numRooms; room++) {
      // Generate the random room
      let roomWidth = floor(random(4, 7)); // Random width for the rooms
      let roomHeight = floor(random(4, 7)); // Random height for the rooms
      let startX = floor(random(1, numCols - roomWidth - 1)); // Random start x coordinate for the rooms
      let startY = floor(random(1, numRows - roomHeight - 1)); // Random start y coordinate for the rooms
  
      // Ensure room width and height remain rectangular
      for (let x = startX; x < startX + roomWidth; x++) {
        for (let y = startY; y < startY + roomHeight; y++) {
          if (
            x === startX ||
            x === startX + roomWidth - 1 ||
            y === startY ||
            y === startY + roomHeight - 1
          ) {
            grid[x][y] = ".";
          }
        }
      }
  
      let newRoom = {
        x: startX,
        y: startY,
        width: roomWidth,
        height: roomHeight,
      };
      rooms.push(newRoom);
  
      // Place chests in the room
      let numChests = floor(random(1, 4)); // Random number of chests between 1 and 3
      for (let chest = 0; chest < numChests; chest++) {
        let chestX = floor(random(startX + 1, startX + roomWidth - 2)); // Random x coordinate for chest within room
        let chestY = floor(random(startY + 1, startY + roomHeight - 2)); // Random y coordinate for chest within room
        grid[chestX][chestY] = "?"; // Chest represented by '?'
      }
  
      // Generate pathway to connect rooms
      if (room > 0) {
        let prevRoom = rooms[room - 1];
        let pathStartX = floor(prevRoom.x + prevRoom.width / 2);
        let pathStartY = floor(prevRoom.y + prevRoom.height / 2);
        let pathEndX = floor(startX + roomWidth / 2);
        let pathEndY = floor(startY + roomHeight / 2);
        drawPath(grid, pathStartX, pathStartY, pathEndX, pathEndY);
      }
    }
  
    // Outlines rooms with '!'
    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < numCols; j++) {
        if (grid[i][j] === ".") {
          if (i > 0 && grid[i - 1][j] === "_") grid[i - 1][j] = "!";
          if (i < numRows - 1 && grid[i + 1][j] === "_") grid[i + 1][j] = "!";
          if (j > 0 && grid[i][j - 1] === "_") grid[i][j - 1] = "!";
          if (j < numCols - 1 && grid[i][j + 1] === "_") grid[i][j + 1] = "!";
        }
      }
    }
  
    return grid;
  }
  
  // function that creates pathways
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
  
      if (grid[currentX][currentY] !== ".") {
        grid[currentX][currentY] = ".";
      }
  
      // widens the paths
      for (let i = 1; i <= 2; i++) {
        if (currentX + i < grid.length && grid[currentX + i][currentY] !== ".") {
          grid[currentX + i][currentY] = ".";
        }
        if (currentX - i >= 0 && grid[currentX - i][currentY] !== ".") {
          grid[currentX - i][currentY] = ".";
        }
        if (
          currentY + i < grid[0].length &&
          grid[currentX][currentY + i] !== "."
        ) {
          grid[currentX][currentY + i] = ".";
        }
        if (currentY - i >= 0 && grid[currentX][currentY - i] !== ".") {
          grid[currentX][currentY - i] = ".";
        }
      }
    }
  
    // place a chest along the pathway
    let chestX = startX + Math.floor((endX - startX) / 2);
    let chestY = startY + Math.floor((endY - startY) / 2);
    grid[chestX][chestY] = "?";
  }
  
  // function to check if a location (i,j) is inside the grid and equals a target value
  function gridCheck(grid, i, j, target) {
    return (
      i >= 0 &&
      i < grid.length &&
      j >= 0 &&
      j < grid[0].length &&
      grid[i][j] === target
    );
  }
  
  // function to form a 4-bit code using gridCheck on the north/south/east/west neighbors of i,j for the target code
  function gridCode(grid, i, j, target) {
    let northBit = gridCheck(grid, i - 1, j, target) ? 1 : 0;
    let southBit = gridCheck(grid, i + 1, j, target) ? 1 : 0;
    let eastBit = gridCheck(grid, i, j + 1, target) ? 1 : 0;
    let westBit = gridCheck(grid, i, j - 1, target) ? 1 : 0;
    return (northBit << 0) + (southBit << 1) + (eastBit << 2) + (westBit << 3);
  }
  
  // function to draw the context based on the grid code and target
  function drawContext(grid, i, j, target, ti, tj, lookup) {
    let code = gridCode(grid, i, j, target);
    let [tiOffset, tjOffset] = lookup[code];
    placeTile(i, j, ti + tiOffset, tj + tjOffset);
  }
  
  // global variable referring to an array of 16 elements filled with hand-typed tile offset pairs
  const lookup = [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
    [0, 2],
    [1, 2],
    [2, 2],
    [3, 2],
    [0, 3],
    [1, 3],
    [2, 3],
    [3, 3],
  ];
  
  function drawGrid(grid) {
    background(128);
  
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        if (grid[i][j] == "_") {
          placeTile(i, j, floor(random(4, 7)), 9);
        } else if (grid[i][j] == ".") {
          // Place a random tile for '.'
          placeTile(i, j, floor(random(9, 12)), 15); // Assuming 1 represents '.'
        } else if (grid[i][j] == "!") {
          // Place a random tile for '!'
          placeTile(i, j, floor(random(10, 12)), 9); // Assuming 2 represents '!'
        } else if (grid[i][j] == "?") {
          // Place 1-3 chests represented by '?'
          placeTile(i, j, floor(random(4)), 30);
        }
      }
    }
  }
  