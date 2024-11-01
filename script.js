const svgNS = "http://www.w3.org/2000/svg";
const renderParams = {
    'borderGap': 10,
    'backgroundColor': '#ACA298'
}
const animate = true;

let midiEnabled = false
let isMIDIInitialized = false; // Flag to track whether MIDI is initialized
let midiOutputs = []; // Store all available MIDI output devices by index
// const deviceMap = [12, 0, 3, 4, 9, 11]
const deviceMap = [12, 0, 4, 3, 11, 3, 4]
const aMajorPentatonic = [
  21, 23, 25, 28, 30,  // A0
  33, 35, 37, 40, 42,  // A1
  45, 47, 49, 52, 54,  // A2
  57, 59, 61, 64, 66,  // A3
  69, 71, 73, 76, 78,  // A4 (Middle A)
  81, 83, 85, 88, 90,  // A5
  93, 95, 97, 100, 102,  // A6
  105, 107, 109, 112, 114,  // A7
  117, 119, 121, 124, 126  // A8
]

//let BOX_SEQUENCE = [0, 1, 2, 3, 4, 5, 6]

let BOX_SEQUENCE = JSON.parse(localStorage.getItem('BOX_SEQUENCE'));
if (!BOX_SEQUENCE) {
  BOX_SEQUENCE = [0, 1, 2, 3, 4, 5, 6];
}

console.log(BOX_SEQUENCE)

const configs = [
    {
        countx: 8,
        county: 3,
        widths: [275, 200, 150],
        heights: [300, 400, 350],
        xoffset: 75,
        yoffset: 75,
        gap: 10,
        scalingFactors: [1, 1, 1, 1, 1, 1, 1, 1, 1],
        maxHeight: 1100,
        maxWidth: 1905
    },
    {
        countx: 8,
        county: 3,
        widths: [275, 200, 150],
        heights: [300, 400, 350],
        xoffset: 75,
        yoffset: 75,
        gap: 10,
        scalingFactors: [1, 1, 1, 1, 1, 1, 1, 1, 1],
        maxHeight: 1100,
        maxWidth: 1905,
        // geometry: [{"boxId":"box0","corners":[458,167,565,494,400,522,410,582]},{"boxId":"box1","corners":[461,162,560,75,572,494,701,463]},{"boxId":"box2","corners":[570,75,709,91,713,460,794,401]},{"boxId":"box3","corners":[718,90,980,75,804,400,980,375]},{"boxId":"box4","corners":[990,75,1052,155,990,375,1090,411]},{"boxId":"box5","corners":[1061,154,1214,159,1098,410,1325,389]},{"boxId":"box6","corners":[1219,158,1423,212,1333,391,1412,442]},{"boxId":"box7","corners":[410,588,558,504,206,802,350,785]},{"boxId":"box8","corners":[562,506,704,467,360,785,605,782]},{"boxId":"box9","corners":[711,468,798,405,608,783,720,785]},{"boxId":"box10","corners":[808,406,980,385,730,785,980,785]},{"boxId":"box11","corners":[990,385,1091,415,990,785,1094,758]},{"boxId":"box12","corners":[1096,417,1324,393,1099,758,1246,767]},{"boxId":"box13","corners":[1330,396,1411,446,1252,769,1486,777]},{"boxId":"box14","corners":[201,809,350,795,219,1071,350,1100]},{"boxId":"box15","corners":[360,791,602,788,360,1100,598,1071]},{"boxId":"box16","corners":[606,788,724,790,603,1069,745,1006]},{"boxId":"box17","corners":[732,789,980,790,752,1006,962,1002]},{"boxId":"box18","corners":[990,795,1094,764,967,1047,1054,986]},{"boxId":"box19","corners":[1101,765,1242,771,1061,986,1215,1002]},{"boxId":"box20","corners":[1250,773,1486,777,1221,1003,1379,993]},{"boxId":"box21","corners":[1492,771,1663,759,1382,995,1479.710144927536,1100]},{"boxId":"box22","corners":[1414,445,1584,430,1488,769,1664,755]},{"boxId":"box23","corners":[1663,763,1724,823,1483,1105,1683,1056]}]
    },
    {
        countx: 6,
        county: 3,
        widths: [400, 600, 200, 200],
        heights: [300, 400, 350],
        xoffset: 75,
        yoffset: 75,
        gap: 10,
        scalingFactors: [1, 1.5, 1, 1, 1, 1, 1.5, 1, 1],
        maxHeight: 1100,
        maxWidth: 1905
    },
    {
        countx: 6,
        county: 3,
        widths: [0.5,0.75,0.63,1,0.37],
        heights: [300, 400, 350],
        xoffset: 75,
        yoffset: 75,
        gap: 10,
        scalingFactors: [1, 1.5, 1, 1.3, 1, 1.7, 1.5, 1, 1],
        maxHeight: 1100,
        maxWidth: 1905
    }, 
    {
        countx: 10,
        county: 5,
        widths: [0.3, 0.25, 0.25, 0.75],
        heights: [200, 200, 150],
        xoffset: 75,
        yoffset: 75,
        gap: 10,
        scalingFactors: [1, 1, 1, 1, 1.5, 1.5, 1, 1],
        maxHeight: 1100,
        maxWidth: 1905

    }

]

function calculateWidths(config) {
    const {
        countx,        // Number of segments
        widths,        // Proportions for widths
        maxWidth,      // Total available width
        gap            // Gap between segments
    } = config;

    let totalProportions = 0;

    // Calculate total proportions (sum of all width ratios)
    for (let i = 0; i < countx; i++) {
        totalProportions += widths[i % widths.length];
    }

    // Calculate the total space available for the segments after accounting for gaps
    const totalGaps = gap * (countx - 1);
    const availableWidth = maxWidth - totalGaps;

    // Calculate individual widths based on proportions
    const segmentWidths = [];
    for (let i = 0; i < countx; i++) {
        const proportion = widths[i % widths.length]; // Use modulo to rotate widths
        const segmentWidth = (proportion / totalProportions) * availableWidth;
        segmentWidths.push(segmentWidth);
    }
    return segmentWidths;
}

const config = configs[Math.floor(Math.random()*configs.length)]
// const config = configs[0]
const rectangles = getRectangles(config.countx, config.county, calculateWidths(config), config.heights, 
                                 config.xoffset, config.yoffset, config.gap, config.scalingFactors, config.maxHeight);


const toggleBorders = document.getElementById('toggleBorders');

let globalMatrix = generateRandomMatrix(1000, 1000, 20);
setInterval(() => {
    globalMatrix = shiftMatrixDown(globalMatrix);
}, 250); 

const socket = io('http://localhost:8080');

socket.on('sync', (data) => {
  if (data && data.word) {
    // console.log(data.coord)
    BOX_SEQUENCE.push(...[data.coord.start.x, data.coord.start.y, data.coord.end.x, data.coord.end.y]);
    // BOX_SEQUENCE = [data.coord.start.x, data.coord.start.y, data.coord.end.x, data.coord.end.y]
    localStorage.setItem('BOX_SEQUENCE', JSON.stringify(BOX_SEQUENCE.slice(-8)));
    location.reload();  // Reloads the current page

    // console.log(getRectangleOrderFromCoordinates(data, configs[0]))

    setBackgroundToColor(findClosestRectangle(rectangles, data.points[0]).closestRectangle.boxId + "-background", '#fff')
    setBackgroundToColor(findClosestRectangle(rectangles, data.points[1]).closestRectangle.boxId + "-background", "#fff")
    // setBackgroundToColor(findClosestRectangle(rectangles, data.points[0]).closestRectangle.boxId + "-background", data.color)
    // setBackgroundToColor(findClosestRectangle(rectangles, data.points[1]).closestRectangle.boxId + "-background", data.color)

  }
});

