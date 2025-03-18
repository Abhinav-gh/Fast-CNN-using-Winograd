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
let transformationAnimationStep = 0;
let transformationInterval;
let transformationActive = false;

// Modify the createMatrixElement function
function createMatrixElement(rows, cols, elementId, className) {
    const matrixDiv = document.getElementById(elementId);
    matrixDiv.style.gridTemplateColumns = `repeat(${cols}, 40px)`;
    matrixDiv.innerHTML = '';

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement('div');
            cell.className = `cell ${className}`;
            cell.dataset.row = i;
            cell.dataset.col = j;
            matrixDiv.appendChild(cell);
        }
    }
}

function fillMatrix(matrixData, elementId, className, randomize = false) {
    const matrixDiv = document.getElementById(elementId);
    const cells = matrixDiv.getElementsByClassName('cell');
    let idx = 0;

    for (let i = 0; i < matrixData.length; i++) {
        for (let j = 0; j < matrixData[i].length; j++) {
            if (randomize) {
                // Update the data matrix with random values
                if (className === 'input') {
                    matrixData[i][j] = Math.floor(Math.random() * 5);
                } else if (className === 'filter') {
                    matrixData[i][j] = Math.floor(Math.random() * 3);
                }
            }
            if (cells[idx]) {
                cells[idx].textContent = matrixData[i][j];
                cells[idx].className = `cell ${className}`;
            }
            idx++;
        }
    }
    return matrixData;
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
    // Create DOM structures
    createMatrixElement(4, 4, 'inputMatrix', 'input');
    createMatrixElement(3, 3, 'filterMatrix', 'filter');
    createMatrixElement(2, 2, 'outputMatrix', 'output');
    createMatrixElement(4, 2, 'aMatrixT', 'transform'); // AT is 4x2 (transpose of 2x4 A)

    // Initialize data matrices with numerical values
    input = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16]
    ];
    filter = [
        [1, 2, 1],
        [0, 1, 0],
        [1, 0, 1]
    ];

    // Fill DOM elements
    fillMatrix(input, 'inputMatrix', 'input');
    fillMatrix(filter, 'filterMatrix', 'filter');
    fillMatrix([[0,0],[0,0]], 'outputMatrix', 'output');

    // Create transformation matrices
    createMatrixElement(4, 4, 'bMatrix', 'transform');
    createMatrixElement(4, 3, 'gMatrix', 'transform');
    createMatrixElement(2, 4, 'aMatrix', 'transform');

    // Create transformed matrices
    createMatrixElement(4, 4, 'transformedInputMatrix', 'input');
    createMatrixElement(4, 4, 'transformedFilterMatrix', 'filter');
    
    // Create intermediate transformation matrices for animation
    createMatrixElement(4, 4, 'interBTInput', 'transform');
    createMatrixElement(3, 4, 'interFilterGT', 'transform');

    // Create element-wise product matrix
    createMatrixElement(4, 4, 'elementwiseProductMatrix', 'output');
    
    // Create inverse transform intermediate matrices
    createMatrixElement(2, 4, 'interAProduct', 'transform');

    // Animation matrices
    createMatrixElement(4, 4, 'animInputMatrix', 'input');
    createMatrixElement(2, 2, 'animOutputMatrix', 'output');

    // // Fill with values
    // input = fillMatrix([
    //     [1, 2, 3, 4],
    //     [5, 6, 7, 8],
    //     [9, 10, 11, 12],
    //     [13, 14, 15, 16]
    // ], 'inputMatrix', 'input');

    // filter = fillMatrix([
    //     [1, 2, 1],
    //     [0, 1, 0],
    //     [1, 0, 1]
    // ], 'filterMatrix', 'filter');

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
    clearInterval(transformationInterval);
    currentStep = 0;
    animationStep = 0;
    transformationAnimationStep = 0;
    transformationActive = false;

    // Hide all extra matrix rows
    document.getElementById('transformMatrices').style.display = 'none';
    document.getElementById('transformedMatrices').style.display = 'none';
    document.getElementById('intermediateMatrices').style.display = 'none';
    document.getElementById('productMatrix').style.display = 'none';
    document.getElementById('inverseTransformMatrices').style.display = 'none';
    document.getElementById('convAnimation').style.display = 'none';
    
    // Reset animation controls
    document.getElementById('animationControls').style.display = 'none';
    document.getElementById('transformationStatus').textContent = '';

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
    clearInterval(transformationInterval);
    transformationActive = false;
    document.getElementById('transformationStatus').textContent = '';
    document.getElementById('animationControls').style.display = 'none';
    
    if (currentStep > 0) {
        currentStep--;
        updateStepDisplay();
    }
}

