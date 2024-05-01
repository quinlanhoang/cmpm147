
let worldSeed;
let Gkey = "xyzzy";


const s1 = (sketch) => {
  /* global p5 */
  /* exported preload, setup, draw, mouseClicked */

  // Project base code provided by {amsmith,ikarth}@ucsc.edu


  let tile_width_step_main; // A width step is half a tile's width
  let tile_height_step_main; // A height step is half a tile's height

  // Global variables. These will mostly be overwritten in setup().
  let tile_rows, tile_columns;
  let camera_offset;
  let camera_velocity;

  /////////////////////////////
  // Transforms between coordinate systems
  // These are actually slightly weirder than in full 3d...
  /////////////////////////////
  function worldToScreen([world_x, world_y], [camera_x, camera_y]) {
    let i = (world_x - world_y) * tile_width_step_main;
    let j = (world_x + world_y) * tile_height_step_main;
    return [i + camera_x, j + camera_y];
  }

  function worldToCamera([world_x, world_y], [camera_x, camera_y]) {
    let i = (world_x - world_y) * tile_width_step_main;
    let j = (world_x + world_y) * tile_height_step_main;
    return [i, j];
  }

  function tileRenderingOrder(offset) {
    return [offset[1] - offset[0], offset[0] + offset[1]];
  }

  function screenToWorld([screen_x, screen_y], [camera_x, camera_y]) {
    screen_x -= camera_x;
    screen_y -= camera_y;
    screen_x /= tile_width_step_main * 2;
    screen_y /= tile_height_step_main * 2;
    screen_y += 0.5;
    return [Math.floor(screen_y + screen_x), Math.floor(screen_y - screen_x)];
  }

  function cameraToWorldOffset([camera_x, camera_y]) {
    let world_x = camera_x / (tile_width_step_main * 2);
    let world_y = camera_y / (tile_height_step_main * 2);
    return { x: Math.round(world_x), y: Math.round(world_y) };
  }

  function worldOffsetToCamera([world_x, world_y]) {
    let camera_x = world_x * (tile_width_step_main * 2);
    let camera_y = world_y * (tile_height_step_main * 2);
    return new p5.Vector(camera_x, camera_y);
  }

  sketch.preload = function() {
    if (p3_preload) {
      p3_preload();
    }
  }

  sketch.setup = function() {
    //canvas1 = createCanvas(600, 600/3);
    //canvas1.parent("container");

    camera_offset = new p5.Vector(-sketch.width / 2, sketch.height / 2);
    camera_velocity = new p5.Vector(0, 0);

    if (p3_setup) {
      p3_setup();
    }
    for (let element of document.getElementsByClassName("p5Canvas")) {
      element.addEventListener("contextmenu", (e) => e.preventDefault());
    }
    
    //let label = sketch.createP();
    //label.html("World key: ");
    //label.parent("canvas-container1");

    //let input = sketch.createInput("xyzzy");
    //input.parent(label);
    //input.input(() => {
    //  rebuildWorld(input.value());
    //});

    //sketch.createP("Arrow keys scroll. Clicking changes tiles.").parent("canvas-container1");

    //rebuildWorld(input.value());
    
    rebuildWorld(Gkey);
  }

  function rebuildWorld(key) {
    if (p3_worldKeyChanged) {
      p3_worldKeyChanged(key);
    }
    tile_width_step_main = p3_tileWidth ? p3_tileWidth() : 32;
    tile_height_step_main = p3_tileHeight ? p3_tileHeight() : 14.5;
    tile_columns = Math.ceil(sketch.width / (tile_width_step_main * 2));
    tile_rows = Math.ceil((sketch.height + 150) / (tile_height_step_main * 2));
  }

  function mouseClicked() {
    let world_pos = screenToWorld(
      [0 - mouseX, mouseY],
      [camera_offset.x, camera_offset.y]
    );

    if (p3_tileClicked) {
      p3_tileClicked(world_pos[0], world_pos[1]);
    }
    return false;
  }

  sketch.draw = function() {
    // Keyboard controls!
    if (sketch.keyIsDown(sketch.LEFT_ARROW) || sketch.keyIsDown(65)) {
      camera_velocity.x -= 1;
    }
    if (sketch.keyIsDown(sketch.RIGHT_ARROW) || sketch.keyIsDown(68)) {
      camera_velocity.x += 1;
    }
    if (sketch.keyIsDown(sketch.DOWN_ARROW) || sketch.keyIsDown(83)) {
      camera_velocity.y -= 1;
    }
    if (sketch.keyIsDown(sketch.UP_ARROW) || sketch.keyIsDown(87)) {
      camera_velocity.y += 1;
    }

    let camera_delta = new p5.Vector(0, 0);
    camera_velocity.add(camera_delta);
    camera_offset.add(camera_velocity);
    camera_velocity.mult(0.95); // cheap easing
    if (camera_velocity.mag() < 0.01) {
      camera_velocity.setMag(0);
    }

    let world_pos = screenToWorld(
      [0 - sketch.mouseX, sketch.mouseY],
      [camera_offset.x, camera_offset.y]
    );
    let world_offset = cameraToWorldOffset([camera_offset.x, camera_offset.y]);

    sketch.background(100);

    if (p3_drawBefore) {
      p3_drawBefore();
    }

    let overdraw = 0.1;

    let y0 = Math.floor((0 - overdraw) * tile_rows);
    let y1 = Math.floor((1 + overdraw) * tile_rows);
    let x0 = Math.floor((0 - overdraw) * tile_columns);
    let x1 = Math.floor((1 + overdraw) * tile_columns);

    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        drawTile(tileRenderingOrder([x + world_offset.x, y - world_offset.y]), [
          camera_offset.x,
          camera_offset.y
        ]); // odd row
      }
      for (let x = x0; x < x1; x++) {
        drawTile(
          tileRenderingOrder([
            x + 0.5 + world_offset.x,
            y + 0.5 - world_offset.y
          ]),
          [camera_offset.x, camera_offset.y]
        ); // even rows are offset horizontally
      }
    }

    describeMouseTile(world_pos, [camera_offset.x, camera_offset.y]);

    if (p3_drawAfter) {
      p3_drawAfter();
    }
  }

  // Display a discription of the tile at world_x, world_y.
  function describeMouseTile([world_x, world_y], [camera_x, camera_y]) {
    let [screen_x, screen_y] = worldToScreen(
      [world_x, world_y],
      [camera_x, camera_y]
    );
    drawTileDescription([world_x, world_y], [0 - screen_x, screen_y]);
  }

  function drawTileDescription([world_x, world_y], [screen_x, screen_y]) {
    sketch.push();
    sketch.translate(screen_x, screen_y);
    if (p3_drawSelectedTile) {
      p3_drawSelectedTile(world_x, world_y, screen_x, screen_y);
    }
    sketch.pop();
  }

  // Draw a tile, mostly by calling the user's drawing code.
  function drawTile([world_x, world_y], [camera_x, camera_y]) {
    let [screen_x, screen_y] = worldToScreen(
      [world_x, world_y],
      [camera_x, camera_y]
    );
    sketch.push();
    sketch.translate(0 - screen_x, screen_y);
    if (p3_drawTile) {
      p3_drawTile(world_x, world_y, -screen_x, screen_y);
    }
    sketch.pop();
  }

