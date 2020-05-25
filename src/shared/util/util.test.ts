import {
  needsToBeSliced,
  printableMinutes,
  sortByFrequency,
  stringToHexColor,
  timeAgoReadable,
  parseTwitterUsername,
  parseLinkedinUsername,
  parseGithubUsername,
  parseFacebookUsername
} from "./util";
import { getTags, parseEmojis } from "./text-parsing";

jest.setTimeout(30000);

describe("Sorting by frequently tests", () => {

    it("list of strings", () => {
        const fruits: string[] = ["apple", "orange", "orange", "banana"];
        const sortedFruits: string[] = sortByFrequency(fruits);

        expect(sortedFruits.length).toBe(3);
        expect(sortedFruits[0]).toBe("orange");
        expect(sortedFruits[1]).toBe("apple");
        expect(sortedFruits[2]).toBe("banana");
    });

});

describe("get tags from string", () => {
    it("parse tags from string", () => {
        const s: string = "hello #world #you #should #try #chromia";
        const tags: string[] = getTags(s);
        expect(tags.length).toBe(5);
        expect(tags).toContain("#world");
        expect(tags).toContain("#you");
        expect(tags).toContain("#should");
        expect(tags).toContain("#try");
        expect(tags).toContain("#chromia");
    });

    it("parse tags from string without tags", () => {
        const s: string = "";
        const tags: string[] = getTags(s);
        expect(tags.length).toBe(0);
    })
});

describe("Sorting by frequently tests", () => {

    it("time ago to readable months", () => {
        const monthInMillis: number = 2629743000;
        expect(timeAgoReadable(Date.now() - monthInMillis)).toBe("1 month ago");
        expect(timeAgoReadable(Date.now() - (monthInMillis * 2))).toBe("2 months ago");
    });

    it("time ago to readable days", () => {
        const dayInMillis: number = 86400000;
        expect(timeAgoReadable(Date.now() - dayInMillis)).toBe("1 day ago");
        expect(timeAgoReadable(Date.now() - (dayInMillis * 2))).toBe("2 days ago");
    });

    it("time ago to readable hours", () => {
        const hourInMillis: number = 3600000;
        expect(timeAgoReadable(Date.now() - hourInMillis)).toBe("1 hour ago");
        expect(timeAgoReadable(Date.now() - (hourInMillis * 2))).toBe("2 hours ago");
    });

    it("time ago to readable hours", () => {
        const minuteInMillis: number = 60000;
        expect(timeAgoReadable(Date.now())).toBe("0 minutes ago");
        expect(timeAgoReadable(Date.now() - minuteInMillis)).toBe("1 minute ago");
        expect(timeAgoReadable(Date.now() - (minuteInMillis * 2))).toBe("2 minutes ago");
    });

});

describe("message should be sliced tests", () => {

    it("message longer than 300 chars should be sliced", () => {
        expect(needsToBeSliced("a".repeat(350))).toBe(true);
    });

    it("message shorter than 300 chars should not be sliced", () => {
        expect(needsToBeSliced("a".repeat(250))).toBe(false);
    });

    it("message with 300 chars should not be sliced", () => {
        const message: string = "a".repeat(300);
        expect(message.length).toBe(300);
        expect(needsToBeSliced("a".repeat(300))).toBe(false);
    });

});

describe("string to hex color", () => {

    it("hex starts with '#'", () => {
        const hex: string = stringToHexColor("hello");
        expect(hex.startsWith("#")).toBe(true);
    });

    it("hex is 7 chars", () => {
        const hex: string = stringToHexColor("hello");
        expect(hex.length).toBe(7);
    })
});

describe("emoji parsing", () => {

    it("parse smirk emoji", () => {
       expect(parseEmojis(":smirk:")).toBe("😏");
    });

    it("parse normal smiley emoji", () => {
        expect(parseEmojis(":D")).toBe("😃");
    });

    it("parse normal emoji with text around", () => {
        expect(parseEmojis("hej :D whatsup?")).toBe("hej 😃 whatsup?");
    });

    it("parse wink emoji", () => {
       expect(parseEmojis(";)")).toBe("😉");
    });

    it("parse expressionless emoji", () => {
        expect(parseEmojis(":|")).toBe("😑");
    });

    it("parse confounded emoji", () => {
        expect(parseEmojis(":s")).toBe("😖");
    });

    it("parse sweat_smile emoji", () => {
        expect(parseEmojis(":')")).toBe("😅");
    });

    it("parse stuck_out_tongue emoji", () => {
        expect(parseEmojis(":p")).toBe("😛");
    });

    it("parse open mouth emoji", () => {
        expect(parseEmojis(":o")).toBe("😮");
    });

});

describe("printable minutes", () => {

  it ("printable seconds", () => {
    expect(printableMinutes(40)).toBe("40s");
  });

  it("printable minutes and seconds", () => {
    expect(printableMinutes(61)).toBe("1m 1s");
  });

  it("printable minutes and seconds 2", () => {
    expect(printableMinutes(179)).toBe("2m 59s");
  });

});

describe("parse twitter user", () => {
  it("should parse just a username", () => {
    expect(parseTwitterUsername("snieking")).toBe("snieking");
  });

  it("should parse with @", () => {
    expect(parseTwitterUsername("@snieking")).toBe("snieking");
  });

  it("should parse link", () => {
    expect(parseTwitterUsername("https://twitter.com/snieking")).toBe("snieking");
  })

  it("should parse link with trailing slash", () => {
    expect(parseTwitterUsername("https://twitter.com/snieking/")).toBe("snieking");
  })
});

describe("parse linkedin user", () => {
  it("should parse just a username", () => {
    expect(parseLinkedinUsername("viktorplane")).toBe("viktorplane");
  });

  it("should parse with number", () => {
    expect(parseLinkedinUsername("viktorplane12")).toBe("viktorplane12");
  });

  it("should parse link", () => {
    expect(parseLinkedinUsername("https://www.linkedin.com/in/viktorplane")).toBe("viktorplane");
  });

  it("should parse link with trailing slash", () => {
    expect(parseLinkedinUsername("https://www.linkedin.com/in/viktorplane/")).toBe("viktorplane");
  });
});

describe("parse github user", () => {
  it("should parse just a username", () => {
    expect(parseGithubUsername("snieking")).toBe("snieking");
  });

  it("should parse with number", () => {
    expect(parseGithubUsername("snieking12")).toBe("snieking12");
  });

  it("should parse link", () => {
    expect(parseGithubUsername("https://github.com/snieking")).toBe("snieking");
  });

  it("should parse link with trailing slash", () => {
    expect(parseGithubUsername("https://github.com/snieking/")).toBe("snieking");
  });
});

describe("parse facebook user", () => {
  it("should parse just a username", () => {
    expect(parseFacebookUsername("viktorplane")).toBe("viktorplane");
  });

  it("should parse with a dot", () => {
    expect(parseFacebookUsername("viktor.plane12")).toBe("viktor.plane12");
  });

  it("should parse link", () => {
    expect(parseFacebookUsername("https://www.linkedin.com/in/viktor.plane")).toBe("viktor.plane");
  });

  it("should parse link with trailing slash", () => {
    expect(parseFacebookUsername("https://www.linkedin.com/in/viktor.plane/")).toBe("viktor.plane");
  });
});
