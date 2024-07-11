import 'jest'
import { getRandomInteger } from '../../src/helpers/math.helper'

describe('getRandomInteger', () => {
    it('should return a value between the specified min and max (inclusive)', () => {
        const min = 1;
        const max = 10;
        for (let i = 0; i < 100; i++) { // Loop per aumentare la probabilità di coprire l'intero intervallo
            const randomInt = getRandomInteger(min, max);
            expect(randomInt).toBeGreaterThanOrEqual(min);
            expect(randomInt).toBeLessThanOrEqual(max);
        }
    });

    it('should always return the same min value if min and max are equal', () => {
        const min = 5;
        const max = 5;
        for (let i = 0; i < 100; i++) {
            const randomInt = getRandomInteger(min, max);
            expect(randomInt).toBe(min);
        }
    });

    it('should handle negative values correctly', () => {
        const min = -10;
        const max = -1;
        for (let i = 0; i < 100; i++) {
            const randomInt = getRandomInteger(min, max);
            expect(randomInt).toBeGreaterThanOrEqual(min);
            expect(randomInt).toBeLessThanOrEqual(max);
        }
    });

    it('should return values within a small range correctly', () => {
        const min = 0;
        const max = 1;
        const results = new Set<number>();
        for (let i = 0; i < 100; i++) {
            results.add(getRandomInteger(min, max));
        }
        expect(results.size).toBe(2); // Dovrebbe contenere entrambi i valori 0 e 1
        expect(results).toContain(0);
        expect(results).toContain(1);
    });

    it('should throw an error if min is greater than max', () => {
        const min = 10;
        const max = 5;
        expect(() => getRandomInteger(min, max)).toThrow('min should not be greater than max');
    });
});