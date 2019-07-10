import { timeAgoReadable, sortByFrequency } from "../src/util/util";

jest.setTimeout(30000);

describe("Sorting by frequently tests", () => {

    it("list of strings", async done => {
        const fruits: string[] = [ "apple", "orange", "orange", "banana" ];
        const sortedFruits: string[] = sortByFrequency(fruits);

        expect(sortedFruits.length).toBe(3);
        expect(sortedFruits[0]).toBe("orange");
        expect(sortedFruits[1]).toBe("apple");
        expect(sortedFruits[2]).toBe("banana");

        done();
    });

});

describe("Sorting by frequently tests", () => {

    it("time ago to readable months", async done => {
        const monthInMillis: number = 2629743000;
        expect(timeAgoReadable(Date.now() - monthInMillis)).toBe("1 month ago");
        expect(timeAgoReadable(Date.now() - (monthInMillis * 2))).toBe("2 months ago");
        done();
    });

    it("time ago to readable days", async done => {
        const dayInMillis: number = 86400000;
        expect(timeAgoReadable(Date.now() - dayInMillis)).toBe("1 day ago");
        expect(timeAgoReadable(Date.now() - (dayInMillis * 2))).toBe("2 days ago");
        done();
    });

    it("time ago to readable hours", async done => {
        const hourInMillis: number = 3600000;
        expect(timeAgoReadable(Date.now() - hourInMillis)).toBe("1 hour ago");
        expect(timeAgoReadable(Date.now() - (hourInMillis * 2))).toBe("2 hours ago");
        done();
    });

    it("time ago to readable hours", async done => {
        const minuteInMillis: number = 60000;
        expect(timeAgoReadable(Date.now())).toBe("0 minutes ago");
        expect(timeAgoReadable(Date.now() - minuteInMillis)).toBe("1 minute ago");
        expect(timeAgoReadable(Date.now() - (minuteInMillis * 2))).toBe("2 minutes ago");
        done();
    });

});