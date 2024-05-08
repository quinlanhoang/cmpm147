/* exported p4_inspirations, p4_initialize, p4_render, p4_mutate */


function getInspirations() {
    return [
      {
        name: "Retro Sunset", 
        assetUrl: "img/retro_sunset.jpg",
        credit: "futuristic sunset landscape with palm trees, mountains in retro wave style. Generative AI by Jo ~ Adobe Stock"
      },
      {
        name: "Minecraft Plains", 
        assetUrl: "img/plains_biome.jpg",
        credit: "Transforming a Plains Biome | Minecraft Farm Build Timelapse [DOWNLOAD] by GeminiTay ~ Youtube"
      },
      {
        name: "Snowboarder", 
        assetUrl: "img/snowboarder.jpg",
        credit: "Male Snowboarder Performing Extreme Mid-Air Trick by Ibex.media ~ Stocksy"
      },
    ];
  }
  
  function initDesign(inspiration) {
    // set the canvas size based on the container
    let canvasContainer = $('.image-container'); // Select the container using jQuery
    let canvasWidth = canvasContainer.width(); // Get the width of the container
    let aspectRatio = inspiration.image.height / inspiration.image.width;
    let canvasHeight = canvasWidth * aspectRatio; // Calculate the height based on the aspect ratio
    resizeCanvas(canvasWidth, canvasHeight);
    $(".caption").text(inspiration.credit); // Set the caption text
  
    // add the original image to #original
    const imgHTML = `<img src="${inspiration.assetUrl}" style="width:${canvasWidth}px;">`
    $('#original').empty();
    $('#original').append(imgHTML);
    
    let design = {
      bg: 128,
      fg: []
    }
    
    for(let i = 0; i < 100; i++) {
      design.fg.push({x: random(width),
        y: random(height),
        w: random(width/2),
        h: random(height/2),
        fill: random(255)})
    }
    return design;
  }
  
  function renderDesign(design, inspiration) {
    
    background(design.bg);
    noStroke();
    for(let ellipse of design.fg) {
      fill(ellipse.fill, 128);
      rect(ellipse.x, ellipse.y, ellipse.w, ellipse.h);
    }
  }
  
  function mutateDesign(design, inspiration, rate) {
    design.bg = mut(design.bg, 0, 255, rate);
    for(let ellipse of design.fg) {
      ellipse.fill = mut(ellipse.fill, 0, 255, rate);
      ellipse.x = mut(ellipse.x, 0, width, rate);
      ellipse.y = mut(ellipse.y, 0, height, rate);
      ellipse.w = mut(ellipse.w, 0, width/4, rate);
      ellipse.h = mut(ellipse.h, 0, height/4, rate);
    }
  }
  
  
  function mut(num, min, max, rate) {
    return constrain(randomGaussian(num, (rate * (max - min)) / 20), min, max);
  }
  
  