let canvasWidth = 400;
let canvasHeight = 400;

class Motor {

    constructor(x,y,armLength,radius,rate) {

        this.x = x;
        this.y = y;
        this.radius = radius;
        this.armX = 0;
        this.armY = 0;
        this.rate = rate;
        this.angle = 0;
        this.armLength = armLength;
	
    }

    getArmPosition() {
        return [this.armX, this.armY];

    }

    updateArmPosition() {
        this.armX = this.x + this.radius * cos(radians(this.angle));
        this.armY = this.y + this.radius * sin(radians(this.angle));
        this.angle += this.rate;

    }

    setPosition(x,y) {

        this.x = x;
        this.y = y;

    }

    getPosition() {

        return [this.x, this.y];

    }

    getArmLength() {

        return this.armLength;

    }

    getPerpendicularPoints(dist) {

        return calculatePerpendicularPoints(this.x, this.y, this.radius, this.angle, dist);
    }

    draw() {

        noFill();
        circle(this.x, this.y, this.radius*2);
        fill("black");
        circle(this.armX, this.armY, 3);

    }
}

class Machine {

    constructor(motor1, motor2, motor3, dist) {

        this.motor1 = motor1;
        this.motor2 = motor2;
        this.motor3 = motor3;
        this.armIntersectX = 0;
        this.armIntersectY = 0;
	[this.armIntersectX, this.armIntersectY] = this.getArmConnectionPosition();
        this.dist = dist;
	this.pixelColors = [];
	this.prevPixelColors = [];

    }

    getArmConnectionPosition() {

        let [x1, y1] = this.motor1.getArmPosition();
        let [x2, y2] = this.motor2.getArmPosition();
        let armLength1 = this.motor1.getArmLength();
        let armLength2 = this.motor2.getArmLength();
	
        return getCircleIntersections(x1, y1, armLength1, x2, y2, armLength2);

    }


    getPenPosition() {

        let [x2, y2] = this.motor2.getArmPosition();
        let vec =  [this.armIntersectX - x2, this.armIntersectY - y2];
        let newVec = [vec[0] * 1.5, vec[1] * 1.5];
        newVec = [x2 + newVec[0], y2 + newVec[1]];
        return newVec;

    }

    update() {
	
        let newPos = this.motor3.getPerpendicularPoints(this.dist);
        this.motor1.updateArmPosition();
        this.motor1.setPosition(newPos[0], newPos[1]);
        this.motor2.updateArmPosition();
        this.motor2.setPosition(newPos[2], newPos[3]);
        [this.armIntersectX, this.armIntersectY] = this.getArmConnectionPosition();
        this.motor3.updateArmPosition();

    }

    draw() {
	// save pixels
    	for (let i = 0; i < this.prevPixelColors.length; i++) {
	    let c = color("red")
	    set(this.prevPixelColors[i][0],this.prevPixelColors[i][1], this.prevPixelColors[i][2])
	}
	updatePixels()

	
        let [x1, y1] = this.motor1.getArmPosition();
        let [x2, y2] = this.motor2.getArmPosition();

	// extend arm with pen
        let vec =  [this.armIntersectX - x2, this.armIntersectY - y2];
        let newVec = [vec[0] * 1.5, vec[1] * 1.5];
	fill(291, 67, 62, 0.2);
	let penPos = this.getPenPosition();

	
	noStroke()
	circle(penPos[0],penPos[1], 1.2);
	stroke("black")
	
	let arm1Pixels = bresenhams(x1,y1,this.armIntersectX,this.armIntersectY,2)
	let arm2Pixels = bresenhams(x2,y2,this.armIntersectX,this.armIntersectY,2)
	let armPenPixels = bresenhams(x2 + newVec[0], y2 + newVec[1], this.armIntersectX, this.armIntersectY,2)

	this.pixelColors = []

	// restore pixels
	for (let i = 0; i < arm1Pixels.length;i++) {
	    
	    this.pixelColors.push([arm1Pixels[i][0],arm1Pixels[i][1],get(arm1Pixels[i][0],arm1Pixels[i][1])])
	}
	for (let i = 0; i < arm2Pixels.length;i++) {
	    this.pixelColors.push([arm2Pixels[i][0],arm2Pixels[i][1],get(arm2Pixels[i][0],arm2Pixels[i][1])])
	}
	for (let i = 0; i < armPenPixels.length;i++) {
	    this.pixelColors.push([armPenPixels[i][0],armPenPixels[i][1],get(armPenPixels[i][0],armPenPixels[i][1])])
	}


	this.prevPixelColors = this.pixelColors

	// draw
	line(x2 + newVec[0], y2 + newVec[1], this.armIntersectX, this.armIntersectY);
        line(x1, y1, this.armIntersectX, this.armIntersectY);
        line(x2, y2, this.armIntersectX, this.armIntersectY);
	this.motor1.draw();
        this.motor2.draw();
        this.motor3.draw();

	
    }

}