function setBackgroundToColor(id, color='#C0C0C0') {
    const element = document.getElementById(id);
    if (element) {
        // Check if the element is an SVG 'rect' element
        if (element.tagName.toLowerCase() === 'rect') {
            element.setAttribute('fill', color);  // Set the 'fill' attribute to the desired color
            // element.setAttribute('stroke', color); // Set the 'stroke' attribute to give it a border
            element.setAttribute('stroke-width', '10'); // Set the border width
        } else {
            console.log(`Element with id "${id}" is not an SVG 'rect' element.`);
        }
    } else {
        console.log(`Element with id "${id}" not found.`);
    }
}

// Function to initialize MIDI access and store all available MIDI output devices
function initMIDI() {
  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then(
      function (midiAccess) {
        midiAccess.outputs.forEach((output) => {
          midiOutputs.push(output); // Store each output device in the array
        });

        if (midiOutputs.length === 0) {
          console.error('No MIDI output devices found.');
        } else {
          isMIDIInitialized = true; // Set flag to true once MIDI devices are initialized
          //console.log('MIDI output devices initialized:', midiOutputs);
          midiOutputs.forEach((output, index) => {
            console.log(`Device ${index}:`, output.name);
          });
        }
      },
      function () {
        console.error('Failed to get MIDI access.');
      }
    );
  } else {
    console.error('WebMIDI is not supported in this browser.');
  }
}

// Function to play a MIDI note on a specific device and channel by index
function playMIDINote(noteNumber, velocity = 127, duration = 1000, deviceIndex = 0, dot, midiChannel = 0) {
  if (!isMIDIInitialized) {
    // console.error('MIDI devices are not yet initialized. Please wait for initialization.');
    return;
  }

  if (deviceIndex >= 0 && deviceIndex < midiOutputs.length) {
    let midiOutput = midiOutputs[deviceIndex];

    // Ensure the MIDI channel is between 0 and 15
    midiChannel = midiChannel < 0 ? 0 : (midiChannel > 15 ? 15 : midiChannel);

    // "Note On" and "Note Off" messages with the specified channel (0x90 is for channel 1, etc.)
    let noteOnMessage = [0x90 + midiChannel, noteNumber, velocity];
    let noteOffMessage = [0x80 + midiChannel, noteNumber, 0];

    // Send a "Note On" message
    midiOutput.send(noteOnMessage);

    // Send a "Note Off" message after the specified duration
    setTimeout(() => {
      midiOutput.send(noteOffMessage);
      if (dot) {
        dot.setAttribute('fill', palette.dotoff);
      }
    }, duration);

  } else {
    console.error('Invalid MIDI output device index.');
  }
}


function findClosestRectangle(rectangles, point, fieldWidth=800, fieldHeight=400, rectangleWidth=1800, rectangleHeight=1200) {
    let minDistance = Infinity;
    let closestRectangle = null;

    rectangles.forEach(rectangle => {
        const { corners } = rectangle;

        // Calculate the center of the rectangle
        let centerX = 0;
        let centerY = 0;

        // Sum up the x and y coordinates of the four corners
        for (let i = 0; i < 8; i += 2) {
            centerX += corners[i];
            centerY += corners[i + 1];
        }

        // Divide by 4 to get the average, i.e., the center of the rectangle
        centerX /= 4;
        centerY /= 4;

        // Scale the rectangle's center coordinates to percentages of rectangle dimensions
        let scaledCenterX = centerX / rectangleWidth;
        let scaledCenterY = centerY / rectangleHeight;

        // Scale the point's coordinates to percentages of field dimensions
        let scaledPointX = point.x / fieldWidth;
        let scaledPointY = point.y / fieldHeight;

        // Calculate the distance between the scaled point and scaled rectangle center
        let dx = scaledPointX - scaledCenterX;
        let dy = scaledPointY - scaledCenterY;
        let distance = Math.sqrt(dx * dx + dy * dy);

        // If the current rectangle's distance is less than the minimum distance, update it
        if (distance < minDistance) {
            minDistance = distance;
            closestRectangle = rectangle;
        }
    });

    return {
        closestRectangle: closestRectangle,
        minDistance: minDistance
    };
}

function getRectangles(countx, county, widths = [200, 250, 100], heights = [500, 300, 200], xoffset = 100, 
                        yoffset = 75, gap = 10, scalingFactors = [], maxHeight = 1000, 
                        gapOffsets = {x: [0, 0], y: [0, 0]}) {
    let results = [];

    // Track cumulative Y offset for each column to avoid overlaps
    let cumulativeYOffsets = Array(countx).fill(yoffset);

    for (let j = 0; j < county; j++) {
        let cumulativeX = xoffset;  // Start X position for the current row

        for (let i = 0; i < countx; i++) {
            // Use modulo to cycle through widths and heights if their length is less than countx or county
            const width = widths[i % widths.length];
            const baseHeight = heights[j % heights.length];

            // Determine scaling factor for height, default to 1 if not specified
            const scalingFactor = scalingFactors[(i + j * countx) % scalingFactors.length] || 1;

            // Apply the scaling factor to the height
            let height = baseHeight * scalingFactor;

            // Check if adding the full height would exceed the maximum allowed height
            if (cumulativeYOffsets[i] + height > maxHeight) {
                // Adjust the height so it fits within the remaining available space
                height = maxHeight - cumulativeYOffsets[i];
            }

            // If height is non-positive after adjustment, skip rendering this rectangle
            if (height <= 0) {
                continue;
            }

            // Calculate the top-left corner (x0, y0) of the rectangle
            const x0 = cumulativeX;
            const y0 = cumulativeYOffsets[i];  // Use the column-specific cumulative Y-offset

            // Calculate the other three corners of the rectangle
            const x1 = x0 + width;  // Top-right
            const y1 = y0;
            const x2 = x0;          // Bottom-left
            const y2 = y0 + height;
            const x3 = x1;          // Bottom-right
            const y3 = y2;

            // Push the rectangle with calculated corners
            results.push({
                width: width,
                height: height,
                corners: [x0, y0, x1, y1, x2, y2, x3, y3],
                boxId: "box" + (i + j * countx)
            });

            // Update cumulativeYOffsets for this column, adding height + gap for the next rectangle
            cumulativeYOffsets[i] += height + gap + gapOffsets.y[i%gapOffsets.y.length];

            // Update cumulativeX by adding the width of the current rectangle plus the horizontal gap
            cumulativeX += width + gap + gapOffsets.x[i%gapOffsets.y.length];
        }        
    }

    return results;
}


function adj(m) {
    return [
        m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4],
        m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5],
        m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3]
    ];
}

function multmm(a, b) {
    var c = Array(9);
    for (var i = 0; i != 3; ++i) {
        for (var j = 0; j != 3; ++j) {
            var cij = 0;
            for (var k = 0; k != 3; ++k) {
                cij += a[3 * i + k] * b[3 * k + j];
            }
            c[3 * i + j] = cij;
        }
    }
    return c;
}

function multmv(m, v) {
    return [
        m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
        m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
        m[6] * v[0] + m[7] * v[1] + m[8] * v[2]
    ];
}

function basisToPoints(x1, y1, x2, y2, x3, y3, x4, y4) {
    var m = [x1, x2, x3, y1, y2, y3, 1, 1, 1];
    var v = multmv(adj(m), [x4, y4, 1]);
    return multmm(m, [
        v[0], 0, 0,
        0, v[1], 0,
        0, 0, v[2]
    ]);
}

function general2DProjection(
    x1s, y1s, x1d, y1d,
    x2s, y2s, x2d, y2d,
    x3s, y3s, x3d, y3d,
    x4s, y4s, x4d, y4d
) {
    var s = basisToPoints(x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s);
    var d = basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d);
    return multmm(d, adj(s));
}

function transform2d(elt, x1, y1, x2, y2, x3, y3, x4, y4) {
    var w = elt.offsetWidth, h = elt.offsetHeight;
    var t = general2DProjection
        (0, 0, x1, y1, w, 0, x2, y2, 0, h, x3, y3, w, h, x4, y4);
    for (var i = 0; i != 9; ++i) t[i] = t[i] / t[8];
    t = [t[0], t[3], 0, t[6], t[1], t[4], 0, t[7], 0, 0, 1, 0, t[2], t[5], 0, t[8]];
    t = "matrix3d(" + t.join(", ") + ")";
    elt.style["-webkit-transform"] = t;
    elt.style["-moz-transform"] = t;
    elt.style["-o-transform"] = t;
    elt.style.transform = t;
}

