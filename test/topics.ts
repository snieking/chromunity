import {createTopic} from "../src/blockchain/TopicService";
import {User} from "../src/types";
import * as bip39 from "bip39";

const CREATE_RANDOM_TOPIC = (user: User, channel: string) => {
    return createTopic(user, channel, upperCaseFirst(bip39.generateMnemonic(128)), upperCaseFirst(bip39.generateMnemonic(256)));
};

function upperCaseFirst(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

export {
    CREATE_RANDOM_TOPIC
}