import emoji from 'emoji-dictionary'

export function parseContent(message: string): string {
    return parseUsers(parseHashtags(parseTopics(message)));
}

export function getTags(message: string): string[] {
    if (message == null) {
        return [];
    }

    const tags: string[] = message.match(/(#)([a-z\d-]+)/gi);
    return tags != null ? tags : [];
}

function parseHashtags(message: string): string {
    return message.replace(
        /(\s)(#)([a-z\d-]+)/gi,
        "$1<a  class='pink-typography' href='/c/$3'>$2$3</a>"
    );
}

function parseUsers(message: string): string {
    return message.replace(
        /(@)([a-zA-Z\d-_]+)/gi,
        "<a  class='purple-typography' href='/u/$2'><b>$1$2</b></a>"
    );
}

function parseTopics(message: string): string {
    return message.replace(
        /(\/t\/)(\S+)/gi,
        "<a  class='blue-typography' href='$1$2'><b>$1$2</b></a>"
    );
}

export const parseEmojis = (text: string) => text
  .replace(/:[dD]\b/gi, ":smiley:")
  .replace(/;\)\B/gi, ":wink:")
  .replace(/:\|\B/gi, ":expressionless:")
  .replace(/:[sS]\b/gi, ":confounded:")
  .replace(/:'\)\B/gi, ":sweat_smile:")
  .replace(/<3\b/gi, ":heart:")
  .replace(/:[pP]\b/gi, ":stuck_out_tongue:")
  .replace(/:[oO]\b/gi, ":open_mouth:")
  .replace(/:\w+:/gi, name => emoji.getUnicode(name));