function update(rectangle) {
    const { corners } = rectangle;
    var box = document.getElementById(rectangle.boxId);
    transform2d(box, corners[0], corners[1], corners[2], corners[3],
        corners[4], corners[5], corners[6], corners[7]);
}

let currentCorner = -1;
let currentRectangle = null;

function saveRectanglesState() {
    const rectanglesState = rectangles.map(rect => ({
        boxId: rect.boxId,
        corners: rect.corners
    }));
    localStorage.setItem('rectanglesState', JSON.stringify(rectanglesState));
}

function loadRectanglesState() {
    const savedState = localStorage.getItem('rectanglesState');
    if (savedState) {
        const rectanglesState = JSON.parse(savedState);
        // console.log(savedState)
        // Map the saved state to the existing rectangles
        rectanglesState.forEach(savedRect => {
            const matchingRect = rectangles.find(rect => rect.boxId === savedRect.boxId);
            if (matchingRect) {
                matchingRect.corners = savedRect.corners;
            }
        });
    } else if (config.geometry) {
        config.geometry.forEach(savedRect => {
            const matchingRect = rectangles.find(rect => rect.boxId === savedRect.boxId);
            if (matchingRect) {
                matchingRect.corners = savedRect.corners;
            }
        });
    }
}

function resetRectangles() {
    localStorage.clear();  // Clear the saved rectangle states
    window.location.reload();  // Reload the page to regenerate rectangles from scratch
}


function move(evnt) {
    if (currentCorner < 0 || currentRectangle == null) return;
    const corners = currentRectangle.corners;
    corners[currentCorner] = evnt.pageX;
    corners[currentCorner + 1] = evnt.pageY;
    update(currentRectangle);
    saveRectanglesState();
}

function toggleVisibility(elements, show) {
    elements.forEach(element => {
        element.style.display = show ? 'block' : 'none';
    });
}

function rect(x, y, width, height, fill, id) {
    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', width);
    rect.setAttribute('height', height);
    rect.setAttribute('fill', fill);
    rect.id = id;
    return rect;
}

function circle(cx, cy, r, fill) {
    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', r);
    circle.setAttribute('fill', fill);
    return circle;
}

function ring(cx, cy, r, fill, weight, background="none") {
    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', r);
    circle.setAttribute('fill', background);
    circle.setAttribute('stroke', fill); // Set the border color (stroke)
    circle.setAttribute('stroke-width', weight); // Set the border thickness
    return circle;
}

function text(x, y, content, font="Futura, sans-serif") {
    const text = document.createElementNS(svgNS, 'text');
    text.setAttribute("x", x);  // x-coordinate (middle of the box width)
    text.setAttribute("y", y);  // y-coordinate
    text.setAttribute("font-family", font); // Font family
    text.setAttribute("font-size", "16"); // Font size
    text.setAttribute("font-weight", "100"); // Font weight
    text.setAttribute("fill", renderParams.backgroundColor);  // Text color
    text.setAttribute("text-anchor", "middle");  // Position text from the center
    text.setAttribute("dominant-baseline", "middle");  // Vertically center the text
    text.textContent = content;

    text.style.userSelect = "none"; // For most modern browsers
    text.style.webkitUserSelect = "none"; // For WebKit browsers (Safari, older Chrome)
    text.style.msUserSelect = "none"; // For Internet Explorer/Edge

    return text
} 

function wrappedText(svg, x, y, width, height, content, fill, font="Futura, sans-serif", fontSize=16) {
    const svgNS = "http://www.w3.org/2000/svg";
    const textGroup = document.createElementNS(svgNS, 'g'); // Group to hold multiple <text> elements

    //const fontSize = 16; // Adjust font size as needed
    const lineHeight = fontSize * 1.2; // Line height multiplier
    const maxCharsPerLine = Math.floor(width / (fontSize * 0.6)); // Rough estimate of chars per line

    let words = content.split(' ');
    let currentLine = [];
    let currentY = y;

    // Create the <text> element
    const textElement = document.createElementNS(svgNS, 'text');
    textElement.setAttribute("x", x);
    textElement.setAttribute("y", currentY);
    textElement.setAttribute("font-family", font);
    textElement.setAttribute("font-size", fontSize);
    textElement.setAttribute("fill", fill);

    textElement.style.userSelect = "none"; // For most modern browsers
    textElement.style.webkitUserSelect = "none"; // For WebKit browsers (Safari, older Chrome)
    textElement.style.msUserSelect = "none"; // For Internet Explorer/Edge

    // Track how much space is left in the bounding box
    let spaceRemaining = height;

    words.forEach(word => {
        const testLine = [...currentLine, word].join(' ');

        if (testLine.length > maxCharsPerLine) {
            // Check if there is enough space for another line
            if (spaceRemaining < lineHeight) {
                return; // Stop if no space remains for more lines
            }

            // Create a <tspan> for the current line
            const tspan = document.createElementNS(svgNS, 'tspan');
            tspan.setAttribute("x", x);
            tspan.setAttribute("y", currentY);
            tspan.textContent = currentLine.join(' ');
            textElement.appendChild(tspan);

            // Start a new line with the current word
            currentLine = [word];
            currentY += lineHeight;
            spaceRemaining -= lineHeight;

        } else {
            currentLine.push(word);
        }
    });

    // Append the last line if there is enough space remaining
    if (currentLine.length > 0 && spaceRemaining >= lineHeight) {
        const tspan = document.createElementNS(svgNS, 'tspan');
        tspan.setAttribute("x", x);
        tspan.setAttribute("y", currentY);
        tspan.textContent = currentLine.join(' ');
        textElement.appendChild(tspan);
    }

    textGroup.appendChild(textElement);
    return textGroup;
}

function simpleBox(svg, boxWidth, boxHeight) {
        // add text
        svg.appendChild(text(boxWidth / 2, boxHeight - 20, generateRandomSentence(18)))

        // Animate circle size with a sine wave function and a random period
        if (animate) {
            const c = circle(boxWidth / 2, boxHeight / 2, Math.min(boxWidth,boxHeight)/4, '#ACA298');
            svg.appendChild(c)

            let time = 0;
            const randomPeriod = Math.random() * 0.5 + 0.5; // Random period for each circle
            setInterval(() => {
                const amplitude = boxWidth * 0.02; // Max radius
                const offset = boxWidth / 8;    // Min radius
                const newRadius = offset + amplitude * Math.abs(Math.sin(time * randomPeriod));
                c.setAttribute('r', newRadius);
                time += 0.1;
            }, 50);
        }
}

function pulsatingDot(svg, boxWidth, boxHeight, xoffset = boxWidth/2, yoffset = boxHeight*0.9, scale=0.02) {
    if (animate) {
        const size = Math.min(boxWidth,boxHeight)*scale
        const c = circle(xoffset, yoffset, size, '#ACA298');
        svg.appendChild(c)

        let time = 0;
        const randomPeriod = Math.random() * 0.5 + 0.5; // Random period for each circle
        setInterval(() => {
            // const amplitude = boxWidth * 0.02; // Max radius
            // const amplitude = size*0.02
            const amplitude = size/4
            const offset = size/2
            // const offset = boxWidth / 8;    // Min radius
            const newRadius = offset + amplitude * Math.abs(Math.sin(time * randomPeriod));
            c.setAttribute('r', newRadius);
            time += 0.1;

        }, 25);
    }    
}