let p = [];

let numIterations = 375000;
let armLength1 = 75;
let armLength2 = 85;
let outerRadius = 150;
let machineCenterX = canvasWidth / 2;
let machineCenterY = canvasHeight / 2;
let motorDistance = 30;

let radius = 20;
let rate1 = 1.004;
let rate2 = 1.009;
let rate3 = .001;



let drawMachine = false;

const motor1 = new Motor(0, 0, armLength1, radius, rate1);
const motor2 = new Motor(0, 0, armLength2, radius, rate2);
const motor3 = new Motor(machineCenterX, machineCenterY, 0, outerRadius, rate3);
const machine = new Machine(motor1, motor2, motor3, motorDistance);



function setup() {
    
    createCanvas(canvasWidth, canvasHeight);
    colorMode(HSB);
 
    machine.update();
        machine.update();
    frameRate(60)

     for (let i = 0; i < numIterations; i++) {
	    
            stroke("black");
            let newVec = machine.getPenPosition();
            p.push(newVec);

            noStroke();
            fill(291, 67, 62, 0.2);
            machine.update();

        }

}
let count = 0
let i = 0
let z = 1024
function draw() {
   
count++
  
 
    for (let j = 0; j < z; j++) {

	if (i > p.length / 2) {
	    
            fill(17, 82, 86, 0.2);
		
            }
	circle(p[i+j][0], p[i+j][1], 1.2);
    }
	i+=z;

	

    
}

function euclideanDistance(x1, y1, x2, y2)  {

    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    
}


function getCircleIntersections(x1,y1,r1,x2,y2,r2) {
    
    // calculate the intersecting points between two circles
    let d = euclideanDistance(x1,y1,x2,y2)
    let a = (r1**2 - r2**2 + d**2) / (2*d)
    let h = Math.sqrt(r1**2 - a**2)
    let x3 = x1 + ((a/d) * (x2 -  x1))
    let y3 = y1 + ((a/d) * (y2 -  y1))
    let x4 = x3 + ((h/d) * (y2 -  y1))
    let y4 = y3 - ((h/d) * (x2 -  x1))
    let x5 = x3 - ((h/d) * (y2 -  y1))
    let y5 = y3 + ((h/d) * (x2 -  x1))
    return [x4,y4, x5,y5]
    
}

function calculatePerpendicularPoints(centerX, centerY, radius, degree,dist) {
    
  let angleRad = radians(degree); 
 
  // Calculate the coordinates of the point on the circle's circumference
  let pointX = centerX + radius * cos(angleRad);
  let pointY = centerY + radius * sin(angleRad);
  
  // Calculate the perpendicular angle
  let perpendicularAngle = angleRad + HALF_PI;
  
  // Calculate the coordinates of the perpendicular point
  let perpendicularX = pointX + dist * cos(perpendicularAngle);
  let perpendicularY = pointY + dist * sin(perpendicularAngle);
  let perpendicularX2 = pointX - dist * cos(perpendicularAngle);
  let perpendicularY2 = pointY - dist * sin(perpendicularAngle);

  return [perpendicularX, perpendicularY,perpendicularX2, perpendicularY2]

}

function bresenhams(x0, y0, x1, y1, lineWidth) {
    let pixels = [];
    x0 = Math.floor(x0)
    y0 = Math.floor(y0)
    x1 = Math.floor(x1)
        y1 = Math.floor(y1)
  let dx = Math.abs(x1 - x0);
  let dy = -Math.abs(y1 - y0);
  let sx = x0 < x1 ? 1 : -1;
  let sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let e2;
  let x = x0;
  let y = y0;

  // Adjust for line width (Assuming odd line width for centered line)
  let halfWidth = Math.floor(lineWidth / 2);
  let xOffset = (lineWidth % 2 === 0) ? 0.5 : 0;
  let yOffset = (lineWidth % 2 === 0) ? 0.5 : 0;
    while (true) {

	
	for (let i = -halfWidth; i <= halfWidth; i++) {
	    for (let j = -halfWidth; j <= halfWidth; j++) {
		pixels.push([x + i + xOffset, y + j + yOffset]);
	    }
	}
	
	if (x === x1 && y === y1) break;
	e2 = 2 * err;
	if (e2 >= dy) {
	    if (x0===x1) {
		break
	    }
	    
	    err += dy;
	    x += sx;
	}
	if (e2 <= dx) {
	    if (y0===y1) {
		break
	    }
	    err += dx;
	    y += sy;
	}
    }
    return pixels;
}
