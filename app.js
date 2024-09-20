//new inits
let lastFocusedInput = null; // Variable to track the last focused input field
const canvas = document.getElementById('projectionCanvas');
let draggingSubstituent = null;
let offsetX = 0, offsetY = 0;
let substituents = {
    front: [
        { label: document.getElementById('front1').value, x: 0, y: 0, dragging: false, dragged: false, color: document.getElementById('f1color').value},
        { label: document.getElementById('front2').value, x: 0, y: 0, dragging: false, dragged: false, color: document.getElementById('f2color').value },
        { label: document.getElementById('front3').value, x: 0, y: 0, dragging: false, dragged: false, color: document.getElementById('f3color').value }
    ],
    back: [
        { label: document.getElementById('back1').value, x: 0, y: 0, dragging: false, dragged: false, color: document.getElementById('b1color').value },
        { label: document.getElementById('back2').value, x: 0, y: 0, dragging: false, dragged: false, color: document.getElementById('b2color').value },
        { label: document.getElementById('back3').value, x: 0, y: 0, dragging: false, dragged: false, color: document.getElementById('b3color').value }
    ]
};

//saw inits
const sawcanvas = document.getElementById('sawhorseCanvas');
const sawctx = sawcanvas.getContext('2d');

const carbonRadius = 20;
const bondLength = 60;
const angleOffset= Math.PI / 2; // 30 degrees for staggered view
const angleEclipsed = 60; // 0 degrees for eclipsed view

// Atom coordinates
const carbon1 = { x: 150, y: 100 };
const carbon2 = { x: 250, y: 200 };

const fontSize = '20px';

let eclipsed_offset = document.getElementById('eclipsed_offset').value;


let conformation = document.querySelector('input[name="conformation"]:checked').value;
let rotation = conformation === 'staggered' ? 60 : eclipsed_offset;
let rotated = conformation === 'staggered' ? 1 : 0;

const substituentOffset = 10;
function drawProjection() {
    const ctx = canvas.getContext('2d');
        
    substituents['front'][0].label = document.getElementById('front1').value;
    substituents['front'][1].label = document.getElementById('front2').value;
    substituents['front'][2].label = document.getElementById('front3').value;
    
    substituents['back'][0].label = document.getElementById('back1').value;
    substituents['back'][1].label = document.getElementById('back2').value;
    substituents['back'][2].label = document.getElementById('back3').value;

    
    eclipsed_offset = document.getElementById('eclipsed_offset').value;
    conformation = document.querySelector('input[name="conformation"]:checked').value;
     
    // Set rotation for staggered (60 degrees) or eclipsed (0 degrees)
    //rotation = conformation === 'staggered' ? 60 : eclipsed_offset;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set center of projection
    const centerX = 150;
    const centerY = 150;
    //const bondLength = 60;
  //const substituentOffset = 10; // Offset to position substituents closer to the end
     // Set font size
    const circleRadius = 40;

    // Draw back carbon circle with dashed line
    ctx.beginPath();
    ctx.arc(centerX, centerY, circleRadius, 0, 2 * Math.PI);
    //ctx.setLineDash([5, 5]); // Dashed circle
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash for other drawings

    // Draw back bonds and substituents
    drawBonds(ctx, centerX, centerY, bondLength, substituents, rotation, false, true, true, substituentOffset, fontSize, circleRadius, true, 'back');

    // Draw front bonds and substituents with solid lines
    drawBonds(ctx, centerX, centerY, bondLength, substituents, 0, true, false, false, substituentOffset, fontSize, circleRadius, false, 'front');
}