function xoxBox(svg, boxWidth, boxHeight, interval = 1000, changeRate = 0.1) {
    const increment = 25;
    const gap = 5;

    // Function to draw a single element at a given x, y
    function drawElement(x, y, withFade = true) {
        const randomValue = Math.random();
        let element;

        if (randomValue < 0.2) {
            element = circle(x + increment / 2, y + increment / 2, increment / 2 - gap, '#ACA298');
        } else if (randomValue < 0.4) {
            element = rect(x + gap, y + gap, increment - gap, increment - gap, '#ACA298');
        } else if (randomValue < 0.5) {
            const rect1 = rect(x + gap, y + gap + increment / 4, increment - gap, increment / 2 - gap, '#ACA298');
            const rect2 = rect(x + gap + increment / 4, y + gap, increment / 2 - gap, increment - gap, '#ACA298');
            rect1.classList.add('xox-shape');
            rect2.classList.add('xox-shape');
            if (withFade) {
                rect1.style.transition = 'opacity 600ms';
                rect2.style.transition = 'opacity 600ms';
                rect1.style.opacity = 0;
                rect2.style.opacity = 0;
                setTimeout(() => {
                    rect1.style.opacity = 1;
                    rect2.style.opacity = 1;
                }, 0);
            }
            svg.appendChild(rect1);
            svg.appendChild(rect2);
            return [rect1, rect2];
        } else if (randomValue < 0.9) {
            element = ring(x + increment / 2, y + increment / 2, increment / 2 - gap, '#ACA298', 2);
        }

        if (element) {
            element.classList.add('xox-shape');
            if (withFade) {
                element.style.transition = 'opacity 600ms';
                element.style.opacity = 0;
                setTimeout(() => element.style.opacity = 1, 0); // Fade-in after creation
            }
            svg.appendChild(element);
            return element;
        }
        return null;
    }

    // Initialize a grid of stored positions for elements (no fade for the first render)
    const elements = [];
    for (let i = boxWidth * 0.2; i <= boxWidth * 0.8; i += increment) {
        for (let j = boxHeight * 0.2; j < boxHeight * 0.8; j += increment) {
            const newElements = drawElement(i, j, false); // No fade for the first render
            if (newElements) elements.push({ pos: [i, j], els: newElements });
        }
    }

    // Function to remove old elements with fade-out transition and then remove from the DOM
    function removeElement(els, callback) {
        if (Array.isArray(els)) {
            els.forEach(subEl => {
                subEl.style.transition = 'opacity 900ms'; // Set fade-out transition
                subEl.style.opacity = 0; // Fade out
                setTimeout(() => {
                    if (svg.contains(subEl)) svg.removeChild(subEl); // Check if element is still in SVG
                    if (callback) callback(); // Call callback after removal
                }, 900); // Wait for fade-out to finish (900ms)
            });
        } else {
            els.style.transition = 'opacity 900ms'; // Set fade-out transition
            els.style.opacity = 0; // Fade out
            setTimeout(() => {
                if (svg.contains(els)) svg.removeChild(els); // Check if element is still in SVG
                if (callback) callback(); // Call callback after removal
            }, 900); // Wait for fade-out to finish (900ms)
        }
    }

    if (animate) {
        // Change a single element at each interval
        setInterval(() => {
            playMIDINote(36, 127, 30, 10, null, 0);
            const randomIndex = Math.floor(Math.random() * elements.length);
            const { pos: [x, y], els } = elements[randomIndex];

            // Remove old elements and replace with new ones
            removeElement(els, () => {
                // After removal, draw new elements at the same position
                const newElements = drawElement(x, y);
                if (newElements) {
                    elements[randomIndex].els = newElements; // Replace the old elements with new ones in the array
                }
            });
        }, interval);
    }
}

function bitPattern(svg, boxWidth, boxHeight) {
    let increment = 20
    for (let i=boxWidth*0.2; i<=boxWidth*0.8; i+=increment) {
        for (let j=boxHeight*0.2; j<boxHeight*0.8; j+=increment) {
            if (Math.random() < 0.5) {
                let c = circle(i, j, 6, '#ACA298')
                svg.appendChild(c)
                if (animate) {
                        let time = 0;
                        const randomPeriod = Math.random() * 0.5 + 0.5; // Random period for each circle
                        setInterval(() => {
                            const amplitude = 3; // Max radius
                            const offset = 5;    // Min radius
                            const newRadius = offset + amplitude * Math.abs(Math.sin(time * randomPeriod));
                            c.setAttribute('r', newRadius);
                            // if (Math.random() < 0.5) {
                            //     c.setAttribute('visibility', 'hidden');
                            // } else {
                            //     c.setAttribute('visibility', 'visible');
                            // }
                            time += 0.1;
                        }, 50);        
                }

            }
        }
    }
}

function speaker(svg, boxWidth, boxHeight, radius = boxWidth * 0.2) {
    const centerX = boxWidth / 2;
    const centerY = boxHeight / 2;
    const increment = 10;
    let grid = [];
    let previousGrids = []; // Array to hold the last four states
    let cols = Math.floor((boxWidth * 0.8 - boxWidth * 0.2) / increment);
    let rows = Math.floor((boxHeight * 0.8 - boxHeight * 0.2) / increment);

    // Initialize the grid with random live/dead states within the circle
    function initializeGrid() {
        for (let i = 0; i < cols; i++) {
            grid[i] = [];
            for (let j = 0; j < rows; j++) {
                const x = boxWidth * 0.2 + i * increment;
                const y = boxHeight * 0.2 + j * increment;
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                if (distance <= radius) {
                    grid[i][j] = Math.random() < 0.5 ? 1 : 0; // Randomly assign live/dead states
                } else {
                    grid[i][j] = 0; // Cells outside the circle are dead
                }
            }
        }
        previousGrids = []; // Clear the previous grids when reinitializing
    }

    // Function to count live neighbors of a given cell
    function countLiveNeighbors(x, y) {
        let liveNeighbors = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue; // Skip the current cell itself
                let col = (x + i + cols) % cols;
                let row = (y + j + rows) % rows;
                liveNeighbors += grid[col][row];
            }
        }
        return liveNeighbors;
    }

    // Render the grid by updating the dots in the SVG
    function renderGrid() {
        // Remove only the old dots (SVG circles)
        const oldDots = svg.querySelectorAll('circle.dot');
        oldDots.forEach(dot => dot.remove());

        // If the outer ring isn't already in the SVG, append it once
        if (!svg.querySelector('circle.ring')) {
            svg.appendChild(ring(boxWidth / 2, boxHeight / 2, radius*1.3, '#ACA298', 2));
        }


        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const x = boxWidth * 0.2 + i * increment;
                const y = boxHeight * 0.2 + j * increment;
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                if (distance <= radius && grid[i][j] === 1) {
                    // Draw a circle only if the cell is alive and inside the circle
                    let c = circle(x, y, increment / 3, '#ACA298');
                    c.classList.add('dot'); // Add class 'dot' to easily select for removal
                    svg.appendChild(c);
                }
            }
        }
    }

    // Update the grid based on the Game of Life rules
    function updateGrid() {
        let newGrid = [];
        for (let i = 0; i < cols; i++) {
            newGrid[i] = [];
            for (let j = 0; j < rows; j++) {
                const liveNeighbors = countLiveNeighbors(i, j);
                if (grid[i][j] === 1 && (liveNeighbors < 2 || liveNeighbors > 3)) {
                    newGrid[i][j] = 0; // Cell dies
                } else if (grid[i][j] === 0 && liveNeighbors === 3) {
                    newGrid[i][j] = 1; // Cell becomes alive
                } else {
                    newGrid[i][j] = grid[i][j]; // Cell stays the same
                }
            }
        }
        return newGrid;
    }

    // Check if two grids are the same
    function gridsAreEqual(grid1, grid2) {
        if (!grid1 || !grid2) return false;
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                if (grid1[i][j] !== grid2[i][j]) {
                    return false;
                }
            }
        }
        return true;
    }

    // Initial random state
    initializeGrid();
    renderGrid();

    if (animate) {
        // Set an interval to update the grid and re-render at each step
        setInterval(() => {
            const newGrid = updateGrid(); // Get the new state of the grid
            
            playMIDINote(36, 127, 30, 2, null, 0);
            // playMIDINote(aMajorPentatonic[col], 127, 200, deviceMap[row], dot) 


            // Detect if the grid is stuck in a cycle of up to 4 steps
            let isStuck = previousGrids.some(prevGrid => gridsAreEqual(newGrid, prevGrid));

            if (isStuck) {
                // console.log('Detected cycle or stuck state, reinitializing...');
                initializeGrid(); // Reinitialize to a random state if stuck
            } else {
                // Update the previousGrids array (keep only the last 4 states)
                previousGrids.push(JSON.parse(JSON.stringify(grid))); // Deep copy current grid
                if (previousGrids.length > 4) {
                    previousGrids.shift(); // Remove the oldest state if more than 4
                }

                grid = newGrid; // Update the grid to the new state
            }

            renderGrid(); // Re-render the grid based on the new state
        }, 100); // Update every 500ms, adjust as necessary
    }
}