/* global XXH, sketch */
/* exported --
    p3_preload
    p3_setup
    p3_worldKeyChanged
    p3_tileWidth
    p3_tileHeight
    p3_tileClicked
    p3_drawBefore
    p3_drawTile
    p3_drawSelectedTile
    p3_drawAfter
*/

function p3_preload() {}

function p3_setup() {
  let canvas = sketch.createCanvas(600, 600/3);
  canvas.parent("canvas-container1");
}

function p3_worldKeyChanged(key) {
  worldSeed = XXH.h32(key, 0);
  sketch.noiseSeed(worldSeed);
  sketch.randomSeed(worldSeed);
}

function p3_tileWidth() {
  return 32;
}
function p3_tileHeight() {
  return 16;
}

let [tw, th] = [p3_tileWidth(), p3_tileHeight()];

let clicks = {};

function p3_tileClicked(i, j) {
  let key = [i, j];
  clicks[key] = 1 + (clicks[key] | 0);
}

function p3_drawBefore() {}

function p3_drawTile(i, j) {
  sketch.noStroke();

  // Calculate elevation based on Perlin noise
  let elevation = sketch.map(sketch.noise(i * 0.05, j * 0.05), 0, 1, -50, 50); // Adjust the frequency and range as needed

  // Adjust elevation for hills
  if (elevation > 10) {
    elevation += 5; // Increase elevation for hills
  }
  // Adjust elevation for water
  else if (elevation < -10) {
    elevation -= 5; // Decrease elevation for water
  }

  // Calculate the height of the tile based on elevation
  let tileHeight = p3_tileHeight(); // Get the base tile height
  tileHeight += elevation; // Add elevation to the base height

  // Calculate fill color based on elevation
  let fillColor;
  if (elevation > 10) {
    // Brown color for higher elevations (hills)
    let brownShade = sketch.random(139, 169); // Random shade between 139 and 169
    fillColor = sketch.color(139, brownShade, 19); // Vary the green component
  } else if (elevation < -10) {
    // Blue color for lower elevations (water)
    let blueShade = sketch.random(100, 150); // Random shade between 100 and 150
    let waveFactor = sketch.map(sketch.sin(sketch.frameCount * 0.1 + i * 0.5 + j * 0.5), -1, 1, 0, 1); // Map sine wave to range [0, 1]
    let waveColor = sketch.lerpColor(sketch.color(0, 0, blueShade), sketch.color(255), waveFactor); // Blend blue with white based on waveFactor
    fillColor = sketch.lerpColor(sketch.color(0, 0, blueShade), waveColor, 0.5); // Blend blue with the waveColor
  } else {
    // Default green color for other elevations (plains)
    let greenShade = sketch.random(100, 200); // Random shade between 100 and 200
    fillColor = sketch.color(0, greenShade, 0); // Vary the green component
  }

  // Fill the tile with the calculated color
  sketch.fill(fillColor);

  // Draw the tile shape with adjusted height
  sketch.push();
  sketch.beginShape();
  sketch.vertex(-tw, 0);
  sketch.vertex(0, th);
  sketch.vertex(tw, 0);
  sketch.vertex(0, -th);
  sketch.endShape(sketch.CLOSE);

  // Adjust the height of the tile
  sketch.translate(0, -tileHeight);

  // Draw additional features based on elevation (e.g., hills, valleys)
  // Add your custom logic here based on elevation value
  if (elevation > 10) {
    // Draw a 3D cube on top of the hill tiles
    sketch.fill(139, fillColor.levels[1] + 20, 19); // Brown color for the cube
    // Draw the top face of the cube
    sketch.beginShape();
    sketch.vertex(-tw, 0);
    sketch.vertex(0, -th);
    sketch.vertex(tw, 0);
    sketch.endShape(sketch.CLOSE);
    // Draw the sides of the cube
    sketch.beginShape(sketch.QUADS);
    sketch.vertex(-tw, 0); // Bottom left
    sketch.vertex(-tw, 0); // Top left
    sketch.vertex(0, -th); // Top right
    sketch.vertex(0, 0); // Bottom right
    
    sketch.vertex(0, 0); // Bottom left
    sketch.vertex(0, -th); // Top left
    sketch.vertex(tw, 0); // Top right
    sketch.vertex(tw, 0); // Bottom right

    sketch.vertex(tw, 0); // Bottom left
    sketch.vertex(tw, 0); // Top left
    sketch.vertex(0, -th); // Top right
    sketch.vertex(0, 0); // Bottom right

    sketch.endShape(sketch.CLOSE);
  }
  
  sketch.pop();
}