function nextStep() {
    clearInterval(animationInterval);
    clearInterval(transformationInterval);
    transformationActive = false;
    document.getElementById('transformationStatus').textContent = '';
    document.getElementById('animationControls').style.display = 'none';
    
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
    document.getElementById('intermediateMatrices').style.display = 'none';
    document.getElementById('productMatrix').style.display = 'none';
    document.getElementById('inverseTransformMatrices').style.display = 'none';
    document.getElementById('convAnimation').style.display = 'none';
    document.getElementById('animationControls').style.display = 'none';

    switch (currentStep) {
        case 0: // Original matrices
            break;

        case 1: // Show transformation matrices
            document.getElementById('transformMatrices').style.display = 'flex';
            break;

        case 2: // Transform input using B
            const BT = transpose(B);
            // const BTinput = matrixMultiply(BT, input);
            const BTinput = matrixMultiply(B,input);
            transformedInput = matrixMultiply(BTinput, BT);
            // Ensure these are 4x4 matrices
            if (BTinput.length === 4 && BTinput[0].length === 4 &&
                transformedInput.length === 4 && transformedInput[0].length === 4) {
                fillMatrix(BTinput, 'interBTInput', 'transform');
                fillMatrix(transformedInput, 'transformedInputMatrix', 'input');
            }
            break;

        case 3: // Transform filter using G
            document.getElementById('transformMatrices').style.display = 'flex';
            document.getElementById('transformedMatrices').style.display = 'flex';
            document.getElementById('intermediateMatrices').style.display = 'flex';
            document.getElementById('animationControls').style.display = 'flex';

            // Keep showing transformed input
            fillMatrix(transformedInput, 'transformedInputMatrix', 'input');
            
            // Show intermediate calculation filter * G^T
            const GT = transpose(G);
            fillMatrix(GT, 'gMatrixT', 'transform');
            
            const filterGT = matrixMultiply(filter, GT);
            fillMatrix(filterGT, 'interFilterGT', 'transform');
            
            // Calculate transformed filter: V = G * filter * G^T
            transformedFilter = matrixMultiply(G, filterGT);
            fillMatrix(transformedFilter, 'transformedFilterMatrix', 'filter');
            break;

        case 4: // Element-wise multiplication
            document.getElementById('transformedMatrices').style.display = 'flex';
            document.getElementById('productMatrix').style.display = 'flex';
            document.getElementById('animationControls').style.display = 'flex';

            elementwiseProduct = [];
            for (let i = 0; i < 4; i++) {
                elementwiseProduct[i] = [];
                for (let j = 0; j < 4; j++) {
                    const val = transformedInput[i][j] * transformedFilter[i][j];
                    elementwiseProduct[i][j] = val;
                }
            }
            fillMatrix(elementwiseProduct, 'elementwiseProductMatrix', 'output');
            break;

        case 5: // Final output calculation
            document.getElementById('productMatrix').style.display = 'flex';
            document.getElementById('inverseTransformMatrices').style.display = 'flex';
            document.getElementById('animationControls').style.display = 'flex';

            // Show the A matrix and A transpose
            const AT = transpose(A);
            fillMatrix(AT, 'aMatrixT', 'transform');
            
            // Show intermediate A * M
            const AM = matrixMultiply(A, elementwiseProduct);
            fillMatrix(AM, 'interAProduct', 'transform');
            
            // Perform final matrix multiplication
            output = matrixMultiply(AM, AT);

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

function startTransformationAnimation() {
    if (transformationActive) {
        clearInterval(transformationInterval);
        transformationActive = false;
        document.getElementById('transformationStatus').textContent = 'Animation paused';
        document.getElementById('animateBtn').textContent = 'Resume Animation';
        return;
    }
    
    transformationActive = true;
    document.getElementById('animateBtn').textContent = 'Pause Animation';
    
    switch(currentStep) {
        case 2:
            animateInputTransformation();
            break;
        case 3:
            animateFilterTransformation();
            break;
        case 4:
            animateElementwiseMultiplication();
            break;
        case 5:
            animateInverseTransformation();
            break;
    }
}

function animateInputTransformation() {
    const BT = transpose(B);
    const inputCells = document.getElementById('inputMatrix').getElementsByClassName('cell');
    const btCells = document.getElementById('bMatrixT').getElementsByClassName('cell');
    const bCells = document.getElementById('bMatrix').getElementsByClassName('cell');
    const intermediateCells = document.getElementById('interBTInput').getElementsByClassName('cell');
    const resultCells = document.getElementById('transformedInputMatrix').getElementsByClassName('cell');
    
    // Reset all highlights
    Array.from(inputCells).forEach(cell => cell.classList.remove('active'));
    Array.from(btCells).forEach(cell => cell.classList.remove('active'));
    Array.from(bCells).forEach(cell => cell.classList.remove('active'));
    Array.from(intermediateCells).forEach(cell => cell.classList.remove('active'));
    Array.from(resultCells).forEach(cell => cell.classList.remove('active'));
    
    const BTinput = matrixMultiply(BT, input);
    const transformedInput = matrixMultiply(BTinput, B);
    
    let animPhase = 0; // 0: BT*input, 1: (BT*input)*B
    let currentRow = 0;
    let currentCol = 0;
    
    transformationAnimationStep = 0;
    document.getElementById('transformationStatus').textContent = 'Animating BᵀX calculation...';
    
    clearInterval(transformationInterval);
    transformationInterval = setInterval(() => {
        if (!transformationActive) return;
        
        // Reset previous highlights
        Array.from(inputCells).forEach(cell => cell.classList.remove('active'));
        Array.from(btCells).forEach(cell => cell.classList.remove('active'));
        Array.from(bCells).forEach(cell => cell.classList.remove('active'));
        Array.from(intermediateCells).forEach(cell => cell.classList.remove('active'));
        Array.from(resultCells).forEach(cell => cell.classList.remove('active'));
        
        if (animPhase === 0) {
            for (let k = 0; k < 4; k++) {
                const btCellIndex = currentRow * 4 + k;
                if (btCells[btCellIndex]) btCells[btCellIndex].classList.add('active');
                
                const inputCellIndex = k * 4 + currentCol;
                if (inputCells[inputCellIndex]) inputCells[inputCellIndex].classList.add('active');
            }
            const intermediateIndex = currentRow * 4 + currentCol;
            if (intermediateCells[intermediateIndex]) intermediateCells[intermediateIndex].classList.add('active');
        } else { // (BT*input)*B calculation
            // Highlight current intermediate row
            for (let k = 0; k < 4; k++) {
                intermediateCells[currentRow * 4 + k].classList.add('active');
                // Highlight current B column
                bCells[k * 4 + currentCol].classList.add('active');
            }
            
            // Highlight result cell
            resultCells[currentRow * 4 + currentCol].classList.add('active');
            
            currentCol++;
            if (currentCol >= 4) {
                currentCol = 0;
                currentRow++;
                if (currentRow >= 4) {
                    clearInterval(transformationInterval);
                    transformationActive = false;
                    document.getElementById('transformationStatus').textContent = 'Input transformation complete!';
                    document.getElementById('animateBtn').textContent = 'Animate Again';
                    
                    // Show all results
                    fillMatrix(BTinput, 'interBTInput', 'transform');
                    fillMatrix(transformedInput, 'transformedInputMatrix', 'input');
                }
            }
        }
        
        transformationAnimationStep++;
    }, 500);
}

function animateFilterTransformation() {
    const GT = transpose(G);
    const filterCells = document.getElementById('filterMatrix').getElementsByClassName('cell');
    const gCells = document.getElementById('gMatrix').getElementsByClassName('cell');
    const gtCells = document.getElementById('gMatrixT').getElementsByClassName('cell');
    const intermediateCells = document.getElementById('interFilterGT').getElementsByClassName('cell');
    const resultCells = document.getElementById('transformedFilterMatrix').getElementsByClassName('cell');
    
    // Reset all highlights
    Array.from(filterCells).forEach(cell => cell.classList.remove('active'));
    Array.from(gCells).forEach(cell => cell.classList.remove('active'));
    Array.from(gtCells).forEach(cell => cell.classList.remove('active'));
    Array.from(intermediateCells).forEach(cell => cell.classList.remove('active'));
    Array.from(resultCells).forEach(cell => cell.classList.remove('active'));
    
    const filterGT = matrixMultiply(filter, GT);
    const transformedFilter = matrixMultiply(G, filterGT);
    
    let animPhase = 0; // 0: filter*GT, 1: G*(filter*GT)
    let currentRow = 0;
    let currentCol = 0;
    
    transformationAnimationStep = 0;
    document.getElementById('transformationStatus').textContent = 'Animating filter*Gᵀ calculation...';
    
    clearInterval(transformationInterval);
    transformationInterval = setInterval(() => {
        if (!transformationActive) return;

        // Reset highlights with safety checks
        Array.from(filterCells).forEach(cell => cell?.classList?.remove('active'));
        Array.from(gCells).forEach(cell => cell?.classList?.remove('active'));
        Array.from(gtCells).forEach(cell => cell?.classList?.remove('active'));
        Array.from(intermediateCells).forEach(cell => cell?.classList?.remove('active'));
        Array.from(resultCells).forEach(cell => cell?.classList?.remove('active'));

        if (animPhase === 0) {
            // Only highlight valid cells for 3x3 filter and 4x3 G matrix
            if (currentRow < 3 && currentCol < 4) {
                for (let k = 0; k < 3; k++) {
                    const filterIdx = currentRow * 3 + k;
                    const gtIdx = k * 4 + currentCol;
                    if (filterCells[filterIdx]) filterCells[filterIdx].classList.add('active');
                    if (gtCells[gtIdx]) gtCells[gtIdx].classList.add('active');
                }
                const intermediateIdx = currentRow * 4 + currentCol;
                if (intermediateCells[intermediateIdx]) intermediateCells[intermediateIdx].classList.add('active');
            }
            
            currentCol++;
            if (currentCol >= 4) {
                currentCol = 0;
                currentRow++;
                if (currentRow >= 3) {
                    animPhase = 1;
                    currentRow = 0;
                    currentCol = 0;
                    document.getElementById('transformationStatus').textContent = 'Animating G*(filter*Gᵀ) calculation...';
                }
            }
        } else {
            // Handle G matrix multiplication phase
            if (currentRow < 4 && currentCol < 4) {
                for (let k = 0; k < 3; k++) {
                    const gIdx = currentRow * 3 + k;
                    const intermediateIdx = k * 4 + currentCol;
                    if (gCells[gIdx]) gCells[gIdx].classList.add('active');
                    if (intermediateCells[intermediateIdx]) intermediateCells[intermediateIdx].classList.add('active');
                }
                const resultIdx = currentRow * 4 + currentCol;
                if (resultCells[resultIdx]) resultCells[resultIdx].classList.add('active');
            }
            
            currentCol++;
            if (currentCol >= 4) {
                currentCol = 0;
                currentRow++;
                if (currentRow >= 4) {
                    clearInterval(transformationInterval);
                    transformationActive = false;
                    document.getElementById('transformationStatus').textContent = 'Filter transformation complete!';
                    document.getElementById('animateBtn').textContent = 'Animate Again';
                    
                    // Show all results
                    fillMatrix(filterGT, 'interFilterGT', 'transform');
                    fillMatrix(transformedFilter, 'transformedFilterMatrix', 'filter');
                }
            }
        }
        
        transformationAnimationStep++;
    }, 500);
}

function animateElementwiseMultiplication() {
    const inputCells = document.getElementById('transformedInputMatrix').getElementsByClassName('cell');
    const filterCells = document.getElementById('transformedFilterMatrix').getElementsByClassName('cell');
    const resultCells = document.getElementById('elementwiseProductMatrix').getElementsByClassName('cell');
    
    // Reset all highlights
    Array.from(inputCells).forEach(cell => cell.classList.remove('active'));
    Array.from(filterCells).forEach(cell => cell.classList.remove('active'));
    Array.from(resultCells).forEach(cell => cell.classList.remove('active'));
    
    let currentRow = 0;
    let currentCol = 0;
    
    transformationAnimationStep = 0;
    document.getElementById('transformationStatus').textContent = 'Animating element-wise multiplication...';
    
    clearInterval(transformationInterval);
    transformationInterval = setInterval(() => {
        if (!transformationActive) return;
        
        // Reset previous highlights
        Array.from(inputCells).forEach(cell => cell.classList.remove('active'));
        Array.from(filterCells).forEach(cell => cell.classList.remove('active'));
        Array.from(resultCells).forEach(cell => cell.classList.remove('active'));
        
        // Highlight current cells
        const idx = currentRow * 4 + currentCol;
        inputCells[idx].classList.add('active');
        filterCells[idx].classList.add('active');
        resultCells[idx].classList.add('active');
        
        currentCol++;
        if (currentCol >= 4) {
            currentCol = 0;
            currentRow++;
            if (currentRow >= 4) {
                clearInterval(transformationInterval);
                transformationActive = false;
                document.getElementById('transformationStatus').textContent = 'Element-wise multiplication complete!';
                document.getElementById('animateBtn').textContent = 'Animate Again';
            }
        }
        
        transformationAnimationStep++;
    }, 300);
}

function animateInverseTransformation() {
    const AT = transpose(A);
    const productCells = document.getElementById('elementwiseProductMatrix').getElementsByClassName('cell');
    const aCells = document.getElementById('aMatrix').getElementsByClassName('cell');
    const atCells = document.getElementById('aMatrixT').getElementsByClassName('cell');
    const intermediateCells = document.getElementById('interAProduct').getElementsByClassName('cell');
    const resultCells = document.getElementById('outputMatrix').getElementsByClassName('cell');
    
    // Reset all highlights
    Array.from(productCells).forEach(cell => cell.classList.remove('active'));
    Array.from(aCells).forEach(cell => cell.classList.remove('active'));
    Array.from(atCells).forEach(cell => cell.classList.remove('active'));
    Array.from(intermediateCells).forEach(cell => cell.classList.remove('active'));
    Array.from(resultCells).forEach(cell => cell.classList.remove('active'));
    
    const AM = matrixMultiply(A, elementwiseProduct);
    const finalOutput = matrixMultiply(AM, AT);
    
    let animPhase = 0; // 0: A*M, 1: (A*M)*AT
    let currentRow = 0;
    let currentCol = 0;
    
    transformationAnimationStep = 0;
    document.getElementById('transformationStatus').textContent = 'Animating A*M calculation...';
    
    clearInterval(transformationInterval);
    transformationInterval = setInterval(() => {
        if (!transformationActive) return;
        
        // Reset previous highlights
        Array.from(productCells).forEach(cell => cell.classList.remove('active'));
        Array.from(aCells).forEach(cell => cell.classList.remove('active'));
        Array.from(atCells).forEach(cell => cell.classList.remove('active'));
        Array.from(intermediateCells).forEach(cell => cell.classList.remove('active'));
        Array.from(resultCells).forEach(cell => cell.classList.remove('active'));
        
        if (animPhase === 0) { // A*M calculation
            // Highlight current A row
            for (let k = 0; k < 4; k++) {
                aCells[currentRow * 4 + k].classList.add('active');
                // Highlight current M column
                productCells[k * 4 + currentCol].classList.add('active');
            }
            
            // Highlight result cell
            intermediateCells[currentRow * 4 + currentCol].classList.add('active');
            
            currentCol++;
            if (currentCol >= 4) {
                currentCol = 0;
                currentRow++;
                if (currentRow >= 2) {
                    animPhase = 1;
                    currentRow = 0;
                    currentCol = 0;
                    document.getElementById('transformationStatus').textContent = 'Animating (A*M)*Aᵀ calculation...';
                }
            }
        } else { // (A*M)*AT calculation
            // Highlight current intermediate row
            for (let k = 0; k < 4; k++) {
                intermediateCells[currentRow * 4 + k].classList.add('active');
                // Highlight current AT column
                atCells[k * 2 + currentCol].classList.add('active');
            }
            
            // Highlight result cell
            resultCells[currentRow * 2 + currentCol].classList.add('active');
            
            currentCol++;
            if (currentCol >= 2) {
                currentCol = 0;
                currentRow++;
                if (currentRow >= 2) {
                    clearInterval(transformationInterval);
                    transformationActive = false;
                    document.getElementById('transformationStatus').textContent = 'Inverse transformation complete!';
                    document.getElementById('animateBtn').textContent = 'Animate Again';
                    
                    // Show all results
                    fillMatrix(AM, 'interAProduct', 'transform');
                    fillMatrix(finalOutput, 'outputMatrix', 'output');
                }
            }
        }
        
        transformationAnimationStep++;
    }, 500);
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
            document.getElementById('transformationStatus').textContent = 'Convolution complete!';
        }
    }, 1000);
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function() {
    setupMatrices();
    updateExplanation();
    
    // Add event listeners to buttons
    document.getElementById('prevBtn').addEventListener('click', prevStep);
    document.getElementById('nextBtn').addEventListener('click', nextStep);
    document.getElementById('resetBtn').addEventListener('click', reset);
    document.getElementById('animateBtn').addEventListener('click', startTransformationAnimation);
    
    // Add event listener for randomize button
    document.getElementById('randomizeBtn').addEventListener('click', function() {
        // Generate new input data
        input = Array.from({length:4}, () => 
            Array.from({length:4}, () => Math.floor(Math.random() * 5))
        );
        fillMatrix(input, 'inputMatrix', 'input');
    
        // Generate new filter data
        filter = Array.from({length:3}, () => 
            Array.from({length:3}, () => Math.floor(Math.random() * 3))
        );
        fillMatrix(filter, 'filterMatrix', 'filter');
    
        // Reset output
        output = [[0,0],[0,0]];
        fillMatrix(output, 'outputMatrix', 'output');
    });
});

