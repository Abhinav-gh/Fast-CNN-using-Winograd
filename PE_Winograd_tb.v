`timescale 1ns / 1ps

module PE_Winograd_tb;

    // Parameters
    parameter KERNEL_SIZE       = 3;
    parameter INPUT_TILE_SIZE   = 4;
    parameter INPUT_DATA_WIDTH  = 8;
    parameter KERNEL_DATA_WIDTH = 8;
    parameter CHANNELS          = 3;

    // Inputs
    reg clk;
    reg reset;
    reg [(KERNEL_SIZE * KERNEL_SIZE * KERNEL_DATA_WIDTH * CHANNELS) - 1 : 0] Kernel;
    reg [(INPUT_TILE_SIZE * INPUT_TILE_SIZE * INPUT_DATA_WIDTH * CHANNELS) - 1 : 0] inpData;

    // Output
    wire [(INPUT_TILE_SIZE - KERNEL_SIZE) * (INPUT_TILE_SIZE - KERNEL_SIZE) * (KERNEL_DATA_WIDTH + INPUT_DATA_WIDTH + 8) - 1 : 0] outData;

    // Instantiate the Processing Element module
    PE #(
        .KERNEL_SIZE(KERNEL_SIZE),
        .INPUT_TILE_SIZE(INPUT_TILE_SIZE),
        .INPUT_DATA_WIDTH(INPUT_DATA_WIDTH),
        .KERNEL_DATA_WIDTH(KERNEL_DATA_WIDTH),
        .CHANNELS(CHANNELS)
    ) uut (
        .clk(clk),
        .reset(reset),
        .Kernel(Kernel),
        .inpData(inpData),
        .outData(outData)
    );

    // Clock generation
    always #5 clk = ~clk; // 10ns clock period

    // Test procedure
    initial begin
        // Initialize signals
        clk = 0;
        reset = 1;
        Kernel = 0;
        inpData = 0;
        
        // Apply reset
        #20 reset = 0;
        
        // Apply test kernel values
        Kernel = {8'd1, 8'd2, 8'd1, 8'd0, 8'd1, 8'd0, 8'd1, 8'd0, 8'd1}; // Example kernel values
        
        // Apply test input data values
        inpData = {8'd1, 8'd2, 8'd3, 8'd4, 8'd5, 8'd6, 8'd7, 8'd8, 8'd9, 8'd10, 8'd11, 8'd12, 8'd13, 8'd14, 8'd15, 8'd16}; // Example input

        // Wait for processing
        #100;
        
        // Display the results
        $display("Output Data: %h", outData);
        
        // Finish simulation
        #50 $finish;
    end

endmodule
