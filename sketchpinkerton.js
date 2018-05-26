let mybubble;
let shp;
let legendshp;
let circle;
let stars;
let time;
let speedoftime;
let goal;
let startingframes;
let frameadjust;

// let shipdata = [{ship:"1", 
//                 journey: [{start:[164, 260], destination:[370, 545], departure:1758, arrival:1759}]
//                }, {ship:"2", 
//                journey: [{start:[164, 260], destination:[370, 545], departure:1759, arrival:1760}]
//               }]

let ships = [];
let shipdata = [];
let data;

function preload(){
  shp = loadImage("ship.png");
  legendshp = loadImage("legendship.png");
  stars = loadImage("geopinkerton1810.jpg");
  circle = loadImage("circle.png");

  // Load data from a TSV file
  data = loadTable("datapinkerton.tsv","tsv","header")
  
  
}




function setup(){
  createCanvas(1276,916);
  for (i = 0; i < data.getRowCount(); i++){
    // get the data from table
    ship_id = data.getNum(i,0)
    leg_data = data.getNum(i,1)
    departure_data = data.getNum(i,2)
    arrival_data = data.getNum(i,3)
    originx_data = data.getNum(i,4)
    originy_data = data.getNum(i,5)
    destinationx_data = data.getNum(i,6)
    destinationy_data = data.getNum(i,7)
    // Create new ship object if first leg
    // Otherwise get old object and add to it
    if (leg_data == 1) {
      current_ship = {ship:ship_id}
      current_ship.journey = [{start:[originx_data, originy_data], destination:[destinationx_data,destinationy_data],departure:departure_data,arrival:arrival_data}]
      shipdata.push(current_ship)
    } else if (leg_data > 1) {
      current_ship = shipdata[ship_id]
      current_ship.journey.push({start:[originx_data, originy_data], destination:[destinationx_data,destinationy_data],departure:departure_data,arrival:arrival_data})
    } 
  }
  // Create Ship objects for each ship journey
  for (i = 0; i < shipdata.length; i++){
    current_ship = shipdata[i]
    ships.push(new Ship(current_ship.journey[0].start[0],current_ship.journey[0].start[1], shp, current_ship))
  }

  // Set values for data, and display the background image
  image(stars, 0, 0);
  time = 1794;
  startingframes = time * 180;
  speedoftime = 1;
  goal = 0;
  frameadjust = -20;

}

function draw(){
  // Draw background
  imageMode(CORNER);
  image(stars, 0, 0);
  
  textSize(30);
  fill(0,0,255);
  text(time,170,40);
  
  fill(255,255,255);
  rect(400,0,690,50);
  rect(0,650,200,266);
  rect(876,856,400,60);
  fill(255,30,255);
  ellipse(774,416,20,20);
  ellipse(398,370,20,20);
  ellipse(304,314,20,20);
  ellipse(50,795,20,20);
  fill(0,0,255);
  textSize(20);
  text("Surinam",740,460);
  text("Berbice",350,410);
  text("Demerara",280,350);
  fill(0,0,0);
  text("Individual slave transports to Berbice, Demerara and Surinam, 1794-1825",420,35);
  text("Legend",60,675);
  image(legendshp,20,685);
  image(circle,15,850);
  textSize(15);
  text("Ship",100,715);
  text("Slave port",100,780);
  text("Alleged Maroon loc.,100,880);
  textSize(10);
  text("Source: Slave Voyages Database, http://www.slavevoyages.org/, (26-05-2018).",906,876);
  text("Map: David Rumsey Map Collection, John Pinkerton, The Caracas, 1810.", 906,896);
  
  
  // Update each ship
  for (i = 0; i < ships.length; i++){
    current_ship = ships[i]

    // Check if ship is in transit
    goal = current_ship.intransit(time);

    // If ship is in transit, move according to which leg of the journey it is on
    if (goal[0]){
      current_ship.move(current_ship.data.journey[goal[1]].destination[0], current_ship.data.journey[goal[1]].destination[1], current_ship.data.journey[goal[1]].arrival);
    } 
    // Draw ship
    current_ship.display();
  }
  // Check if time should move forward
  time = timeflow(time, speedoftime);
}


// Move time function. This sets the interval for the time variable to move forward:
// By default, this is set per 60 frames (so time = 1 is one second)
function timeflow(time, timespeed){
  if (frameCount % (timespeed * 180) == 0){
    return time += 1;
  } else {
    return time
  }
}

class Ship {
  // Constructor for ship
  constructor(x, y, icon, data) {
    this.pos = createVector(x, y);
    this.c = color(255);
    this.icon = icon;
    this.data = data;
    this.speed = 1;
    this.frameadjust = 0;
  }

  // Check if the ship should be in transit
  intransit(time){
    let it = false;
    let i = 0;

    // Go through each leg and check if we are currently during that leg
    for (i = 0; i < this.data.journey.length; i++) {
      let dep = this.data.journey[i].departure
      let arv = this.data.journey[i].arrival

      // If departure and arrival are on the same time interval,
      // make object arrive earlier than if on next interval
      if (dep == arv) {
        arv = arv + 1
        this.frameadjust = frameadjust
      } else {
        this.frameadjust = 0
      }

      if (time >= dep && time < arv) {
        it = true;
        break
      }
    }

    // Return true if the journey should be happening, and which journey it is
    return [it, i];
  }
  
  move(x, y, arrival) {
    if (this.frameadjust == frameadjust){
      arrival += 1
    }

    // Calculate information (arrival frame, goal, direction, and distance)
    let arrivalframe = (arrival * 180 * speedoftime) + this.frameadjust;
    let destination = createVector(x, y);
    let dir = p5.Vector.sub(destination, this.pos);
    let distance = dir.mag();

    // If the item is not already at the distance, check how many frames the object
    // has to arrive. Set the step interval to the distance divided by remainig frames
    if (distance > 0){
      let remainingframes = arrivalframe - (frameCount+startingframes);
      let stepdist = dir.normalize().mult(distance/remainingframes)
      this.pos = this.pos.add(stepdist);
    }
  };

  // Display the object
  display () {
      imageMode(CENTER);
      image(this.icon, this.pos.x, this.pos.y, shp.width / 4, shp.height / 4);  
  };
}
