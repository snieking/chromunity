import emoji from 'emoji-dictionary';

export function parseContent(message: string): string {
  return parseUsers(parseHashtags(parseTopics(message)));
}

export function parseMarkdownContent(message: string): string {
  return parseUsersMarkdown(parseHashtagsMarkdown(message));
}

const HASHTAG_REGEX = /(\s)(#)([a-z\d-]+)/gi;
const USER_REGEX = /(@)([a-zA-Z\d-_]+)/gi;
const TOPIC_REGEX = /(\/t\/)([a-z\d-#]+)/gi;

export function getTags(message: string): string[] {
  if (message == null) {
    return [];
  }

  const tags: string[] = message.match(/(#)([a-z\d-]+)/gi);
  return tags != null ? tags : [];
}

export function getUsers(message: string): string[] {
  if (message == null) {
    return [];
  }

  const users: string[] = message.match(USER_REGEX);
  return users != null ? users.map((user) => user.substring(1, user.length)) : [];
}

function parseHashtagsMarkdown(message: string) {
  return message.replace(HASHTAG_REGEX, '$1[$2$3](/c/$3)');
}

function parseUsersMarkdown(message: string) {
  return message.replace(USER_REGEX, '[$1$2](/u/$2)');
}

function parseHashtags(message: string): string {
  return message.replace(HASHTAG_REGEX, "$1<a target='_self' class='pink-typography' href='/c/$3'>$2$3</a>");
}

function parseUsers(message: string): string {
  return message.replace(USER_REGEX, "<a target='_self' class='purple-typography' href='/u/$2'><b>$1$2</b></a>");
}

function parseTopics(message: string): string {
  return message.replace(TOPIC_REGEX, "<a target='_self' class='blue-typography' href='$1$2'><b>$1$2</b></a>");
}

export const parseEmojis = (text: string) =>
  text
    .replace(/:[dD]\b/gi, ':smiley:')
    .replace(/;\)\B/gi, ':wink:')
    .replace(/:\|\B/gi, ':expressionless:')
    .replace(/:[sS]\b/gi, ':confounded:')
    .replace(/:'\)\B/gi, ':sweat_smile:')
    .replace(/<3\b/gi, ':heart:')
    .replace(/:[pP]\b/gi, ':stuck_out_tongue:')
    .replace(/:[oO]\b/gi, ':open_mouth:')
    .replace(/:\w+:/gi, (name) => emoji.getUnicode(name));
