export const uniqueId = function() {
  return Math.random()
    .toString(36)
    .substr(2, 16);
};

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

export function needsToBeSliced(message: string): boolean {
  return message.length > 300;
}

export function stringToHexColor(str: string): string {
  return "#" + intToARGB(hashCode(str));
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
