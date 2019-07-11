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

const monthInMillis: number = 2629743000;
const dayInMillis: number = 86400000;
const hourInMillis: number = 3600000;
const minuteInMillis: number = 60000;

export function timeAgoReadable(timestamp: number): string {
    const timeAgo: number = Date.now() - timestamp;

    if (timeAgo >= monthInMillis) {
        const monthsAgo: number = Math.round(timeAgo / monthInMillis);
        return `${monthsAgo} ${monthsAgo === 1 ? "month" : "months"} ago`;
    } else if (timeAgo >= dayInMillis) {
        const daysAgo: number = Math.round(timeAgo / dayInMillis);
        return `${daysAgo} ${daysAgo === 1 ? "day" : "days"} ago`;
    } else if (timeAgo >= hourInMillis) {
        const hoursAgo: number = Math.round(timeAgo / hourInMillis);
        return `${hoursAgo} ${hoursAgo === 1 ? "hour" : "hours"} ago`;
    } else {
        const minutesAgo: number = Math.round(timeAgo / minuteInMillis);
        return `${minutesAgo} ${minutesAgo === 1 ? "minute" : "minutes"} ago`;
    }
}

export function needsToBeSliced(message: string): boolean {
    return message.length > 300;
}