function p3_drawSelectedTile(i, j) {
  sketch.noFill();
  sketch.stroke(0, 255, 0, 128);

  sketch.beginShape();
  sketch.vertex(-tw, 0);
  sketch.vertex(0, th);
  sketch.vertex(tw, 0);
  sketch.vertex(0, -th);
  sketch.endShape(sketch.CLOSE);

  sketch.noStroke();
  sketch.fill(0);

  // Determine the type of tile based on elevation and color
  let elevation = sketch.map(sketch.noise(i * 0.05, j * 0.05), 0, 1, -50, 50);
  let tileType;
  let fillColor;
  if (elevation > 10) {
    tileType = "Wheat"; // Brown (wheat)
    fillColor = sketch.color(139, sketch.random(139, 169), 19); // Brown color
  } else if (elevation < -10) {
    tileType = "Water"; // Blue (water)
    fillColor = sketch.color(0, 0, sketch.random(100, 150)); // Blue color
  } else {
    tileType = "Grass"; // Green (grass)
    fillColor = sketch.color(0, sketch.random(100, 200), 0); // Green color
  }

  // Display the type of tile
  sketch.text(tileType, 0, 0);

  // Display the coordinates (i, j)
  sketch.text("Tile " + i + ", " + j, 0, 12);
}

function p3_drawAfter() {}
}


