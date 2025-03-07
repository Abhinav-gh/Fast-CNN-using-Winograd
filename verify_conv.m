% Hardcoded input matrix (3x3)
input_matrix = [
    1, 2, 3;
    4, 5, 6;
    7, 8, 9
];

% Hardcoded filter matrix (2x2)
filter_matrix = [
    1, 2;
    0, 1
];

% Perform convolution using conv2 with 'valid' mode
conv2_result = conv2(input_matrix, filter_matrix, 'valid');

% Perform convolution manually (for verification)
[input_rows, input_cols] = size(input_matrix);
[filter_rows, filter_cols] = size(filter_matrix);
output_rows = input_rows - filter_rows + 1;
output_cols = input_cols - filter_cols + 1;

manual_result = zeros(output_rows, output_cols);

for i = 1:output_rows
    for j = 1:output_cols
        for m = 1:filter_rows
            for n = 1:filter_cols
                manual_result(i, j) = manual_result(i, j) + ...
                    input_matrix(i + m - 1, j + n - 1) * filter_matrix(m, n);
            end
        end
    end
end

% Print results
disp('Input Matrix:');
disp(input_matrix);
disp('Filter Matrix:');
disp(filter_matrix);
disp('conv2 Result (Convolution):');
disp(conv2_result);
disp('Manual Result (Convolution):');
disp(manual_result);

% Verification
if isequal(conv2_result, manual_result)
    disp('Convolution is correct!');
else
    disp('Convolution is incorrect!');
end