export const uniqueId = function() {
    return Math.random().toString(36).substr(2, 16);
};

export function sortByFrequency(array: string[]): string[] {
    const frequency: any = {};

    array.forEach(function(value) { frequency[value] = 0; });

    const uniques = array.filter(function(value) {
        return ++frequency[value] === 1;
    });

    return uniques.sort(function(a, b) {
        return frequency[b] - frequency[a];
    });
}