const s2 = (sketch) => {
  /* global p5 */
  /* exported preload, setup, draw, mouseClicked */

  // Project base code provided by {amsmith,ikarth}@ucsc.edu


  let tile_width_step_main; // A width step is half a tile's width
  let tile_height_step_main; // A height step is half a tile's height

  // Global variables. These will mostly be overwritten in setup().
  let tile_rows, tile_columns;
  let camera_offset;
  let camera_velocity;

  /////////////////////////////
  // Transforms between coordinate systems
  // These are actually slightly weirder than in full 3d...
  /////////////////////////////
  function worldToScreen([world_x, world_y], [camera_x, camera_y]) {
    let i = (world_x - world_y) * tile_width_step_main;
    let j = (world_x + world_y) * tile_height_step_main;
    return [i + camera_x, j + camera_y];
  }

  function worldToCamera([world_x, world_y], [camera_x, camera_y]) {
    let i = (world_x - world_y) * tile_width_step_main;
    let j = (world_x + world_y) * tile_height_step_main;
    return [i, j];
  }

  function tileRenderingOrder(offset) {
    return [offset[1] - offset[0], offset[0] + offset[1]];
  }

  function screenToWorld([screen_x, screen_y], [camera_x, camera_y]) {
    screen_x -= camera_x;
    screen_y -= camera_y;
    screen_x /= tile_width_step_main * 2;
    screen_y /= tile_height_step_main * 2;
    screen_y += 0.5;
    return [Math.floor(screen_y + screen_x), Math.floor(screen_y - screen_x)];
  }

  function cameraToWorldOffset([camera_x, camera_y]) {
    let world_x = camera_x / (tile_width_step_main * 2);
    let world_y = camera_y / (tile_height_step_main * 2);
    return { x: Math.round(world_x), y: Math.round(world_y) };
  }

  function worldOffsetToCamera([world_x, world_y]) {
    let camera_x = world_x * (tile_width_step_main * 2);
    let camera_y = world_y * (tile_height_step_main * 2);
    return new p5.Vector(camera_x, camera_y);
  }

  sketch.preload = function() {
    if (p3_preload) {
      p3_preload();
    }
  }

  sketch.setup = function() {
    //canvas1 = createCanvas(600, 600/3);
    //canvas1.parent("container");

    camera_offset = new p5.Vector(-sketch.width / 2, sketch.height / 2);
    camera_velocity = new p5.Vector(0, 0);

    if (p3_setup) {
      p3_setup();
    }
    for (let element of document.getElementsByClassName("p5Canvas")) {
      element.addEventListener("contextmenu", (e) => e.preventDefault());
    }

    //let label = sketch.createP();
    //label.html("World key: ");
    //label.parent("canvas-container2");

    //let input = sketch.createInput("xyzzy");
    //input.parent(label);
    //input.input(() => {
    //  rebuildWorld(input.value());
    //});

    //sketch.createP("Arrow keys scroll. Clicking changes tiles.").parent("canvas-container2");

    //rebuildWorld(input.value());
    rebuildWorld(Gkey);
  }

  function rebuildWorld(key) {
    if (p3_worldKeyChanged) {
      p3_worldKeyChanged(key);
    }
    tile_width_step_main = p3_tileWidth ? p3_tileWidth() : 32;
    tile_height_step_main = p3_tileHeight ? p3_tileHeight() : 14.5;
    tile_columns = Math.ceil(sketch.width / (tile_width_step_main * 2));
    tile_rows = Math.ceil((sketch.height + 150) / (tile_height_step_main * 2));
  }

  function mouseClicked() {
    let world_pos = screenToWorld(
      [0 - mouseX, mouseY],
      [camera_offset.x, camera_offset.y]
    );

    if (p3_tileClicked) {
      p3_tileClicked(world_pos[0], world_pos[1]);
    }
    return false;
  }

  sketch.draw = function() {
    // Keyboard controls!
    if (sketch.keyIsDown(sketch.LEFT_ARROW) || sketch.keyIsDown(65)) {
      camera_velocity.x -= 1;
    }
    if (sketch.keyIsDown(sketch.RIGHT_ARROW) || sketch.keyIsDown(68)) {
      camera_velocity.x += 1;
    }
    if (sketch.keyIsDown(sketch.DOWN_ARROW) || sketch.keyIsDown(83)) {
      camera_velocity.y -= 1;
    }
    if (sketch.keyIsDown(sketch.UP_ARROW) || sketch.keyIsDown(87)) {
      camera_velocity.y += 1;
    }

    let camera_delta = new p5.Vector(0, 0);
    camera_velocity.add(camera_delta);
    camera_offset.add(camera_velocity);
    camera_velocity.mult(0.95); // cheap easing
    if (camera_velocity.mag() < 0.01) {
      camera_velocity.setMag(0);
    }

    let world_pos = screenToWorld(
      [0 - sketch.mouseX, sketch.mouseY],
      [camera_offset.x, camera_offset.y]
    );
    let world_offset = cameraToWorldOffset([camera_offset.x, camera_offset.y]);

    sketch.background(100);

    if (p3_drawBefore) {
      p3_drawBefore();
    }

    let overdraw = 0.1;

    let y0 = Math.floor((0 - overdraw) * tile_rows);
    let y1 = Math.floor((1 + overdraw) * tile_rows);
    let x0 = Math.floor((0 - overdraw) * tile_columns);
    let x1 = Math.floor((1 + overdraw) * tile_columns);

    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        drawTile(tileRenderingOrder([x + world_offset.x, y - world_offset.y]), [
          camera_offset.x,
          camera_offset.y
        ]); // odd row
      }
      for (let x = x0; x < x1; x++) {
        drawTile(
          tileRenderingOrder([
            x + 0.5 + world_offset.x,
            y + 0.5 - world_offset.y
          ]),
          [camera_offset.x, camera_offset.y]
        ); // even rows are offset horizontally
      }
    }

    describeMouseTile(world_pos, [camera_offset.x, camera_offset.y]);

    if (p3_drawAfter) {
      p3_drawAfter();
    }
  }

  // Display a discription of the tile at world_x, world_y.
  function describeMouseTile([world_x, world_y], [camera_x, camera_y]) {
    let [screen_x, screen_y] = worldToScreen(
      [world_x, world_y],
      [camera_x, camera_y]
    );
    drawTileDescription([world_x, world_y], [0 - screen_x, screen_y]);
  }

  function drawTileDescription([world_x, world_y], [screen_x, screen_y]) {
    sketch.push();
    sketch.translate(screen_x, screen_y);
    if (p3_drawSelectedTile) {
      p3_drawSelectedTile(world_x, world_y, screen_x, screen_y);
    }
    sketch.pop();
  }

  // Draw a tile, mostly by calling the user's drawing code.
  function drawTile([world_x, world_y], [camera_x, camera_y]) {
    let [screen_x, screen_y] = worldToScreen(
      [world_x, world_y],
      [camera_x, camera_y]
    );
    sketch.push();
    sketch.translate(0 - screen_x, screen_y);
    if (p3_drawTile) {
      p3_drawTile(world_x, world_y, -screen_x, screen_y);
    }
    sketch.pop();
  }

