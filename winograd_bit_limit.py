import numpy as np

def main():
    # Current date: 2025-04-19 19:02:48
    # Author: Abhinav-gh
    
    print("Winograd Convolution F(2×2, 3×3) Bit-Width Analysis")
    print("=" * 50)
    
    # Define transformation matrices
    B_T = np.array([
        [1, 0, -1, 0],
        [0, 1, 1, 0],
        [0, -1, 1, 0],
        [0, 1, 0, -1]
    ], dtype=float)
    
    G = np.array([
        [1, 0, 0],
        [0.5, 0.5, 0.5],
        [0.5, -0.5, 0.5],
        [0, 0, 1]
    ], dtype=float)
    
    A_T = np.array([
        [1, 1, 1, 0],
        [0, 1, -1, -1]
    ], dtype=float)
    
    # Calculate and print row and column sums
    print("Matrix B_T:")
    print(B_T)
    print(f"Max absolute row sum: {max(np.sum(np.abs(B_T), axis=1))}")
    print(f"Max absolute column sum: {max(np.sum(np.abs(B_T), axis=0))}")
    print("\nMatrix G:")
    print(G)
    print(f"Max absolute row sum: {max(np.sum(np.abs(G), axis=1))}")
    print(f"Max absolute column sum: {max(np.sum(np.abs(G), axis=0))}")
    print("\nMatrix A_T:")
    print(A_T)
    print(f"Max absolute row sum: {max(np.sum(np.abs(A_T), axis=1))}")
    print(f"Max absolute column sum: {max(np.sum(np.abs(A_T), axis=0))}")
    
    # Create worst-case input and kernel
    print("\n1. Creating worst-case inputs:")
    
    # For input d, create a pattern that maximizes V
    # We need to align signs with B_T to get maximum values
    d = create_worst_case_input(B_T, 255)
    print(f"Input matrix d (max value: {np.max(d)}):")
    print(d)
    
    # For kernel g, create a pattern that maximizes U
    g = create_worst_case_kernel(G, 127, -128)
    print(f"Kernel matrix g (max absolute value: {np.max(np.abs(g))}):")
    print(g)
    
    # 2. Perform transformations
    print("\n2. Performing transformations:")
    
    # Transform input: V = B_T × d × B
    V = B_T @ d @ B_T.T
    print(f"V = B_T × d × B_T^T (max absolute value: {np.max(np.abs(V))}):")
    print(V)
    print(f"Bits required: {bit_width(np.max(np.abs(V)))}")
    print(f"Theoretical max: 2 × 255 × 3 = 1530")
    
    # Transform kernel: U = G × g × G^T
    U = G @ g @ G.T
    print(f"\nU = G × g × G^T (max absolute value: {np.max(np.abs(U))}):")
    print(U)
    print(f"Bits required: {bit_width(np.max(np.abs(U)))}")
    print(f"Theoretical max: 1.5 × 128 × 2 = 384")
    
    # Element-wise multiplication: M = U ⊙ V
    M = U * V
    print(f"\nM = U ⊙ V (max absolute value: {np.max(np.abs(M))}):")
    print(M)
    print(f"Bits required: {bit_width(np.max(np.abs(M)))}")
    print(f"Theoretical max: 384 × 1530 = 587,520")
    
    # Final output: Y = A_T × M × A
    Y = A_T @ M @ A_T.T
    print(f"\nY = A_T × M × A_T^T (max absolute value: {np.max(np.abs(Y))}):")
    print(Y)
    print(f"Bits required: {bit_width(np.max(np.abs(Y)))}")
    print(f"Theoretical max: 3 × 587,520 × 2 = 3,525,120")
    
    print("\n3. Summary:")
    print("-" * 50)
    print(f"V max: {np.max(np.abs(V))}, bits: {bit_width(np.max(np.abs(V)))}")
    print(f"U max: {np.max(np.abs(U))}, bits: {bit_width(np.max(np.abs(U)))}")
    print(f"M max: {np.max(np.abs(M))}, bits: {bit_width(np.max(np.abs(M)))}")
    print(f"Y max: {np.max(np.abs(Y))}, bits: {bit_width(np.max(np.abs(Y)))}")

def create_worst_case_input(B_T, max_val):
    """Create input matrix that maximizes values after transformation"""
    d = np.zeros((4, 4))
    
    # This is a simplified approach - a truly optimal pattern would
    # require analyzing the sign patterns in B_T × _ × B_T^T
    # For demonstration, we'll use the maximum value for all entries
    d.fill(max_val)
    
    return d

def create_worst_case_kernel(G, pos_max, neg_max):
    """Create kernel matrix that maximizes values after transformation"""
    g = np.zeros((3, 3))
    
    # Similar to input, a truly optimal pattern requires detailed analysis
    # For this example, we'll use a checkerboard pattern of max values
    for i in range(3):
        for j in range(3):
            if (i + j) % 2 == 0:
                g[i, j] = pos_max
            else:
                g[i, j] = neg_max
    
    return g

def bit_width(value):
    """Calculate minimum bits needed to represent a value"""
    if value <= 0:
        return 1
    return int(np.ceil(np.log2(value + 1)))

if __name__ == "__main__":
    main()