// Function to draw bonds and place substituents
function drawBonds(ctx, cx, cy, bondLength, substituents, rotation, isFront = false, isDashed = false, isBack = false, substituentOffset = 10, fontSize = '16px', circleRadius = 50, hideBehindCircle = false, positionKey = 'front') {
    // Define base angles for 120-degree separation
    const baseAngles = [0, 120, 240].map(angle => angle * Math.PI / 180);

    // Adjust angles based on whether they are front or back bonds
    const angles = isBack ? adjustBackAngles(rotation) : (isFront ? adjustFrontAngles() : baseAngles);

    // Set line style
    ctx.lineWidth = 3;
    ctx.font = `${fontSize} Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';


    for (let i = 0; i < 3; i++) {
        const angle = angles[i];
        const xEnd = cx + bondLength * Math.cos(angle);
        const yEnd = cy + bondLength * Math.sin(angle);

        if (hideBehindCircle && isBack) {
            // Draw only the portion of the bond outside the circle
            drawPartialBond(ctx, cx, cy, xEnd, yEnd, circleRadius);
        } else {
            // Draw the full bond if not hiding behind the circle
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(xEnd, yEnd);
            ctx.stroke();
        }
        
        // Update substituent positions if it's not being dragged
        if (!substituents[positionKey][i].dragging && !substituents[positionKey][i].dragged) {
            substituents[positionKey][i].x = cx + (bondLength + substituentOffset) * Math.cos(angle);
            substituents[positionKey][i].y = cy + (bondLength + substituentOffset) * Math.sin(angle);
        }
        
        ctx.fillStyle = substituents[positionKey][i].color; 
        
        ctx.textAlign = calcTextAlign(xEnd, yEnd, cx, cy);
        ctx.textBaseline = calcTextBaseLine(xEnd, yEnd, cx, cy);
        
        //if (i==0) {
             //ctx.fillText(substituents[positionKey][i].label, substituents[positionKey][i].x, substituents[positionKey][i].y);         
        //} else if (i==1) {
            //let fudge = 0;
            //if (positionKey == "back") {fudge = 4}
            //ctx.fillText(substituents[positionKey][i].label, substituents[positionKey][i].x, substituents[positionKey][i].y);    
        
        //} else if (i==2) {
            ctx.fillText(substituents[positionKey][i].label, substituents[positionKey][i].x + adjustment(xEnd,yEnd), substituents[positionKey][i].y); 
        
        
    }
}


function calcTextAlign(x,y, centX, centY) {
    //1st quad
    
    //console.log(x,y);
    
    if (Math.round(x) == centX && y > centY) {
        return 'left';
    }

    if (Math.round(x) == centX && y < centY) {
        return 'left';
    }

    if (x > centX && y > centY) {
        return 'left';
    }

    if (x > centX && y < centY) {
        return 'left';
    }
    
    if (x < centX && y < centY) {
        return 'right';
    }

    if (x < centX && y > centY) {
        return 'right';
    }
}

function calcTextBaseLine(x,y, centX, centY) {

    if (Math.round(x) == centX && y > centY) {
        return 'top';
    }

    if (Math.round(x) == centX && y < centY) {
        return 'bottom';
    }

    if (x > centX && y > centY) {
        return 'middle';
    }

    if (x > centX && y < centY) {
        return 'middle';
    }
    
    if (x < centX && y < centY) {
        return 'middle';
    }

    if (x < centX && y > centY) {
        return 'middle';
    }

}


function adjustment(x,y) {

    if (Math.round(x) == carbon1.x && y > carbon1.y) {
        console.log("top");
        return -7;
    }

    if (Math.round(x) == carbon1.x && y < carbon1.y) {
        console.log("bot");
        return -7;
    }

    return 0;

}


// Function to draw partial bond that is visible outside the circle
function drawPartialBond(ctx, cx, cy, xEnd, yEnd, circleRadius) {
    // Calculate intersection points with the circle
    const dx = xEnd - cx;
    const dy = yEnd - cy;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const t = circleRadius / distance;

    const xIntersect = cx + t * dx;
    const yIntersect = cy + t * dy;

    // Draw only the part of the bond that is outside the circle
    ctx.beginPath();
    ctx.moveTo(xIntersect, yIntersect);
    ctx.lineTo(xEnd, yEnd);
    ctx.stroke();
}

// Function to adjust angles for back bonds with rotation
function adjustBackAngles(rotation) {
    // Base angles for 120-degree separation
    const baseAngles = [0, 120, 240].map(angle => angle * Math.PI / 180);

    // Ensure back substituent 3 starts pointing straight down
    const baseAngle3 = -Math.PI / 2; // 90 degrees pointing down

    // Calculate angles for back substituents
    const angles = [
        baseAngle3,
        baseAngle3 + Math.PI * 2 / 3,  // 120 degrees from substituent 3
        baseAngle3 + Math.PI * 4 / 3   // 240 degrees from substituent 3
    ];

    // Rotate all back angles by the given rotation
    return angles.map(angle => angle + (rotation * Math.PI / 180));
}

// Function to adjust angles for front bonds with one vertical
function adjustFrontAngles() {
    // Set one bond vertical, others spaced 120 degrees
    const verticalAngle = -Math.PI / 2; // 90 degrees pointing up
    return [
        verticalAngle,
        verticalAngle + (2 * Math.PI / 3),
        verticalAngle + (4 * Math.PI / 3) // Ensuring the third bond is also correctly placed
    ];
}

function exportCroppedImage() {
    const ctx = canvas.getContext('2d');
    
    // Define the cropping region
    const cropX = 50; // X-coordinate of the cropping rectangle
    const cropY = 50; // Y-coordinate of the cropping rectangle
    const cropWidth = 300; // Width of the cropping rectangle
    const cropHeight = 300; // Height of the cropping rectangle

    // Create a temporary canvas to hold the cropped image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = cropWidth;
    tempCanvas.height = cropHeight;
    const tempCtx = tempCanvas.getContext('2d');

    // Draw the cropped region onto the temporary canvas
    tempCtx.drawImage(canvas, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

    // Convert the temporary canvas to an image
    const dataURL = tempCanvas.toDataURL('image/png');

    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'newman_projection.png';
    link.click();
}



document.addEventListener('DOMContentLoaded', () => {
    // Get all input fields
    const inputFields = document.querySelectorAll('input[type="text"]');
    //const conformation = document.getElementById('conformation');
    conformation = document.querySelector('input[name="conformation"]:checked').value;

    const confinputs = document.querySelectorAll('input[name="conformation"]');
 

    const colors = document.querySelectorAll('.color-input');
    const eclipsed_input = document.getElementById('eclipsed_offset');

    confinputs.forEach(function(input) {
        input.addEventListener('change', () => {
        
            console.log("Change");
            conformation = document.querySelector('input[name="conformation"]:checked').value;
            console.log(conformation);
	    rotation = conformation === 'staggered' ? 60 : eclipsed_offset;
	    //console.log(rotation);
	    rotated = conformation === 'staggered' ? 1 : 0;
	    //rotated=1;
            //drawProjection();
        
        
            console.log("Change");
            drawProjection();
            drawSawhorseProjection(carbon1, carbon2);
        });
    });

    colors.forEach(function(input) {
        let hueb = new Huebee(input, {
            saturations: 1,
            setBGColor: true,
            setText: true,
            inputId: input.id,
            shades: 3,
            hues: 1
        });
        
        hueb.on( 'change', function(color, hue, sat, lum ) {
            
            let labelid = document.getElementById(hueb.anchor.id).previousSibling.id;
            
            let subid = labelid.slice(-1);
                        
            if (labelid.substring(0, 1) == "f") {
            
            substituents['front'][subid -1].color = color;
            
            } else {
            substituents['back'][subid -1].color = color;
            
            }
            drawProjection();
            drawSawhorseProjection(carbon1, carbon2);
            
            hueb.close();
        })
        
        
    });
    
    eclipsed_input.addEventListener('change', () => {
	    if (conformation == "eclipsed") {
		    eclipsed_offset = Number(document.getElementById('eclipsed_offset').value);
		    rotation = eclipsed_offset;
		    console.log(rotation);
		    drawProjection();
            }
    });

    // Track which input field was last focused
    inputFields.forEach(input => {
        input.addEventListener('focus', () => {
            lastFocusedInput = input;
        });
    });
    
    // Track which input field was last focused
    inputFields.forEach(input => {
        input.addEventListener('input', (e) => {
        if (Number.isInteger(parseInt(e.data))) {
            const position = e.target.selectionStart - 1; // Subtract 1 to get the position of the last character added

            const subscripts = ["\u2080", "\u2081", "\u2082", "\u2083", "\u2084", "\u2085", "\u2086", "\u2087", "\u2088", "\u2089"];
            let str = document.getElementById(e.target.id).value;
            let newStr = str.substring(0, position) + subscripts[e.data] + str.substring(position + 1);
            
            document.getElementById(e.target.id).value = newStr;  
        
        }
        
        drawProjection();
        drawSawhorseProjection(carbon1, carbon2);

        });
    });

});



// Add mouse event listeners for dragging functionality
canvas.addEventListener('mousedown', (e) => {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    // Check if any substituent was clicked
    draggingSubstituent = getClickedSubstituent(mouseX, mouseY);
    if (draggingSubstituent) {
        offsetX = mouseX - draggingSubstituent.x;
        offsetY = mouseY - draggingSubstituent.y;
        draggingSubstituent.dragging = true;
        draggingSubstituent.dragged = true;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (draggingSubstituent && draggingSubstituent.dragging) {
        const mouseX = e.offsetX;
        const mouseY = e.offsetY;
        draggingSubstituent.x = mouseX - offsetX;
        draggingSubstituent.y = mouseY - offsetY;

        // Redraw canvas with updated positions
        drawProjection();
    }
});

canvas.addEventListener('mouseup', () => {
    if (draggingSubstituent) {
        draggingSubstituent.dragging = false;
        draggingSubstituent = null;
    }
});


// Function to detect clicked substituent
function getClickedSubstituent(x, y) {
    const ctx = canvas.getContext('2d');
    for (const positionKey in substituents) {
        let i=0;
        for (const sub of substituents[positionKey]) {
            const width = ctx.measureText(sub.label).width;
            const height = 16; // Font size
            if (x >= sub.x - width / 2 && x <= sub.x + width / 2 &&
                y >= sub.y - height / 2 && y <= sub.y + height / 2) {
                sub.positionKey = positionKey;
                sub.index = i;
                return sub;
            }
            i=i+1;
        }
    }
    return null;
}

// Function to insert character into the last focused input field
function insertIntoLastFocusedInput(char) {
    // Check if an input field was focused
    if (lastFocusedInput) {
        // Insert the character at the current cursor position in the focused input
        const cursorPosition = lastFocusedInput.selectionStart;
        const currentValue = lastFocusedInput.value;
        
        // Insert the character at the cursor position
        lastFocusedInput.value = currentValue.slice(0, cursorPosition) + char + currentValue.slice(cursorPosition);

        // Move the cursor to the end of the inserted character
        lastFocusedInput.setSelectionRange(cursorPosition + 1, cursorPosition + 1);

        // Focus back on the input after insertion
        lastFocusedInput.focus();
    } else {
        alert('Please click on an input field before selecting a subscript.');
    }
}

//sawhorse functions


function drawCarbon(x, y) {
    // Draw carbon atoms as circles
    sawctx.beginPath();
    sawctx.arc(x, y, carbonRadius, 0, 2 * Math.PI);
    sawctx.fillStyle = '#333';
    sawctx.fill();
    sawctx.lineWidth = 2;
    sawctx.strokeStyle = '#000';
    sawctx.stroke();
}


function drawHydrogenLabels(cx, cy, substituents, positionKey, isBack) {

    console.log("Draw H labels");

    conformation = document.querySelector('input[name="conformation"]:checked').value;
     
    // Set rotation for staggered (60 degrees) or eclipsed (0 degrees)
    //rotation = conformation === 'staggered' ? 60 : eclipsed_offset;
    const baseAngles = [0, 120, 240].map(angle => angle * Math.PI / 180);
    // Adjust angles based on whether they are front or back bonds
    
    const angles = isBack ? adjustBackAngles(rotation) : (!isBack ? adjustFrontAngles() : baseAngles);
    
    sawctx.lineWidth = 3;
    sawctx.font = `${fontSize} Arial`;
    
    
    if (isBack) {
    
    sawctx.lineWidth = 1;
    
    }

    for (let i = 0; i < 3; i++) {
    
        if (i==0 || i==1) {sawctx.textAlign = 'left'; sawctx.textBaseline = 'middle'};
        if (i==2) {sawctx.textAlign = 'right'; sawctx.textBaseline = 'middle'};
        
        if (isBack) {
        
        sawctx.textAlign = calcTextAlign(cx,cy, carbon1.x, carbon1.y); sawctx.textBaseline = calcTextBaseLine(cx, cy, carbon1.x, carbon1.y);

        }
        
        
        

        const angle = angles[i];
        const xEnd = cx + bondLength * Math.cos(angle);
        const yEnd = cy + bondLength * Math.sin(angle);

        console.log(xEnd, yEnd);

        // Draw the full bond if not hiding behind the circle
        sawctx.beginPath();
        sawctx.moveTo(cx, cy);
        sawctx.lineTo(xEnd, yEnd);
        sawctx.stroke();

        substituentOffsetsaw = 10;
        
        sawctx.fillStyle = substituents[positionKey][i].color;
        
        if (i==1 || i==0) {
        sawctx.fillText(substituents[positionKey][i].label, -7 + cx + (bondLength + substituentOffsetsaw) * Math.cos(angle), cy + (bondLength + substituentOffsetsaw) * Math.sin(angle));
        
        } else {
        
        sawctx.fillText(substituents[positionKey][i].label, 7+cx + (bondLength + substituentOffsetsaw) * Math.cos(angle), cy + (bondLength + substituentOffsetsaw) * Math.sin(angle));
        
        }
        
    }
}


function drawBondSaw(x1, y1, x2, y2, dashed = false) {
    sawctx.beginPath();
    sawctx.moveTo(x1, y1);
    sawctx.lineTo(x2, y2);
    sawctx.lineWidth = 2;
    sawctx.strokeStyle = '#000';
    if (dashed) {
        sawctx.setLineDash([5, 5]);
    } else {
        sawctx.setLineDash([]);
    }
    sawctx.stroke();
}


// Function to detect clicked substituent
function rotate120() {

        rotated = rotated + 1;
        conformation = document.querySelector('input[name="conformation"]:checked').value;
	
	function isEven(n) {
   		return n % 2 == 0;
	}
	
	if (conformation == 'staggered') {
	
		rotation = rotated*60;
		if (isEven(rotation/60)) {
			rotation = rotated*60 + eclipsed_offset;
		}
	} else {
	
                rotation = rotated*60;
		if (isEven(rotation/60)) {
			rotation = rotated*60+eclipsed_offset;
		} else {
		        rotation = rotated*60;
		}
	        	
	}

	drawProjection();
	drawSawhorseProjection(carbon1, carbon2);

}



function drawSawhorseProjection(c1, c2) {
    console.log("draw saw");
    const sawctx = sawcanvas.getContext('2d');
    
    // Clear canvas
    sawctx.clearRect(0, 0, sawcanvas.width, sawcanvas.height);
    
    
    //drawCarbon(c1.x, c1.y);
    //drawCarbon(c2.x, c2.y);
    conformation = document.querySelector('input[name="conformation"]:checked').value;
    // Set angles for staggered or eclipsed
    const angle = conformation === 'staggered' ? angleOffset : angleEclipsed;
    
    console.log(angle);
    
    drawBondSaw(c1.x, c1.y, c2.x, c2.y);

    drawHydrogenLabels(c2.x, c2.y, substituents, 'front', false);

    
    drawHydrogenLabels(c1.x, c1.y, substituents, 'back', true);


}


// Initialize with default drawing
drawProjection();
drawSawhorseProjection(carbon1, carbon2);

