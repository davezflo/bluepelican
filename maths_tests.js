import { Matrix4x4 } from './maths';

describe('Matrix4x4', () => {
    let matrix;

    beforeEach(() => {
        matrix = new Matrix4x4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
    });

    test('constructor', () => {
        expect(matrix.a1).toBe(1);
        expect(matrix.b1).toBe(2);
        // ... rest of the properties
        expect(matrix.z).toBe(0);
    });

    test('rotateX', () => {
        const theta = Math.PI / 4; // 45 degrees
        matrix.rotateX(theta);
        expect(matrix.xTheta).toBe(theta);
        expect(matrix.a1).toBe(1);
        expect(matrix.b1).toBe(0);
        // ... rest of the properties
    });

    test('rotateY', () => {
        const theta = Math.PI / 4; // 45 degrees
        matrix.rotateY(theta);
        expect(matrix.yTheta).toBe(theta);
        expect(matrix.a1).toBe(Math.cos(theta));
        expect(matrix.b1).toBe(0);
        // ... rest of the properties
    });

    // Add more tests for other methods
});