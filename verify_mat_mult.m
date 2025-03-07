% Hardcoded matrices (4x4) for B^T, d, B

% Matrix B (4x4)
matrix_b = [
    1, 0, -1, 0;
    0, 1, 1, 0;
    0, -1, 1, 0;
    0, 1, 0, -1
];

% Matrix B^T (Transpose of B)
matrix_bt = matrix_b'; % Transpose operator in MATLAB is '

% Matrix d (4x4 - you can change these values)
matrix_d = [
    1, 2, 3, 4;
    5, 6, 7, 8;
    9, 10, 11, 12;
    13, 14, 15, 16
];

% Perform matrix multiplication (B^T * d * B)
result = matrix_bt * matrix_d * matrix_b;
result2 = matrix_bt * matrix_d;
% Display the results
disp('Matrix B^T:');
disp(matrix_bt);

disp('Matrix d:');
disp(matrix_d);

disp('Matrix B:');
disp(matrix_b);

disp('Result (B^T * d * B):');
disp(result);
disp('Result (B^T * d):');
disp(result2);

% Manual Verification (optional)
% Calculate B^T * d
temp_result = zeros(4,4);
for i = 1:4
    for j = 1:4
        for k = 1:4
            temp_result(i,j) = temp_result(i,j) + matrix_bt(i,k) * matrix_d(k,j);
        end
    end
end
% Calculate (B^T * d) * B
manual_result = zeros(4,4);
for i = 1:4
    for j = 1:4
        for k = 1:4
            manual_result(i,j) = manual_result(i,j) + temp_result(i,k) * matrix_b(k,j);
        end
    end
end

%Display Manual Verification
disp('Manual Verification (B^T * d * B):');
disp(manual_result);

%Verification using isequal.

if isequal(result, manual_result)
    disp('Matrix multiplication is correct!');
else
    disp('Matrix multiplication is incorrect!');
end

% Hardcoded matrices (4x3) for G
matrix_g = [
    1, 0, 0;
    0.5, 0.5, 0.5;
    0.5, -0.5, 0.5;
    0, 0, 1
];

% Hardcoded filter matrix (3x3)
filter_matrix = [
    1, 2, 1;
    0, 1, 0;
    1, 0, 1
];

% Calculate GT (Transpose of G)
matrix_gt = matrix_g';

% Perform matrix multiplication (G * Filter * GT)
result = matrix_g * filter_matrix * matrix_gt;

% Display the results
disp('Matrix G:');
disp(matrix_g);

disp('Filter Matrix:');
disp(filter_matrix);

disp('Matrix GT:');
disp(matrix_gt);

disp('Result (G * Filter * GT):');
disp(result);

% Manual Verification (optional)
% Calculate G * Filter
temp_result = zeros(4,3);
for i = 1:4
    for j = 1:3
        for k = 1:3
            temp_result(i,j) = temp_result(i,j) + matrix_g(i,k) * filter_matrix(k,j);
        end
    end
end
% Calculate (G * Filter) * GT
manual_result = zeros(4,4);
for i = 1:4
    for j = 1:4
        for k = 1:3
            manual_result(i,j) = manual_result(i,j) + temp_result(i,k) * matrix_gt(k,j);
        end
    end
end

%Display Manual Verification
disp('Manual Verification (G * Filter * GT):');
disp(manual_result);

%Verification using isequal.

if isequal(result, manual_result)
    disp('Matrix multiplication is correct!');
else
    disp('Matrix multiplication is incorrect!');
end

% Hardcoded matrices (4x4)
transformed_input = [
    1, 3, 4, -4;
    9, 11, 12, -12;
    13, 15, 16, -16;
    -13, -15, -16, 16
];

transformed_filter = [
    1, 2, 0, 1;
    1, 1.8, 0.3, 1;
    1, 1.3, 0.8, 1;
    1, 1, 1, 1
];

% Perform element-wise multiplication
elementwise_product = transformed_input .* transformed_filter; % Note the .* operator

% Display the results
disp('Transformed Input:');
disp(transformed_input);

disp('Transformed Filter:');
disp(transformed_filter);

disp('Element-wise Product:');
disp(elementwise_product);

% Manual Verification (optional)
manual_result = zeros(4,4);
for i = 1:4
    for j = 1:4
        manual_result(i,j) = transformed_input(i,j) * transformed_filter(i,j);
    end
end

%Display Manual Verification
disp('Manual Verification (Element-wise Product):');
disp(manual_result);

%Verification using isequal.

if isequal(elementwise_product, manual_result)
    disp('Element wise multiplication is correct!');
else
    disp('Element wise multiplication is incorrect!');
end

% Hardcoded M matrix (4x4)
M = [
    1, 6, 0, -4;
    9, 19.8, 3.6, -12;
    13, 19.5, 12.8, -16;
    -13, -15, -16, 16
];

% Hardcoded A matrix (2x4)
A = [
    1, 1, 1, 0;
    0, 1, -1, -1
];

% Calculate AT (Transpose of A)
AT = A';

% Perform matrix multiplication (A * M * AT)
output = A * M * AT;

% Display the results
disp('M Matrix:');
disp(M);

disp('A Matrix:');
disp(A);

disp('AT Matrix:');
disp(AT);

disp('Output (A * M * AT):');
disp(output);

% Manual Verification (optional)
% Calculate A * M
temp_result = A * M;

% Calculate (A * M) * AT
manual_result = temp_result * AT;

%Display Manual Verification
disp('Manual Verification (A * M * AT):');
disp(manual_result);

%Verification using isequal.

if isequal(output, manual_result)
    disp('Matrix multiplication is correct!');
else
    disp('Matrix multiplication is incorrect!');
end