// Helper function to generate HTML for the visualization
function generateVisualizationHTML() {
    return `
    <div class="container">
        <h1>Winograd Convolution Algorithm Visualization</h1>
        
        <div class="controls">
            <button id="prevBtn">Previous Step</button>
            <button id="nextBtn">Next Step</button>
            <button id="resetBtn">Reset</button>
            <button id="randomizeBtn">Randomize Data</button>
        </div>
        
        <div class="explanation-box">
            <h2 id="explanation">Step 1: Original input (4x4) and filter (3x3)</h2>
            <p id="stepDetail"></p>
        </div>
        
        <!-- Original Matrices -->
        <div id="originalMatrices" class="matrix-row">
            <div class="matrix-container">
                <h3>Input (4x4)</h3>
                <div id="inputMatrix" class="matrix"></div>
            </div>
            
            <div class="matrix-container">
                <h3>Filter (3x3)</h3>
                <div id="filterMatrix" class="matrix"></div>
            </div>
            
            <div class="matrix-container">
                <h3>Output (2x2)</h3>
                <div id="outputMatrix" class="matrix"></div>
            </div>
        </div>
        
        <!-- Transformation Matrices -->
        <div id="transformMatrices" class="matrix-row" style="display: none;">
            <div class="matrix-container">
                <h3>B Matrix (4x4)</h3>
                <div id="bMatrix" class="matrix"></div>
            </div>
            
            <div class="matrix-container">
                <h3>G Matrix (4x3)</h3>
                <div id="gMatrix" class="matrix"></div>
            </div>
            
            <div class="matrix-container">
                <h3>A Matrix (2x4)</h3>
                <div id="aMatrix" class="matrix"></div>
            </div>
        </div>
        
        <!-- Transformed Matrices -->
        <div id="transformedMatrices" class="matrix-row" style="display: none;">
            <div class="matrix-container">
                <h3>Transformed Input</h3>
                <div id="transformedInputMatrix" class="matrix"></div>
            </div>
            
            <div class="matrix-container">
                <h3>Transformed Filter</h3>
                <div id="transformedFilterMatrix" class="matrix"></div>
            </div>
        </div>
        
        <!-- Intermediate matrices for animation -->
        <div id="intermediateMatrices" class="matrix-row" style="display: none;">
            <div class="matrix-container">
                <h3>B<sup>T</sup> Matrix</h3>
                <div id="bMatrixT" class="matrix"></div>
            </div>
            
            <div class="matrix-container">
                <h3>B<sup>T</sup> × Input</h3>
                <div id="interBTInput" class="matrix"></div>
            </div>
            
            <div class="matrix-container">
                <h3>G<sup>T</sup> Matrix</h3>
                <div id="gMatrixT" class="matrix"></div>
            </div>
            
            <div class="matrix-container">
                <h3>Filter × G<sup>T</sup></h3>
                <div id="interFilterGT" class="matrix"></div>
            </div>
        </div>
        
        <!-- Element-wise Product Matrix -->
        <div id="productMatrix" class="matrix-row" style="display: none;">
            <div class="matrix-container">
                <h3>Element-wise Product</h3>
                <div id="elementwiseProductMatrix" class="matrix"></div>
            </div>
        </div>
        
        <!-- Inverse Transform Matrices -->
        <div id="inverseTransformMatrices" class="matrix-row" style="display: none;">
            <div class="matrix-container">
                <h3>A<sup>T</sup> Matrix</h3>
                <div id="aMatrixT" class="matrix"></div>
            </div>
            
            <div class="matrix-container">
                <h3>A × Product</h3>
                <div id="interAProduct" class="matrix"></div>
            </div>
        </div>
        
        <!-- Direct Convolution Animation -->
        <div id="convAnimation" class="matrix-row" style="display: none;">
            <div class="matrix-container">
                <h3>Direct Convolution</h3>
                <div class="animation-container">
                    <div id="animInputMatrix" class="matrix"></div>
                    <div id="kernelHighlight"></div>
                </div>
            </div>
            
            <div class="matrix-container">
                <h3>Convolution Result</h3>
                <div id="animOutputMatrix" class="matrix"></div>
            </div>
        </div>
        
        <!-- Animation Controls -->
        <div id="animationControls" class="controls" style="display: none;">
            <button id="animateBtn">Animate Transformation</button>
            <div id="transformationStatus"></div>
        </div>
    </div>
    `;
}

