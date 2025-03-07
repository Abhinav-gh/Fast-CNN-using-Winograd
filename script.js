// Winograd transformation matrices
const B = [
    [1, 0, -1, 0],
    [0, 1, 1, 0],
    [0, -1, 1, 0],
    [0, 1, 0, -1]
];

const G = [
    [1, 0, 0],
    [0.5, 0.5, 0.5],
    [0.5, -0.5, 0.5],
    [0, 0, 1]
];

const A = [
    [1, 1, 1, 0],
    [0, 1, -1, -1]
];

let currentStep = 0;
const steps = [
    "Step 1: Original input (4x4) and filter (3x3)",
    "Step 2: View transformation matrices (B, G, A)",
    "Step 3: Transform input using B matrices",
    "Step 4: Transform filter using G matrices",
    "Step 5: Element-wise multiplication",
    "Step 6: Final output after inverse transform using A",
    "Step 7: Direct convolution animation (for comparison)"
];

const stepDescriptions = [
    "We start with an input matrix of size 4x4 and a filter (kernel) of size 3x3. The Winograd algorithm will compute a 2x2 output using matrix transformations to reduce multiplications.",

    "B matrix (4x4): Used to transform the input tile<br>G matrix (4x3): Used to transform the filter<br>A matrix (2x4): Used for the inverse transform<br><br>These matrices are carefully designed to minimize the number of multiplications needed.",

    "To transform the input, we compute:<br><div class='formula'>U = B<sup>T</sup> × Input × B</div>This transforms the original input into a form that allows efficient computation.",

    "Similarly, we transform the filter with:<br><div class='formula'>V = G × Filter × G<sup>T</sup></div>This prepares the filter for element-wise multiplication rather than traditional convolution.",

    "Instead of sliding the filter and computing sums of products, we simply multiply the transformed matrices element-wise:<br><div class='formula'>M = U ⊙ V</div>where ⊙ represents element-wise multiplication. This reduces the number of multiplications needed!",

    "Finally, we compute the output with:<br><div class='formula'>Output = A × M × A<sup>T</sup></div>This transforms our intermediate result back to the desired output space.",

    "For comparison, here's how traditional convolution would slide the 3x3 kernel over the 4x4 input, computing each output element with 9 multiplications and additions."
];

let input = [];
let filter = [];
let transformedInput = [];
let transformedFilter = [];
let elementwiseProduct = [];
let output = [];
let animationStep = 0;
let animationInterval;

function createMatrixElement(rows, cols, elementId, className) {
    const matrixDiv = document.getElementById(elementId);
    matrixDiv.style.gridTemplateColumns = `repeat(${cols}, 40px)`;
    matrixDiv.innerHTML = '';

    const matrix = [];
    for (let i = 0; i < rows; i++) {
        matrix[i] = [];
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement('div');
            cell.className = `cell ${className}`;
            cell.dataset.row = i;
            cell.dataset.col = j;
            matrixDiv.appendChild(cell);
        }
    }
    return matrix;
}

function fillMatrix(matrix, elementId, className, randomize = false) {
    const matrixDiv = document.getElementById(elementId);
    const cells = matrixDiv.getElementsByClassName('cell');
    let idx = 0;

    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[0].length; j++) {
            if (randomize) {
                if (className === 'input') {
                    matrix[i][j] = Math.floor(Math.random() * 5);
                } else if (className === 'filter') {
                    matrix[i][j] = Math.floor(Math.random() * 3);
                } else {
                    matrix[i][j] = 0;
                }
            }
            cells[idx].textContent = typeof matrix[i][j] === 'number' ?
                (Number.isInteger(matrix[i][j]) ? matrix[i][j] : matrix[i][j].toFixed(1)) :
                matrix[i][j];
            cells[idx].className = `cell ${className}`;
            idx++;
        }
    }
    return matrix;
}