/* global XXH, sketch */
/* exported --
    p3_preload
    p3_setup
    p3_worldKeyChanged
    p3_tileWidth
    p3_tileHeight
    p3_tileClicked
    p3_drawBefore
    p3_drawTile
    p3_drawSelectedTile
    p3_drawAfter
*/

function p3_preload() {}

function p3_setup() {
  let canvas = sketch.createCanvas(600, 600/3);
  canvas.parent("canvas-container2");
}

function p3_worldKeyChanged(key) {
  worldSeed = XXH.h32(key, 0);
  sketch.noiseSeed(worldSeed);
  sketch.randomSeed(worldSeed);
}

function p3_tileWidth() {
  return 32;
}

function p3_tileHeight() {
  return 16;
}

let [tw, th] = [p3_tileWidth(), p3_tileHeight()];

let clicks = {};

function p3_tileClicked(i, j) {
  let key = [i, j];
  clicks[key] = 1 + (clicks[key] | 0);
}

function p3_drawBefore() {}

function p3_drawTile(i, j) {
  sketch.noStroke();

  // Calculate elevation based on Perlin noise
  let elevation = sketch.map(sketch.noise(i * 0.05, j * 0.05), 0, 1, -50, 50); // Adjust the frequency and range as needed

  // Adjust elevation for wheat
  if (elevation > 10) {
    elevation += 5; // Increase elevation for wheat
  }
  // Adjust elevation for water
  else if (elevation < -10) {
    elevation -= 5; // Decrease elevation for water
  }

  // Calculate the height of the tile based on elevation
  let tileHeight = p3_tileHeight(); // Get the base tile height
  tileHeight += elevation; // Add elevation to the base height

  // Fill colors based on elevation
  let fillColor;
  if (elevation > 10) {
    // Brown color for higher elevations (wheat)
    fillColor = sketch.color(139, 69, 19); // Solid brown color
    
    // Draw the top shape for wheat tiles with increased height
    sketch.beginShape();
    sketch.vertex(-tw, -20); // Adjust the height for the 3D effect (twice as tall)
    sketch.vertex(0, th - 20); // Adjust the height for the 3D effect (twice as tall)
    sketch.vertex(tw, -20); // Adjust the height for the 3D effect (twice as tall)
    sketch.vertex(0, -th - 20); // Adjust the height for the 3D effect (twice as tall)
    sketch.endShape(sketch.CLOSE);
  
    // Connect corresponding points with lines to form vertices
    sketch.stroke(0); // Set stroke color to black
  
    // Connect bottom-left corner to top-left corner
    sketch.line(-tw, 0, -tw, -20);
    // Connect top-left corner to top-middle
    sketch.line(-tw, -20, 0, th - 20);
    // Connect top-middle to top-right corner
    sketch.line(0, th - 20, tw, -20);
    // Connect top-right corner to bottom-right corner
    sketch.line(tw, -20, tw, 0);
    // Connect bottom-right corner to bottom-middle
    sketch.line(tw, 0, 0, -th);
    // Connect bottom-middle to bottom-left corner
    sketch.line(0, -th, -tw, 0);
  } else if (elevation < -10) {
    // Blue color for lower elevations (water)
    fillColor = sketch.color(0, 0, 139); // Solid blue color
  } else {
    // Default green color for other elevations (grass)
    fillColor = sketch.color(0, 128, 0); // Solid green color
    
    // Draw the top shape for grass tiles with standard height
    sketch.beginShape();
    sketch.vertex(-tw, -10); // Adjust the height for the 3D effect
    sketch.vertex(0, th - 10); // Adjust the height for the 3D effect
    sketch.vertex(tw, -10); // Adjust the height for the 3D effect
    sketch.vertex(0, -th - 10); // Adjust the height for the 3D effect
    sketch.endShape(sketch.CLOSE);
  
    // Connect corresponding points with lines to form vertices
    sketch.stroke(0); // Set stroke color to black
  
    // Connect bottom-left corner to top-left corner
    sketch.line(-tw, 0, -tw, -10);
    // Connect top-left corner to top-middle
    sketch.line(-tw, -10, 0, th - 10);
    // Connect top-middle to top-right corner
    sketch.line(0, th - 10, tw, -10);
    // Connect top-right corner to bottom-right corner
    sketch.line(tw, -10, tw, 0);
    // Connect bottom-right corner to bottom-middle
    sketch.line(tw, 0, 0, -th);
    // Connect bottom-middle to bottom-left corner
    sketch.line(0, -th, -tw, 0);
  }

  let n = clicks[[i, j]] | 0;
  if (n % 2 == 1) {
    // Draw circles for clicked tiles
    sketch.fill(0, 0, 0, 32);
    sketch.ellipse(0, 0, 10, 5);
    sketch.translate(0, -10);
    sketch.fill(255, 255, 100, 128);
    sketch.ellipse(0, 0, 10, 10);
  }
}