function voronoi(svg, boxWidth, boxHeight, numPoints = 20) {
    // Define the color palette
    const colors = ['#DCD0C0', '#24A44A', '#D57728', '#1CA7DA', '#252624'];

    // Function to clear existing Voronoi paths
    function clearVoronoi() {
        while (svg.lastChild && svg.lastChild.tagName === 'path') {
            svg.removeChild(svg.lastChild);
        }
    }

    // Function to generate random points and Voronoi layout
    function generateVoronoi() {
        clearVoronoi();

        // Generate random points
        const points = d3.range(numPoints).map(() => [Math.random() * boxWidth, Math.random() * boxHeight]);

        // Use D3 Delaunay to compute the Voronoi diagram
        const delaunay = d3.Delaunay.from(points);
        const voronoi = delaunay.voronoi([0, 0, boxWidth, boxHeight]);

        // Create paths for each Voronoi cell
        for (let i = 0; i < numPoints; i++) {
            const polygon = voronoi.cellPolygon(i);
            if (polygon) {
                const path = document.createElementNS(svgNS, 'path');
                path.setAttribute('d', `M${polygon.join('L')}Z`);
                path.setAttribute('fill', colors[i % colors.length]); // Cycle through the colors
                path.setAttribute('stroke', 'rgba(0,0,0,0.2)');
                path.setAttribute('stroke-width', 1);
                svg.appendChild(path);
            }
        }
    }

    // Initial call to generate the Voronoi diagram
    generateVoronoi();

    // Set interval to regenerate Voronoi diagram every 200ms
    // setInterval(() => {
    //     generateVoronoi();
    // }, 200);
}

function entangled(svg, boxWidth, boxHeight, animate = false, refreshInterval = 10) {
    let increment = 20;
    let previousMatrix = JSON.parse(JSON.stringify(globalMatrix));  // Deep copy the initial matrix

    // Function to compare two matrices and check if they are different
    function hasMatrixChanged(matrix1, matrix2) {
        for (let i = 0; i < matrix1.length; i++) {
            for (let j = 0; j < matrix1[i].length; j++) {
                if (matrix1[i][j] !== matrix2[i][j]) {
                    return true;  // Return true if any element is different
                }
            }
        }
        return false; // Return false if all elements are the same
    }

    // Function to clear and re-render the matrix in the SVG
    function renderMatrix() {
        let rows = globalMatrix.length;
        let cols = globalMatrix[0].length;

        // Clear only the circle elements in the SVG
        let circles = svg.querySelectorAll('circle');
        circles.forEach(circle => {
            svg.removeChild(circle);
        });

        // Render circles based on the global matrix
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                if (globalMatrix[j][i] === 1) {  // Only render if the matrix value is 1
                    let x = i * increment;
                    let y = j * increment;
                    let c = circle(x, y, 6, '#ACA298');
                    svg.appendChild(c);
                }
            }
        }
    }

    // Initial render
    renderMatrix();

    // Set interval to refresh the rendering at the specified interval
    if (animate) {
        setInterval(() => {
            if (hasMatrixChanged(globalMatrix, previousMatrix)) {
                renderMatrix();  // Only render if the matrix has changed
                previousMatrix = JSON.parse(JSON.stringify(globalMatrix));  // Update previousMatrix
            }
        }, refreshInterval);  // Check and re-render if needed at the specified interval
    }
}

function spinningCube(svg, boxWidth, boxHeight) {
    // Calculate the cube size as 60% of the smallest dimension
    const cubeSize = Math.min(boxWidth, boxHeight) * 1.4;
    const halfCubeSize = cubeSize / 2; // For proper alignment of faces

    // Create foreignObject element to embed HTML content inside SVG
    const foreignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
    foreignObject.setAttribute("width", boxWidth);
    foreignObject.setAttribute("height", boxHeight);
    foreignObject.setAttribute("x", 0);  // Adjust the position if needed
    foreignObject.setAttribute("y", 0);  // Adjust the position if needed

    // Create a div to act as the cube container
    const cubeContainer = document.createElement('div');
    cubeContainer.id = 'cubeContainer';  // Optional, for future reference
    cubeContainer.style.width = `${boxWidth}px`;
    cubeContainer.style.height = `${boxHeight}px`;
    cubeContainer.style.display = "flex";
    cubeContainer.style.justifyContent = "center";  // Center horizontally
    cubeContainer.style.alignItems = "center";      // Center vertically

    // Create the scene div
    const scene = document.createElement('div');
    scene.classList.add('scene');
    scene.style.width = `${cubeSize}px`;
    scene.style.height = `${cubeSize}px`;

    // Create the cube div
    const cube = document.createElement('div');
    cube.classList.add('cube');
    cube.style.width = '100%';
    cube.style.height = '100%';

    // Define the six faces of the cube and set dynamic translateZ values
    const faces = ['front', 'back', 'left', 'right', 'top', 'bottom'];
    faces.forEach(faceClass => {
        const face = document.createElement('div');
        face.classList.add('face', faceClass);
        face.style.border = '1px solid #ACA398';  // Set the line color
        face.style.width = `${cubeSize}px`;
        face.style.height = `${cubeSize}px`;
        face.style.transform = faceTransform(faceClass, halfCubeSize);  // Dynamically calculate the transform
        // face.style.background = 'rgba(0, 0, 0, ' + (0.25 + Math.random()/2) + ')';
        cube.appendChild(face);
    });

    // Append the cube to the scene
    scene.appendChild(cube);

    // Append the scene to the cubeContainer
    cubeContainer.appendChild(scene);

    // Append the cubeContainer to the foreignObject
    foreignObject.appendChild(cubeContainer);

    // Append the foreignObject to the SVG
    svg.appendChild(foreignObject);
}

// Helper function to calculate the appropriate transform for each face
function faceTransform(faceClass, halfCubeSize) {
    switch (faceClass) {
        case 'front':
            return `translateZ(${halfCubeSize}px)`;
        case 'back':
            return `rotateY(180deg) translateZ(${halfCubeSize}px)`;
        case 'left':
            return `rotateY(-90deg) translateZ(${halfCubeSize}px)`;
        case 'right':
            return `rotateY(90deg) translateZ(${halfCubeSize}px)`;
        case 'top':
            return `rotateX(90deg) translateZ(${halfCubeSize}px)`;
        case 'bottom':
            return `rotateX(-90deg) translateZ(${halfCubeSize}px)`;
        default:
            return '';
    }
}

function textPattern(svg, boxWidth, boxHeight) {
    let nonEmptySchedule = SCHEDULE.filter(entry => entry["Talk Description (20-40 words)"].trim() !== "");
    let textContent = nonEmptySchedule[Math.floor(Math.random() * nonEmptySchedule.length)]["Talk Description (20-40 words)"].toUpperCase();

    // let textContent = SCHEDULE[Math.floor(Math.random() * SCHEDULE.length)]["Talk Description (20-40 words)"].toUpperCase();

    // Initialize text element using wrappedText
    let textElement = wrappedText(svg, boxWidth * 0.1, boxHeight * 0.1, boxWidth * 0.8, boxHeight * 0.9, textContent, "#ACA298");

    // Append the text to the SVG
    svg.appendChild(textElement);

    if (animate) {
        setInterval(() => {

            // Shift the text left by moving the first character to the end
            textContent = textContent.slice(1) + textContent.charAt(0); 

            // Remove the old text element
            svg.removeChild(textElement);

            // Reinitialize the text element with the shifted text
            textElement = wrappedText(svg, boxWidth * 0.1, boxHeight * 0.1, boxWidth * 0.8, boxHeight * 0.9, textContent, "#ACA298");

            // Append the newly created text element to the SVG again
            svg.appendChild(textElement);
        }, 50); // Update every 100ms
    }
}

