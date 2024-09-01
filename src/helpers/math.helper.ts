/**
 * 
 * @param min
 * @param max 
 * @returns A number from min to max included
 */
export const getRandomInteger = (min: number, max: number): number => {
    if (min > max) {
        throw new Error('min should not be greater than max');
    }

    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
};