function p3_drawSelectedTile(i, j) {
  sketch.noFill();
  sketch.stroke(0, 255, 0, 128);

  sketch.beginShape();
  sketch.vertex(-tw, 0);
  sketch.vertex(0, th);
  sketch.vertex(tw, 0);
  sketch.vertex(0, -th);
  sketch.endShape(sketch.CLOSE);

  sketch.noStroke();
  sketch.fill(0);

  // Determine the type of tile based on elevation and color
  let elevation = sketch.map(sketch.noise(i * 0.05, j * 0.05), 0, 1, -50, 50);
  let tileType;
  let fillColor;
  if (elevation > 10) {
    tileType = "Wheat"; // Brown (wheat)
    fillColor = sketch.color(139, sketch.random(139, 169), 19); // Brown color
  } else if (elevation < -10) {
    tileType = "Water"; // Blue (water)
    fillColor = sketch.color(0, 0, sketch.random(100, 150)); // Blue color
  } else {
    tileType = "Grass"; // Green (grass)
    fillColor = sketch.color(0, sketch.random(100, 200), 0); // Green color
  }

  // Display the type of tile
  sketch.text(tileType, 0, 0);

  // Display the coordinates (i, j)
  sketch.text("Tile " + i + ", " + j, 0, 12);
}

function p3_drawAfter() {}
}


