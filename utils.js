function generateRandomSentence(maxChars) {
    const words = [
        "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
        "integer", "nec", "odio", "praesent", "libero", "sed", "cursus", "ante",
        "dapibus", "diam", "nunc", "feugiat", "mi", "in", "massa", "vulputate", "ut",
        "placerat", "orci", "nulla", "pellentesque", "dignissim", "lacus"
    ];

    let sentence = "";
    let space = " ";
    
    while (true) {
        const word = words[Math.floor(Math.random() * words.length)];

        // Check if adding the next word would exceed the maxChars limit
        if (sentence.length + word.length + (sentence ? space.length : 0) <= maxChars) {
            sentence += (sentence ? space : "") + word; // Add space between words
        } else {
            break; // Exit the loop if maxChars is reached
        }
    }

    return sentence;
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
    let bigint = parseInt(hex.slice(1), 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return [r, g, b];
}

// Helper function to convert RGB to hex
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Helper function to adjust the brightness of a color
function adjustBrightness([r, g, b], factor) {
    return [
        Math.min(Math.max(Math.floor(r * factor), 0), 255),
        Math.min(Math.max(Math.floor(g * factor), 0), 255),
        Math.min(Math.max(Math.floor(b * factor), 0), 255)
    ];
}

// Function to generate shades of a color
function generateShades(hexColor, numShades = 5) {
    const rgbColor = hexToRgb(hexColor);
    const shades = [];

    // Generate shades from darker to lighter by adjusting brightness
    for (let i = 0; i < numShades; i++) {
        const factor = 0.5 + (i * 0.5) / (numShades - 1);  // Factor to darken/lighten
        const shade = adjustBrightness(rgbColor, factor);
        shades.push(rgbToHex(...shade));
    }

    return shades;
}

// Function to generate a random shade of the input color
function generateRandomShade(hexColor) {
    const rgbColor = hexToRgb(hexColor);
    const randomFactor = Math.random() * 1.5 + 0.5;  // Random factor between 0.5 and 2
    const randomShade = adjustBrightness(rgbColor, randomFactor);
    return rgbToHex(...randomShade);
}

function generateRandomMatrix(boxWidth, boxHeight, increment) {
    let cols = Math.floor(boxWidth / increment);
    let rows = Math.floor((boxHeight * 0.6) / increment); // Height between 0.2 and 0.8 of boxHeight
    
    let matrix = [];
    for (let i = 0; i < rows; i++) {
        let row = [];
        for (let j = 0; j < cols; j++) {
            row.push(Math.random() < 0.5 ? 1 : 0); // Random 1s and 0s
        }
        matrix.push(row);
    }
    return matrix;
}

function shiftMatrixDown(matrix) {
    // Remove the last row and place it at the top (circular shift)
    let lastRow = matrix.pop();
    matrix.unshift(lastRow);
    return matrix;
}

function diagonalShiftMatrix(matrix) {
    let rows = matrix.length;
    let cols = matrix[0].length;

    // Create a new matrix to store the shifted result
    let newMatrix = Array.from(Array(rows), () => Array(cols).fill(0));

    // Shift each element diagonally (down and to the right)
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            // Compute new positions with wrap-around
            let newRow = (i + 1) % rows; // Move down, wrap around to the top if necessary
            let newCol = (j + 1) % cols; // Move right, wrap around to the left if necessary
            newMatrix[newRow][newCol] = matrix[i][j];
        }
    }

    return newMatrix;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        // Pick a random index from 0 to i
        const j = Math.floor(Math.random() * (i + 1));
        // Swap array[i] with the element at random index
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
