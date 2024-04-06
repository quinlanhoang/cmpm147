// project.js - Make a random compliment generator
// Author: Quinlan Hoang
// Date: 4/5/2024

// NOTE: This is how we might start a basic JavaaScript OOP project

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file

// define a class
class MyProjectClass {
  // constructor function
  constructor(param1, param2) {
    // set properties using 'this' keyword
    this.property1 = param1;
    this.property2 = param2;
  }
  
  // define a method
  myMethod() {
    // code to run when method is called
  }
}

function main() {
  // create an instance of the class
  const fillers = {
    person: ["indvidual", "specimen", "human-being", "god", "goddess", "spirit"],
    compliment: ["fine", "well-crafted", "handsome", "beautiful", "hot", "gorgeous", "good-looking", "mesmerizing", "stunning", "jaw-dropping"],
    greeting: ["Hello", "Greetings", "Good afternoon", "Good morning", "Good evening", "Pardon my interruption", "Salutations", "What's poppin", "What's up" ],
    presence: ["presence", "stature", "sweet aroma", "glistening figure"],
    desc: ["salvation", "endurance", "love", "youth", "wealth", "integrity", "prospect", "heart-felt memories", "divinity"],
    reaction: ["enjoy", "rellish", "admire", "appreciate", "love", "welcome", "remember", "like"],
    num: ["two", "a painstakinly large amount of", "thirty", "three hundred thousand and six hundred and forty nine"],
    adj: ["heart-felt", "divine", "fantastic", "amazing", "splendid", "enjoyable", "exquisite", "adventureful", "jam-packed", "stupendous" ],
    
  };
  
  const template = `$greeting my $compliment $person!!
  
  I was very aware of your $presence and couldn't help but come see you. I come bearing gifts of $desc that I'm sure you will $reaction!!
  Now I will be off on my way. I have a meeting to catch in $num minutes. I'm so glad I got meet you and have a $adj rest of your day!!
  `;
  
  
  // STUDENTS: You don't need to edit code below this line.
  
  const slotPattern = /\$(\w+)/;
  
  function replacer(match, name) {
    let options = fillers[name];
    if (options) {
      return options[Math.floor(Math.random() * options.length)];
    } else {
      return `<UNKNOWN:${name}>`;
    }
  }
  
  function generate() {
    let story = template;
    while (story.match(slotPattern)) {
      story = story.replace(slotPattern, replacer);
    }
  
    /* global box */
    $("#box").text(story);
  }
  
  /* global clicker */
  $("#clicker").click(generate);
  
  generate();
  
}

// let's get this party started - uncomment me
//main();