const s3 = (sketch) => {
  /* global p5 */
  /* exported preload, setup, draw, mouseClicked */

  // Project base code provided by {amsmith,ikarth}@ucsc.edu


  let tile_width_step_main; // A width step is half a tile's width
  let tile_height_step_main; // A height step is half a tile's height

  // Global variables. These will mostly be overwritten in setup().
  let tile_rows, tile_columns;
  let camera_offset;
  let camera_velocity;

  /////////////////////////////
  // Transforms between coordinate systems
  // These are actually slightly weirder than in full 3d...
  /////////////////////////////
  function worldToScreen([world_x, world_y], [camera_x, camera_y]) {
    let i = (world_x - world_y) * tile_width_step_main;
    let j = (world_x + world_y) * tile_height_step_main;
    return [i + camera_x, j + camera_y];
  }

  function worldToCamera([world_x, world_y], [camera_x, camera_y]) {
    let i = (world_x - world_y) * tile_width_step_main;
    let j = (world_x + world_y) * tile_height_step_main;
    return [i, j];
  }

  function tileRenderingOrder(offset) {
    return [offset[1] - offset[0], offset[0] + offset[1]];
  }

  function screenToWorld([screen_x, screen_y], [camera_x, camera_y]) {
    screen_x -= camera_x;
    screen_y -= camera_y;
    screen_x /= tile_width_step_main * 2;
    screen_y /= tile_height_step_main * 2;
    screen_y += 0.5;
    return [Math.floor(screen_y + screen_x), Math.floor(screen_y - screen_x)];
  }

  function cameraToWorldOffset([camera_x, camera_y]) {
    let world_x = camera_x / (tile_width_step_main * 2);
    let world_y = camera_y / (tile_height_step_main * 2);
    return { x: Math.round(world_x), y: Math.round(world_y) };
  }

  function worldOffsetToCamera([world_x, world_y]) {
    let camera_x = world_x * (tile_width_step_main * 2);
    let camera_y = world_y * (tile_height_step_main * 2);
    return new p5.Vector(camera_x, camera_y);
  }

  sketch.preload = function() {
    if (p3_preload) {
      p3_preload();
    }
  }

  sketch.setup = function() {
    //canvas1 = createCanvas(600, 600/3);
    //canvas1.parent("container");

    camera_offset = new p5.Vector(-sketch.width / 2, sketch.height / 2);
    camera_velocity = new p5.Vector(0, 0);

    if (p3_setup) {
      p3_setup();
    }
    for (let element of document.getElementsByClassName("p5Canvas")) {
      element.addEventListener("contextmenu", (e) => e.preventDefault());
    }

    let label = sketch.createP();
    label.html("World key: ");
    label.parent("canvas-container3");

    let input = sketch.createInput("xyzzy");
    input.parent(label);
    input.input(() => {
      rebuildWorld(input.value());
    });

    sketch.createP("Arrow or wasd keys scroll").parent("canvas-container3");

    rebuildWorld(input.value());
  }

  function rebuildWorld(key) {
    if (p3_worldKeyChanged) {
      p3_worldKeyChanged(key);
    }
    tile_width_step_main = p3_tileWidth ? p3_tileWidth() : 32;
    tile_height_step_main = p3_tileHeight ? p3_tileHeight() : 14.5;
    tile_columns = Math.ceil(sketch.width / (tile_width_step_main * 2));
    tile_rows = Math.ceil((sketch.height + 150) / (tile_height_step_main * 2));
  }

  function mouseClicked() {
    let world_pos = screenToWorld(
      [0 - mouseX, mouseY],
      [camera_offset.x, camera_offset.y]
    );

    if (p3_tileClicked) {
      p3_tileClicked(world_pos[0], world_pos[1]);
    }
    return false;
  }

  sketch.draw = function() {
    // Keyboard controls!
    if (sketch.keyIsDown(sketch.LEFT_ARROW) || sketch.keyIsDown(65)) {
      camera_velocity.x -= 1;
    }
    if (sketch.keyIsDown(sketch.RIGHT_ARROW) || sketch.keyIsDown(68)) {
      camera_velocity.x += 1;
    }
    if (sketch.keyIsDown(sketch.DOWN_ARROW) || sketch.keyIsDown(83)) {
      camera_velocity.y -= 1;
    }
    if (sketch.keyIsDown(sketch.UP_ARROW) || sketch.keyIsDown(87)) {
      camera_velocity.y += 1;
    }

    let camera_delta = new p5.Vector(0, 0);
    camera_velocity.add(camera_delta);
    camera_offset.add(camera_velocity);
    camera_velocity.mult(0.95); // cheap easing
    if (camera_velocity.mag() < 0.01) {
      camera_velocity.setMag(0);
    }

    let world_pos = screenToWorld(
      [0 - sketch.mouseX, sketch.mouseY],
      [camera_offset.x, camera_offset.y]
    );
    let world_offset = cameraToWorldOffset([camera_offset.x, camera_offset.y]);

    sketch.background(100);

    if (p3_drawBefore) {
      p3_drawBefore();
    }

    let overdraw = 0.1;

    let y0 = Math.floor((0 - overdraw) * tile_rows);
    let y1 = Math.floor((1 + overdraw) * tile_rows);
    let x0 = Math.floor((0 - overdraw) * tile_columns);
    let x1 = Math.floor((1 + overdraw) * tile_columns);

    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        drawTile(tileRenderingOrder([x + world_offset.x, y - world_offset.y]), [
          camera_offset.x,
          camera_offset.y
        ]); // odd row
      }
      for (let x = x0; x < x1; x++) {
        drawTile(
          tileRenderingOrder([
            x + 0.5 + world_offset.x,
            y + 0.5 - world_offset.y
          ]),
          [camera_offset.x, camera_offset.y]
        ); // even rows are offset horizontally
      }
    }

    describeMouseTile(world_pos, [camera_offset.x, camera_offset.y]);

    if (p3_drawAfter) {
      p3_drawAfter();
    }
  }

  // Display a discription of the tile at world_x, world_y.
  function describeMouseTile([world_x, world_y], [camera_x, camera_y]) {
    let [screen_x, screen_y] = worldToScreen(
      [world_x, world_y],
      [camera_x, camera_y]
    );
    drawTileDescription([world_x, world_y], [0 - screen_x, screen_y]);
  }

  function drawTileDescription([world_x, world_y], [screen_x, screen_y]) {
    sketch.push();
    sketch.translate(screen_x, screen_y);
    if (p3_drawSelectedTile) {
      p3_drawSelectedTile(world_x, world_y, screen_x, screen_y);
    }
    sketch.pop();
  }

  // Draw a tile, mostly by calling the user's drawing code.
  function drawTile([world_x, world_y], [camera_x, camera_y]) {
    let [screen_x, screen_y] = worldToScreen(
      [world_x, world_y],
      [camera_x, camera_y]
    );
    sketch.push();
    sketch.translate(0 - screen_x, screen_y);
    if (p3_drawTile) {
      p3_drawTile(world_x, world_y, -screen_x, screen_y);
    }
    sketch.pop();
  }

  /* global XXH, sketch */
