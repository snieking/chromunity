import ReactPiwik from "react-piwik";
import * as config from "../config";

const CATEGORY_USER = "user";
const CATEGORY_CHAT = "chat";
const CATEGORY_TOPIC = "topic";
const CATEGORY_ELECTION = "election";
const CATEGORY_REPRESENTATIVE = "representative";
const CATEGORY_CHANNEL = "channel";
const CATEGORY_GENERAL = "general";

export const userEvent = (name: string) => sendEvent(CATEGORY_USER, name);
export const chatEvent = (name: string) => sendEvent(CATEGORY_CHAT, name);
export const topicEvent = (name: string) => sendEvent(CATEGORY_TOPIC, name);
export const electionEvent = (name: string) => sendEvent(CATEGORY_ELECTION, name);
export const representativeEvent = (name: string) => sendEvent(CATEGORY_REPRESENTATIVE, name);
export const channelEvent = (name: string) => sendEvent(CATEGORY_CHANNEL, name);

export const generalEvent = (action: string) => sendEvent(CATEGORY_GENERAL, action);

function sendEvent(category: string, name: string) {
  if (config.matomo.enabled && ReactPiwik != null) {
    ReactPiwik.push(['trackEvent', category, name]);
  }
}