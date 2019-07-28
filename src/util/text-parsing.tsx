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
        /\s(#)([a-z\d-]+)/gi,
        "<a  class='pink-typography' href='/tag/$2'>$1$2</a>"
    );
}

function parseUsers(message: string): string {
    return message.replace(
        /(@)([a-z\d-]+)/gi,
        "<a  class='purple-typography' href='/u/$2'><b>$1$2</b></a>"
    );
}

function parseTopics(message: string): string {
    return message.replace(
        /(\/t\/)([a-z\d-#]+)/gi,
        "<a  class='blue-typography' href='$1$2'><b>$1$2</b></a>"
    );
}