function talkTitle(svg, boxWidth, boxHeight, numWords = 4) {
    let nonEmptySchedule = SCHEDULE.filter(entry => entry["Talk Title"].trim() !== "");
    let currentScheduleEntry = nonEmptySchedule[Math.floor(Math.random() * nonEmptySchedule.length)];
    let textContent = currentScheduleEntry["Talk Title"];
    let speakerName = currentScheduleEntry["First and Last Name: "];  // Correct field name

    // Split the text content into words
    let words = textContent.split(" ");
    let currentWordIndex = 0;
    let cycleCount = 0;
    const maxCycles = 5; // After 5 cycles, choose a new title

    // Create a text element for the speaker name
    let speakerTextElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    speakerTextElement.setAttribute('fill', '#ACA298');
    speakerTextElement.setAttribute('font-family', 'Helvetica');
    speakerTextElement.setAttribute('font-size', '16');  // Half the size of main text
    speakerTextElement.setAttribute('font-weight', 'lighter');  // Regular font weight
    speakerTextElement.setAttribute('dominant-baseline', 'middle');
    speakerTextElement.style.userSelect = 'none';  // Prevent text selection

    // Append speaker name text element to SVG
    svg.appendChild(speakerTextElement);

    // Create an array of text elements for the queue of words
    let textElements = [];

    // Initialize text elements for the word queue
    for (let i = 0; i < numWords; i++) {
        let textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textElement.setAttribute('fill', '#ACA298');
        textElement.setAttribute('font-family', 'Helvetica');
        textElement.setAttribute('font-size', '32');
        textElement.setAttribute('font-weight', 'bold');  // Set the font to bold
        textElement.setAttribute('letter-spacing', '-1');
        textElement.setAttribute('dominant-baseline', 'middle');  // Center text vertically
        textElement.style.userSelect = 'none';  // Prevent text selection
        svg.appendChild(textElement);
        textElements.push(textElement);
    }

    // Function to calculate and adjust text positions to center the queue and speaker name
    function centerText() {
        const availableHeight = boxHeight;
        const totalSpacing = 20; // Set the total spacing between words
        const lineHeight = 14;  // Font size is 32 for the queue words
        const totalHeight = numWords * lineHeight + (numWords - 1) * totalSpacing; // Total height of words and spaces

        // Calculate where the words should start vertically
        const startY = (availableHeight - totalHeight) / 2 + 16; // Slightly adjust for the speaker name

        // Center the speaker text above the first word
        const speakerTextCenterX = (boxWidth - speakerTextElement.getBBox().width) / 2;
        speakerTextElement.setAttribute('x', speakerTextCenterX);
        speakerTextElement.setAttribute('y', startY - 40);  // Place above the first word

        // Position each text element in the queue
        textElements.forEach((textElement, index) => {
            const textCenterX = (boxWidth - textElement.getBBox().width) / 2;  // Center horizontally
            const textY = startY + index * (lineHeight + totalSpacing);  // Evenly distribute vertically

            textElement.setAttribute('x', textCenterX); // Set the x position
            textElement.setAttribute('y', textY);  // Set the y position
        });
    }

    // Initialize the text elements with the first words in the queue
    function initializeText() {
        for (let i = 0; i < numWords; i++) {
            textElements[i].textContent = words[(currentWordIndex + i) % words.length];
        }
        speakerTextElement.textContent = speakerName;  // Set speaker name

        // Center everything after the browser renders the content
        requestAnimationFrame(() => {
            centerText();  // Center everything after the DOM has updated
        });
    }

    // Call initializeText to render speaker name and words immediately
    initializeText();  // Ensures text is rendered immediately and centered properly

    if (animate) {
        setInterval(() => {
            // Shift up the words: remove the top, shift remaining, and add new word at the bottom
            currentWordIndex = (currentWordIndex + 1) % words.length;
            playMIDINote(36, 127, 30, 3, null, 0);

            // Update the queue by shifting all words up and setting the new bottom word
            for (let i = 0; i < numWords - 1; i++) {
                textElements[i].textContent = textElements[i + 1].textContent;  // Shift words up
            }

            // Set the new bottom word
            textElements[numWords - 1].textContent = words[(currentWordIndex + numWords - 1) % words.length];

            // Increment the cycle count and check if we need to pick a new random title
            cycleCount++;
            if (cycleCount >= maxCycles) {
                // Reset cycle count and pick a new random title
                cycleCount = 0;
                currentScheduleEntry = nonEmptySchedule[Math.floor(Math.random() * nonEmptySchedule.length)];
                textContent = currentScheduleEntry["Talk Title"];
                speakerName = currentScheduleEntry["First and Last Name: "];
                words = textContent.split(" ");
                currentWordIndex = 0;  // Reset word index to start with new title
                initializeText();  // Update both the speaker name and the words
            }

            // Re-center all text elements after updating
            centerText();
        }, 200); // Update every second (1000ms)
    }
}


function drippingLife(svg, boxWidth, boxHeight, rectWidth, rectHeight, animate = true) {
    const centerX = boxWidth / 2;
    const centerY = boxHeight / 2;
    const increment = 10; // Grid cell size
    let grid = [];
    let previousGrids = []; // Array to hold the last four states

    // Calculate the number of columns and rows based on the rectangle size and increment
    let cols = Math.floor(rectWidth / increment);
    let rows = Math.floor(rectHeight / increment);

    // Offsets to center the rectangle in the SVG
    const offsetX = (boxWidth - rectWidth) / 2;
    const offsetY = (boxHeight - rectHeight) / 2;

    // Initialize the grid with random live/dead states inside the rectangle
    function initializeGrid() {
        for (let i = 0; i < cols; i++) {
            grid[i] = [];
            for (let j = 0; j < rows; j++) {
                grid[i][j] = Math.random() < 0.5 ? 1 : 0; // Randomly assign live/dead states
            }
        }
        previousGrids = []; // Clear previous grid states when reinitializing
    }

    // Function to count live neighbors of a given cell
    function countLiveNeighbors(x, y) {
        let liveNeighbors = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue; // Skip the current cell itself
                let col = (x + i + cols) % cols;
                let row = (y + j + rows) % rows;
                liveNeighbors += grid[col][row];
            }
        }
        return liveNeighbors;
    }

    // Render the grid by updating the dots in the SVG
    function renderGrid() {
        // Remove previous dots (SVG circles)
        const oldDots = svg.querySelectorAll('circle.dot');
        oldDots.forEach(dot => dot.remove());

        // Loop through each cell and render circles for live cells
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const x = offsetX + i * increment;
                const y = offsetY + j * increment;
                if (grid[i][j] === 1) {
                    let c = circle(x, y, increment / 3, '#ACA298');
                    c.classList.add('dot'); // Add class 'dot' to easily select for removal
                    svg.appendChild(c);
                }
            }
        }
    }

    // Update the grid based on the Game of Life rules
    function updateGrid() {
        let newGrid = [];
        for (let i = 0; i < cols; i++) {
            newGrid[i] = [];
            for (let j = 0; j < rows; j++) {
                const liveNeighbors = countLiveNeighbors(i, j);
                if (grid[i][j] === 1 && (liveNeighbors < 2 || liveNeighbors > 3)) {
                    newGrid[i][j] = 0; // Cell dies
                } else if (grid[i][j] === 0 && liveNeighbors === 3) {
                    newGrid[i][j] = 1; // Cell becomes alive
                } else {
                    newGrid[i][j] = grid[i][j]; // Cell stays the same
                }
            }
        }
        return newGrid;
    }

    // Check if two grids are the same
    function gridsAreEqual(grid1, grid2) {
        if (!grid1 || !grid2) return false;
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                if (grid1[i][j] !== grid2[i][j]) {
                    return false;
                }
            }
        }
        return true;
    }

    // Initial random state
    initializeGrid();
    renderGrid();

    if (animate) {
        // Set an interval to update the grid and re-render at each step
        setInterval(() => {
            playMIDINote(36, 127, 30, 8, null, 0);
            const newGrid = updateGrid(); // Get the new state of the grid

            // Detect if the grid is stuck in a cycle of up to 4 steps
            let isStuck = previousGrids.some(prevGrid => gridsAreEqual(newGrid, prevGrid));

            if (isStuck) {
                initializeGrid(); // Reinitialize to a random state if stuck
            } else {
                // Update the previousGrids array (keep only the last 4 states)
                previousGrids.push(JSON.parse(JSON.stringify(grid))); // Deep copy current grid
                if (previousGrids.length > 4) {
                    previousGrids.shift(); // Remove the oldest state if more than 4
                }

                grid = newGrid; // Update the grid to the new state
            }

            renderGrid(); // Re-render the grid based on the new state
        }, 100); // Update every 100ms, adjust as necessary
    }
}

