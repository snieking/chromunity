import { timeAgoReadable, sortByFrequency, needsToBeSliced } from "../src/util/util";

jest.setTimeout(30000);

describe("Sorting by frequently tests", () => {

    it("list of strings", async () => {
        const fruits: string[] = [ "apple", "orange", "orange", "banana" ];
        const sortedFruits: string[] = sortByFrequency(fruits);

        expect(sortedFruits.length).toBe(3);
        expect(sortedFruits[0]).toBe("orange");
        expect(sortedFruits[1]).toBe("apple");
        expect(sortedFruits[2]).toBe("banana");
    });

});

describe("Sorting by frequently tests", () => {

    it("time ago to readable months", async () => {
        const monthInMillis: number = 2629743000;
        expect(timeAgoReadable(Date.now() - monthInMillis)).toBe("1 month ago");
        expect(timeAgoReadable(Date.now() - (monthInMillis * 2))).toBe("2 months ago");
    });

    it("time ago to readable days", async () => {
        const dayInMillis: number = 86400000;
        expect(timeAgoReadable(Date.now() - dayInMillis)).toBe("1 day ago");
        expect(timeAgoReadable(Date.now() - (dayInMillis * 2))).toBe("2 days ago");
    });

    it("time ago to readable hours", async () => {
        const hourInMillis: number = 3600000;
        expect(timeAgoReadable(Date.now() - hourInMillis)).toBe("1 hour ago");
        expect(timeAgoReadable(Date.now() - (hourInMillis * 2))).toBe("2 hours ago");
    });

    it("time ago to readable hours", async () => {
        const minuteInMillis: number = 60000;
        expect(timeAgoReadable(Date.now())).toBe("0 minutes ago");
        expect(timeAgoReadable(Date.now() - minuteInMillis)).toBe("1 minute ago");
        expect(timeAgoReadable(Date.now() - (minuteInMillis * 2))).toBe("2 minutes ago");
    });

});

describe("message should be sliced tests", () => {

    it("message longer than 300 chars should be sliced", async () => {
        expect(needsToBeSliced("a".repeat(350))).toBe(true);
    });

    it("message shorter than 300 chars should not be sliced", async () => {
        expect(needsToBeSliced("a".repeat(250))).toBe(false);
    });

    it("message with 300 chars should not be sliced", async () => {
        const message: string = "a".repeat(300);
        expect(message.length).toBe(300);
        expect(needsToBeSliced("a".repeat(300))).toBe(false);
    });

});