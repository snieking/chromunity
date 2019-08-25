import {createTopic} from "../src/blockchain/TopicService";
import * as bip39 from "bip39";
import { ChromunityUser } from "../src/types";

const CREATE_RANDOM_TOPIC = (user: ChromunityUser, channel: string) => {
    return createTopic(user, channel, upperCaseFirst(bip39.generateMnemonic(128)), upperCaseFirst(bip39.generateMnemonic(256)));
};

function upperCaseFirst(s: string) {
    console.log("Creating topic with msg: ", s);
    return s.charAt(0).toUpperCase() + s.slice(1);
}

export {
    CREATE_RANDOM_TOPIC
}