// Modified matrix multiplication with precision handling
function matrixMultiply(a, b) {
    const result = [];
    for (let i = 0; i < a.length; i++) {
        result[i] = [];
        for (let j = 0; j < b[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < a[0].length; k++) {
                sum += a[i][k] * b[k][j];
            }
            result[i][j] = Math.round(sum * 1000) / 1000;
        }
    }
    return result;
}

function transpose(m) {
    return m[0].map((_, i) => m.map(row => row[i]));
}

function setupMatrices() {
    // Create matrices
    input = createMatrixElement(4, 4, 'inputMatrix', 'input');
    filter = createMatrixElement(3, 3, 'filterMatrix', 'filter');
    createMatrixElement(2, 2, 'outputMatrix', 'output');

    // Create transformation matrices
    createMatrixElement(4, 4, 'bMatrix', 'transform');
    createMatrixElement(4, 3, 'gMatrix', 'transform');
    createMatrixElement(2, 4, 'aMatrix', 'transform');

    // Create transformed matrices
    createMatrixElement(4, 4, 'transformedInputMatrix', 'input');
    createMatrixElement(4, 4, 'transformedFilterMatrix', 'filter');

    // Create element-wise product matrix
    createMatrixElement(4, 4, 'elementwiseProductMatrix', 'output');

    // Animation matrices
    createMatrixElement(4, 4, 'animInputMatrix', 'input');
    createMatrixElement(2, 2, 'animOutputMatrix', 'output');

    // Fill with values
    input = fillMatrix([
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16]
    ], 'inputMatrix', 'input');

    filter = fillMatrix([
        [1, 2, 1],
        [0, 1, 0],
        [1, 0, 1]
    ], 'filterMatrix', 'filter');

    fillMatrix([[0, 0], [0, 0]], 'outputMatrix', 'output');
    fillMatrix(B, 'bMatrix', 'transform');
    fillMatrix(G, 'gMatrix', 'transform');
    fillMatrix(A, 'aMatrix', 'transform');

    // Also set up animation matrices
    fillMatrix([...input], 'animInputMatrix', 'input');
    fillMatrix([[0, 0], [0, 0]], 'animOutputMatrix', 'output');
}

function reset() {
    clearInterval(animationInterval);
    currentStep = 0;
    animationStep = 0;

    // Hide all extra matrix rows
    document.getElementById('transformMatrices').style.display = 'none';
    document.getElementById('transformedMatrices').style.display = 'none';
    document.getElementById('productMatrix').style.display = 'none';
    document.getElementById('convAnimation').style.display = 'none';

    // Show original matrices
    document.getElementById('originalMatrices').style.display = 'flex';

    setupMatrices();
    updateExplanation();
}

function updateExplanation() {
    document.getElementById('explanation').textContent = steps[currentStep];
    document.getElementById('stepDetail').innerHTML = stepDescriptions[currentStep];
}

function prevStep() {
    clearInterval(animationInterval);
    if (currentStep > 0) {
        currentStep--;
        updateStepDisplay();
    }
}

function nextStep() {
    clearInterval(animationInterval);
    if (currentStep < steps.length - 1) {
        currentStep++;
        updateStepDisplay();
    }
}

