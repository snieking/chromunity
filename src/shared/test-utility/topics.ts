import {createTopic} from "../../core/services/TopicService";
import * as bip39 from "bip39";
import { ChromunityUser } from "../../types";

const CREATE_RANDOM_TOPIC = (user: ChromunityUser, channel: string) => {
    return createTopic(user, channel, upperCaseFirst(bip39.generateMnemonic(128).substring(0, 39)), upperCaseFirst(bip39.generateMnemonic(256)));
};

function upperCaseFirst(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

export {
    CREATE_RANDOM_TOPIC
}