// CSS for the visualization
function getVisualizationCSS() {
    return `
    .container {
        font-family: Arial, sans-serif;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }

    h1 {
        text-align: center;
        color: #333;
    }

    .controls {
        display: flex;
        justify-content: center;
        margin: 20px 0;
        gap: 10px;
    }

    button {
        padding: 8px 16px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    }

    button:hover {
        background-color: #45a049;
    }

    .explanation-box {
        background-color: #f9f9f9;
        border: 1px solid #ddd;
        padding: 15px;
        margin-bottom: 20px;
        border-radius: 5px;
    }

    .explanation-box h2 {
        margin-top: 0;
        color: #333;
    }

    .formula {
        font-family: 'Times New Roman', Times, serif;
        font-style: italic;
        font-size: 1.1em;
        margin: 10px 0;
    }

    .matrix-row {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        margin-bottom: 30px;
        gap: 20px;
    }

    .matrix-container {
        margin: 0 10px;
    }

    .matrix-container h3 {
        text-align: center;
        margin-bottom: 10px;
        color: #333;
    }

    .matrix {
        display: grid;
        gap: 2px;
        background-color: #f0f0f0;
        padding: 3px;
        border-radius: 4px;
    }

    .cell {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: monospace;
        font-size: 14px;
        border-radius: 2px;
    }

    .input {
        background-color: #e3f2fd;
    }

    .filter {
        background-color: #ffebee;
    }

    .output {
        background-color: #e8f5e9;
    }

    .transform {
        background-color: #fff9c4;
    }

    .active {
        box-shadow: 0 0 0 2px #ff5722;
        background-color: #fff3e0;
        font-weight: bold;
        z-index: 1;
    }

    .animation-container {
        position: relative;
    }

    #kernelHighlight {
        position: absolute;
        border: 3px dashed #ff5722;
        pointer-events: none;
        z-index: 2;
    }

    #transformationStatus {
        margin-left: 10px;
        padding: 8px;
        color: #333;
        font-style: italic;
    }
    `;
}