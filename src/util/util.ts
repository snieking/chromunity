export const uniqueId = function() {
    return Math.random().toString(36).substr(2, 16);
};