function updateStepDisplay() {
    updateExplanation();

    // Reset display for all matrix sections
    document.getElementById('transformMatrices').style.display = 'none';
    document.getElementById('transformedMatrices').style.display = 'none';
    document.getElementById('productMatrix').style.display = 'none';
    document.getElementById('convAnimation').style.display = 'none';

    switch (currentStep) {
        case 0: // Original matrices
            break;

        case 1: // Show transformation matrices
            document.getElementById('transformMatrices').style.display = 'flex';
            break;

        case 2: // Transform input using B
            document.getElementById('transformMatrices').style.display = 'flex';
            document.getElementById('transformedMatrices').style.display = 'flex';

            // Calculate transformed input: U = B^T * input * B
            transformedInput = matrixMultiply(transpose(B), matrixMultiply(input, B));
            fillMatrix(transformedInput, 'transformedInputMatrix', 'input');
            break;

        case 3: // Transform filter using G
            document.getElementById('transformMatrices').style.display = 'flex';
            document.getElementById('transformedMatrices').style.display = 'flex';

            // Keep showing transformed input
            fillMatrix(transformedInput, 'transformedInputMatrix', 'input');

            // Calculate transformed filter: V = G * filter * G^T
            transformedFilter = matrixMultiply(G, matrixMultiply(filter, transpose(G)));
            fillMatrix(transformedFilter, 'transformedFilterMatrix', 'filter');
            break;

        // Modified element-wise product calculation
        case 4: // Element-wise multiplication
            document.getElementById('transformedMatrices').style.display = 'flex';
            document.getElementById('productMatrix').style.display = 'flex';

            elementwiseProduct = [];
            for (let i = 0; i < 4; i++) {
                elementwiseProduct[i] = [];
                for (let j = 0; j < 4; j++) {
                    const val = transformedInput[i][j] * transformedFilter[i][j];
                    elementwiseProduct[i][j] = Math.round(val * 1000) / 1000;
                }
            }
            fillMatrix(elementwiseProduct, 'elementwiseProductMatrix', 'output');
            break;


        // Corrected final output calculation
        case 5: // Final output calculation
            document.getElementById('productMatrix').style.display = 'flex';

            // Perform matrix multiplications with rounding
            const intermediate = matrixMultiply(A, elementwiseProduct);
            output = matrixMultiply(intermediate, transpose(A));

            // Round final output values
            const roundedOutput = output.map(row =>
                row.map(val => Math.round(val * 1000) / 1000)
            );

            fillMatrix(roundedOutput, 'outputMatrix', 'output');
            break;
        case 6: // Direct convolution animation
            document.getElementById('convAnimation').style.display = 'flex';
            animationStep = 0;
            startConvolutionAnimation();
            break;
    }
}

function startConvolutionAnimation() {
    const kernelHighlight = document.getElementById('kernelHighlight');
    const animOutputMatrix = document.getElementById('animOutputMatrix');
    const outputCells = animOutputMatrix.getElementsByClassName('cell');

    // Reset output matrix
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            outputCells[i * 2 + j].textContent = '0';
            outputCells[i * 2 + j].classList.remove('active');
        }
    }

    // Set up kernel highlight
    const cellSize = 40; // match the CSS size
    kernelHighlight.style.width = `${3 * cellSize + 6}px`;
    kernelHighlight.style.height = `${3 * cellSize + 6}px`;

    let position = 0;
    clearInterval(animationInterval);

    animationInterval = setInterval(() => {
        // Position is 0, 1, 2, 3 for the 4 possible positions of the kernel
        const row = Math.floor(position / 2);
        const col = position % 2;

        // Position the highlight
        kernelHighlight.style.left = `${col * cellSize}px`;
        kernelHighlight.style.top = `${row * cellSize}px`;

        // Calculate convolution result for this position
        let sum = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                sum += input[row + i][col + j] * filter[i][j];
            }
        }

        // Update output
        outputCells[row * 2 + col].textContent = sum;
        outputCells[row * 2 + col].classList.add('active');

        // Move to next position or reset
        position++;
        if (position >= 4) {
            clearInterval(animationInterval);

            // Compare with Winograd result
            setTimeout(() => {
                const winograd = output.flat().map(x => Math.round(x * 1000) / 1000); // Round to 3 decimals
                const direct = Array.from(outputCells).map(cell => parseInt(cell.textContent));

                let match = true;
                for (let i = 0; i < 4; i++) {
                    if (Math.abs(winograd[i] - direct[i]) > 0.001) {
                        match = false;
                        break;
                    }
                }

                const stepDetail = document.getElementById('stepDetail');
                stepDetail.innerHTML += `<br><br><span class='highlight'>Verification: The direct convolution ${match ? 'matches' : 'does not match'} the Winograd result (Δ < 0.001).</span>`;
            }, 500);
        }
    }, 1500);
}

// Initialize everything
reset();