/* exported --
    p3_preload
    p3_setup
    p3_worldKeyChanged
    p3_tileWidth
    p3_tileHeight
    p3_tileClicked
    p3_drawBefore
    p3_drawTile
    p3_drawSelectedTile
    p3_drawAfter
*/

function p3_preload() {}

function p3_setup() {
  canvas = sketch.createCanvas(600, 600/3);
  canvas.parent("canvas-container3");
}

function p3_worldKeyChanged(key) {
  worldSeed = XXH.h32(key, 0);
  sketch.noiseSeed(worldSeed);
  sketch.randomSeed(worldSeed);
}

function p3_tileWidth() {
  return 32;
}

function p3_tileHeight() {
  return 16;
}

let [tw, th] = [p3_tileWidth(), p3_tileHeight()];

let clicks = {};

function p3_tileClicked(i, j) {
  let key = [i, j];
  clicks[key] = 1 + (clicks[key] | 0);
}

function p3_drawBefore() {}

function p3_drawTile(i, j) {
  sketch.noStroke();

  // Calculate elevation based on Perlin noise
  let elevation = sketch.map(sketch.noise(i * 0.05, j * 0.05), 0, 1, -50, 50); // Adjust the frequency and range as needed

  // Adjust elevation for wheat
  if (elevation > 10) {
    elevation += 5; // Increase elevation for wheat
  }
  // Adjust elevation for water
  else if (elevation < -10) {
    elevation -= 5; // Decrease elevation for water
  }

  // Calculate the height of the tile based on elevation
  let tileHeight = p3_tileHeight(); // Get the base tile height
  tileHeight += elevation; // Add elevation to the base height

  // Fill colors based on elevation and type of tile
  let fillColor;
  if (elevation > 10) {
    // Brown color for higher elevations (wheat)
    fillColor = sketch.color(139, 69, 19); // Solid brown color
  } else if (elevation < -10) {
    // Blue color for lower elevations (water)
    fillColor = sketch.color(0, 0, 139); // Solid blue color
  } else {
    // Default green color for other elevations (grass)
    fillColor = sketch.color(0, 128, 0); // Solid green color
  }
  
  sketch.fill(fillColor); // Set fill color based on tile type

  // Draw the top shape for the tile
  sketch.beginShape();
  sketch.vertex(-tw, 0); // bottom-left corner
  sketch.vertex(0, -tileHeight); // top-middle
  sketch.vertex(tw, 0); // bottom-right corner
  sketch.vertex(0, tileHeight); // bottom-middle
  sketch.endShape(sketch.CLOSE);
}


function p3_drawSelectedTile(i, j) {
  sketch.noFill();
  sketch.stroke(0, 255, 0, 128);

  sketch.beginShape();
  sketch.vertex(-tw, 0);
  sketch.vertex(0, th);
  sketch.vertex(tw, 0);
  sketch.vertex(0, -th);
  sketch.endShape(sketch.CLOSE);

  sketch.noStroke();
  sketch.fill(0);

  // Determine the type of tile based on elevation and color
  let elevation = sketch.map(sketch.noise(i * 0.05, j * 0.05), 0, 1, -50, 50);
  let tileType;
  let fillColor;
  if (elevation > 10) {
    tileType = "Dirt"; // Brown (wheat)
    fillColor = sketch.color(139, sketch.random(139, 169), 19); // Brown color
  } else if (elevation < -10) {
    tileType = "Water"; // Blue (water)
    fillColor = sketch.color(0, 0, sketch.random(100, 150)); // Blue color
  } else {
    tileType = "Grass"; // Green (grass)
    fillColor = sketch.color(0, sketch.random(100, 200), 0); // Green color
  }

  // Display the type of tile
  sketch.text(tileType, 0, 0);

  // Display the coordinates (i, j)
  sketch.text("Tile " + i + ", " + j, 0, 12);
}

function p3_drawAfter() {}
}

let p51 = new p5(s1, "canvas-container1");


let p52 = new p5(s2, "canvas-container2");


let p53 = new p5(s3, "canvas-container3");