function slidingLife(svg, boxWidth, boxHeight, stripWidth, stripHeight, animate = true) {
    const increment = 10; // Grid cell size
    let grid = [];
    let previousGrids = []; // Array to hold the last four states

    // Calculate the number of columns and rows based on the strip size and increment
    let cols = Math.floor(stripWidth / increment);
    let rows = Math.floor(stripHeight / increment);

    // Offsets to start the strip at the left side of the SVG
    let offsetX = 0;  // Start at the left and slide right
    const offsetY = (boxHeight - stripHeight); // Vertically center the strip in the SVG

    // Initialize the grid with random live/dead states inside the strip
    function initializeGrid() {
        for (let i = 0; i < cols; i++) {
            grid[i] = [];
            for (let j = 0; j < rows; j++) {
                grid[i][j] = Math.random() < 0.5 ? 1 : 0; // Randomly assign live/dead states
            }
        }
        previousGrids = []; // Clear previous grid states when reinitializing
    }

    // Function to count live neighbors of a given cell
    function countLiveNeighbors(x, y) {
        let liveNeighbors = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue; // Skip the current cell itself
                let col = (x + i + cols) % cols;
                let row = (y + j + rows) % rows;
                liveNeighbors += grid[col][row];
            }
        }
        return liveNeighbors;
    }

    // Render the grid by updating the dots in the SVG
    function renderGrid() {
        // Remove previous dots (SVG circles)
        const oldDots = svg.querySelectorAll('circle.dot');
        oldDots.forEach(dot => dot.remove());

        // Loop through each cell and render circles for live cells
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const x = offsetX + i * increment;
                const y = offsetY + j * increment;
                if (grid[i][j] === 1) {
                    let c = circle(x, y, increment / 3, '#ACA298');
                    c.classList.add('dot'); // Add class 'dot' to easily select for removal
                    svg.appendChild(c);
                }
            }
        }
    }

    // Update the grid based on the Game of Life rules
    function updateGrid() {
        let newGrid = [];
        for (let i = 0; i < cols; i++) {
            newGrid[i] = [];
            for (let j = 0; j < rows; j++) {
                const liveNeighbors = countLiveNeighbors(i, j);
                if (grid[i][j] === 1 && (liveNeighbors < 2 || liveNeighbors > 3)) {
                    newGrid[i][j] = 0; // Cell dies
                } else if (grid[i][j] === 0 && liveNeighbors === 3) {
                    newGrid[i][j] = 1; // Cell becomes alive
                } else {
                    newGrid[i][j] = grid[i][j]; // Cell stays the same
                }
            }
        }
        return newGrid;
    }

    // Check if two grids are the same
    function gridsAreEqual(grid1, grid2) {
        if (!grid1 || !grid2) return false;
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                if (grid1[i][j] !== grid2[i][j]) {
                    return false;
                }
            }
        }
        return true;
    }

    // Initial random state
    initializeGrid();
    renderGrid();

    if (animate) {
        // Set an interval to update the grid and re-render at each step
        setInterval(() => {
            const newGrid = updateGrid(); // Get the new state of the grid

            // Detect if the grid is stuck in a cycle of up to 4 steps
            let isStuck = previousGrids.some(prevGrid => gridsAreEqual(newGrid, prevGrid));

            if (isStuck) {
                initializeGrid(); // Reinitialize to a random state if stuck
            } else {
                // Update the previousGrids array (keep only the last 4 states)
                previousGrids.push(JSON.parse(JSON.stringify(grid))); // Deep copy current grid
                if (previousGrids.length > 4) {
                    previousGrids.shift(); // Remove the oldest state if more than 4
                }

                grid = newGrid; // Update the grid to the new state
            }

            renderGrid(); // Re-render the grid based on the new state

            // Move the strip to the right
            offsetX += increment; // Move right by one column
            if (offsetX >= boxWidth) {
                offsetX = 0; // Reset to left when reaching the right edge
            }
        }, 100); // Update every 100ms, adjust as necessary
    }
}



function circlePacking(svg, boxWidth, boxHeight, minCircleRadius, maxCircleRadius, totalCircles = 3, interval = 1000) {
    const packingWidth = boxWidth * 0.8; // 80% of SVG width
    const packingHeight = boxHeight * 0.8; // 80% of SVG height
    const packingCenterX = boxWidth / 2; // Center of SVG
    const packingCenterY = boxHeight / 2; // Center of SVG
    const packingLeft = packingCenterX - packingWidth / 2;
    const packingTop = packingCenterY - packingHeight / 2;

    let circles = []; // Array to keep track of the circles
    let circleCount = 0; // Counter to track circles added
    let failedPlacementCount = 0; // Tracks consecutive failures to place a circle
    const maxPlacementAttempts = 100; // Attempts per circle placement to find a position
    const maxFailedAttempts = 5; // Max consecutive failed placements before resetting

    // Function to generate a random circle radius between minCircleRadius and maxCircleRadius
    function getRandomRadius() {
        return Math.random() * (maxCircleRadius - minCircleRadius) + minCircleRadius;
    }

    // Function to generate a random angle (in radians)
    function getRandomAngle() {
        return Math.random() * 2 * Math.PI;
    }

    // Function to check if two circles overlap
    function circlesOverlap(x1, y1, r1, x2, y2, r2) {
        const distance = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
        return distance < r1 + r2; // True if the circles overlap
    }

    // Function to find a non-overlapping position for the next circle within the packing area
    function findNextPosition(existingCircle, radius) {
        const [cx1, cy1, r1] = existingCircle;
        let cx2, cy2;

        for (let attempt = 0; attempt < maxPlacementAttempts; attempt++) {
            const angle = getRandomAngle();
            const distance = r1 + radius + 1;
            cx2 = cx1 + distance * Math.cos(angle);
            cy2 = cy1 + distance * Math.sin(angle);

            // Ensure the new circle stays within the packing rectangle
            if (
                cx2 - radius < packingLeft ||
                cx2 + radius > packingLeft + packingWidth ||
                cy2 - radius < packingTop ||
                cy2 + radius > packingTop + packingHeight
            ) continue;

            // Check if the new circle overlaps with any existing circle
            const overlaps = circles.some(([cx, cy, r]) => circlesOverlap(cx2, cy2, radius, cx, cy, r));
            if (!overlaps) return [cx2, cy2];
        }

        return null; // Indicate failure to find a valid position
    }

    // Function to render a circle at a given position
    function renderCircle(cx, cy, radius) {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', radius);

        // Set circle fill and stroke
        circle.setAttribute('fill', '#ACA398');
        circle.setAttribute('stroke', '#ACA298');
        circle.setAttribute('stroke-width', '1');
        circle.classList.add('packed-circle');

        // Append the new circle to the SVG
        svg.appendChild(circle);
    }

    // Function to pack the next circle
    function packNextCircle() {
        const radius = getRandomRadius();

        // If no circles exist, start with the center of the packing area
        if (circles.length === 0) {
            const cx = packingCenterX;
            const cy = packingCenterY;
            renderCircle(cx, cy, radius);
            circles.push([cx, cy, radius]);
            circleCount++;
            failedPlacementCount = 0; // Reset failure count on successful placement
            return;
        }

        // Try to place the next circle near an existing circle
        for (let existingCircle of circles) {
            const newPosition = findNextPosition(existingCircle, radius);
            if (newPosition) {
                const [cx, cy] = newPosition;
                renderCircle(cx, cy, radius);
                circles.push([cx, cy, radius]);
                circleCount++;
                failedPlacementCount = 0; // Reset failure count on successful placement

                // Check if we reached the total number of circles
                if (circleCount >= totalCircles) resetCircles();
                return;
            }
        }

        // Increment failed placement count if no position was found
        failedPlacementCount++;

        // Reset only if consecutive failed placements exceed maxFailedAttempts
        if (failedPlacementCount >= maxFailedAttempts) {
            resetCircles();
        }
    }

    // Function to reset only the circles created by circlePacking
    function resetCircles() {
        circles = []; // Clear the circles array
        circleCount = 0; // Reset the circle count
        failedPlacementCount = 0; // Reset the failed placement count
        const circleElements = svg.querySelectorAll('.packed-circle'); // Select only packed circles
        circleElements.forEach(circle => svg.removeChild(circle)); // Remove only packed circles
    }

    // Immediately render the first circle
    packNextCircle();

    if (animate) {
        // Set an interval to render a new circle every tick
        setInterval(() => {
            packNextCircle(); // Call the function to try packing a new circle
        }, interval); // Interval in milliseconds
    }
}


