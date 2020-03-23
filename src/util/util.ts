import { Topic } from "../types";
import { Stopwatch } from "ts-stopwatch";
import { useEffect, useRef } from "react";

export const createStopwatchStarted = (): Stopwatch => {
  const sw = new Stopwatch();
  sw.start();
  return sw;
};

export const stopStopwatch = (sw: Stopwatch): number => {
  sw.stop();
  return sw.getTime();
};

export const uniqueId = function() {
  let dt = new Date().getTime();
  const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });

  return uuid.substr(0, 13);
};

export function prepareUrlPath(path: string): string {
  return path.toLocaleLowerCase().replace(/ /g, "-");
}

export function sortByFrequency(array: string[]): string[] {
  const frequency: any = {};

  array.forEach(function(value) {
    frequency[value] = 0;
  });

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

export function printableMinutes(seconds: number): string {
  if (seconds < 60) {
    return seconds + "s";
  } else {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;

    return m + "m " + s + "s";
  }
}

export function useInterval(callback: any, delay: number) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      // @ts-ignore
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export function needsToBeSliced(message: string): boolean {
  return message.length > 300;
}

export function stringToHexColor(str: string): string {
  return "#" + intToARGB(hashCode(str));
}

export function isBright(hex: string): boolean {
  const color = hex.replace("#", "");
  const rgb = parseInt(color, 16);

  const r = (rgb >> 16) & 0xff;  // extract red
  const g = (rgb >>  8) & 0xff;  // extract green
  const b = (rgb >>  0) & 0xff;  // extract blue

  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return luma > 140;
}

function hashCode(str: string): number {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 6) - hash);
  }
  return hash;
}

// Convert an int to hexadecimal with a max length
// of six characters.
function intToARGB(i: number): string {
  var hex =
    ((i >> 24) & 0xff).toString(16) +
    ((i >> 16) & 0xff).toString(16) +
    ((i >> 8) & 0xff).toString(16) +
    (i & 0xff).toString(16);
  // Sometimes the string returned will be too short so we
  // add zeros to pad it out, which later get removed if
  // the length is greater than six.
  hex += "000000";
  return hex.substring(0, 6);
}

export function shuffle(array: string[]) {
  let counter = array.length;

  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    let index = Math.floor(Math.random() * counter);

    // Decrease counter by 1
    counter--;

    // And swap the last element with it
    let temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }

  return array;
}

export function removeDuplicateTopicsFromFirst(firstArr: Topic[], secondArr: Topic[]): Topic[] {
  if (secondArr.length < 1) {
    return firstArr;
  }

  let filteredArr: Topic[] = [];
  for (let i = 0; i < firstArr.length; i++) {
    let duplicateFound = false;
    for (let j = 0; j < secondArr.length; j++) {
      if (firstArr[i].id === secondArr[j].id) {
        duplicateFound = true;
        break;
      }
    }

    if (!duplicateFound) {
      filteredArr.push(firstArr[i]);
    }
  }

  return filteredArr;
}

export const toLowerCase = (text: string) => {
  return text.toLocaleLowerCase();
};

export const shouldBeFiltered = (moderators: string[], distrusted: string[]) => {
  return (
    moderators != null &&
    distrusted != null &&
    moderators.length > 0 &&
    distrusted.length > 0 &&
    moderators.filter(n => !distrusted.includes(n)).length > 0
  );
};