function generateBoxes(rotate = false, rotateIndividual = false) {
    const container = document.getElementById('container');

    // Clear existing content in the container
    container.innerHTML = '';

    // Create a wrapper for all boxes
    const wrapper = document.createElement('div');
    wrapper.className = 'wrapper';
    container.appendChild(wrapper);  // Append wrapper to the container

    // Set the container to use relative positioning to help with positioning after rotation
    container.style.position = 'relative';
    container.style.width = '100%';
    container.style.height = '100%';

    // BOX_SEQUENCE = shuffleArray([0, 1, 2, 3, 4, 5, 6])

    // Create boxes dynamically
    for (let i = 0; i < rectangles.length; i++) {
        // Create box
        const boxWidth = rectangles[i].width;
        const boxHeight = rectangles[i].height;
        const box = document.createElement('div');
        box.className = 'box';
        box.id = `box${i}`;

        // Set the box's width and height
        box.style.width = `${boxWidth}px`;
        box.style.height = `${boxHeight}px`;

        wrapper.appendChild(box);  // Append each box to the wrapper

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

        // Set width and height for each SVG
        svg.setAttribute('width', boxWidth);
        svg.setAttribute('height', boxHeight);
        svg.setAttribute('viewBox', `0 0 ${boxWidth} ${boxHeight}`);

        // Create a <g> element for applying the rotation
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        // If rotateIndividual is true, apply rotation to the <g> element
        if (rotateIndividual) {
            const centerX = boxWidth / 2;
            const centerY = boxHeight / 2;
            group.setAttribute('transform', `rotate(90, ${centerX}, ${centerY})`);  // Rotate around the center of the SVG
        }

        // Add background rectangle to the group
        const rectElement = rect(0, 0, boxWidth, boxHeight, '#252624', `${box.id}-background`);
        group.appendChild(rectElement);

        // Add corner module dots to the group
        group.appendChild(circle(renderParams.borderGap, renderParams.borderGap, renderParams.borderGap / 4, '#ACA298'));
        group.appendChild(circle(boxWidth - renderParams.borderGap, renderParams.borderGap, renderParams.borderGap / 4, '#ACA298'));
        group.appendChild(circle(renderParams.borderGap, boxHeight - renderParams.borderGap, renderParams.borderGap / 4, '#ACA298'));
        group.appendChild(circle(boxWidth - renderParams.borderGap, boxHeight - renderParams.borderGap, renderParams.borderGap / 4, '#ACA298'));

        // let type = Math.floor(Math.random() * 8);
        BOX_SEQUENCE = shuffleArray(BOX_SEQUENCE)
        let type = BOX_SEQUENCE[i%BOX_SEQUENCE.length]%7

        switch (type) {
            case 0:
                simpleBox(group, boxWidth, boxHeight);
                break;
            case 1:
                xoxBox(group, boxWidth, boxHeight);
                break;
            case 2:
                textPattern(group, boxWidth, boxHeight);
                break;
            case 3:
                speaker(group, boxWidth, boxHeight);
                break;
            case 4:
                spinningCube(group, boxWidth, boxHeight);
                drippingLife(group, boxWidth, boxHeight, boxWidth * 0.3, boxHeight * 0.4, true);
                break;
            case 5:
                circlePacking(group, boxWidth, boxHeight, boxWidth * 0.05, boxWidth * 0.25, 15, 250);
                break;
            case 6:
                //drippingLife(group, boxWidth, boxHeight, boxWidth * 0.3, boxHeight * 0.4, true);
                if (boxWidth > 150) {
                    talkTitle(group, boxWidth, boxHeight)
                    pulsatingDot(group, boxWidth, boxHeight)
                    pulsatingDot(group, boxWidth, boxHeight, boxWidth/2-16)
                    pulsatingDot(group, boxWidth, boxHeight, boxWidth/2+16)
                    break;
                }
            // case 7:
            //     slidingLife(group, boxWidth, boxHeight, boxWidth, boxHeight*0.1, true);
            //     break;
            default:
                bitPattern(group, boxWidth, boxHeight);
        }

        // Append the <g> (group) to the SVG
        svg.appendChild(group);

        // Append SVG to the box
        box.appendChild(svg);
    }

    document.querySelectorAll('.box').forEach(box => {
        box.style.border = '1px solid black';
    });

    // Calculate wrapper dimensions after content is appended
    const wrapperWidth = wrapper.offsetWidth;
    const wrapperHeight = wrapper.offsetHeight;

    if (rotate) {
        // Apply the 90-degree rotation to the whole wrapper
        wrapper.style.transform = 'rotate(90deg)';

        // Adjust the position to center after rotation based on the new dimensions
        wrapper.style.position = 'absolute';
        wrapper.style.top = `calc(50% - ${wrapperWidth / 2}px)`;  // Centered vertically after rotation
        wrapper.style.left = `calc(50% - ${wrapperHeight / 2}px + 35%)`;  // Adjust X axis with + 35%
    }
}


window.addEventListener('load', function () {

    if (midiEnabled) {
        initMIDI()
    }

    loadRectanglesState();
    generateBoxes();
    rectangles.forEach(update);

    const newButton = document.getElementById('newButton');
    newButton.addEventListener('click', resetRectangles);

    toggleBorders.addEventListener('change', () => {
        const show = toggleBorders.checked;
        rectangles.forEach(rectangle => {
            const box = document.getElementById(rectangle.boxId);
            box.style.border = show ? '1px solid black' : 'none';
        });
    });

});

window.addEventListener('mousedown', function (evnt) {
    var x = evnt.pageX, y = evnt.pageY, dx, dy;
    rectangles.forEach(rectangle => {
        const { corners } = rectangle;
        for (var i = 0; i != 8; i += 2) {
            dx = x - corners[i];
            dy = y - corners[i + 1];
            if (Math.sqrt(dx * dx + dy * dy) < renderParams.borderGap) {
                currentRectangle = rectangle;
                currentCorner = i;
                move(evnt);
                return;
            }
        }
    });
});

window.addEventListener('mouseup', function () {
    currentCorner = -1;
    currentRectangle = null;
});

window.addEventListener('mousemove', move);

// Function to reload the entire page
function resetPage() {
    location.reload();  // Reloads the current page
}

// Set a timeout to reset the page every 5 minutes (300,000 milliseconds)
setTimeout(resetPage, 6000);
// setTimeout(resetPage, 1000);

