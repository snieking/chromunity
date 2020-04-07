import ReactPiwik from "react-piwik";
import * as config from "../config";

const CATEGORY_USER_REGISTRATION = "user";

export const userEvent = (name: string) => sendEvent(CATEGORY_USER_REGISTRATION, name);

function sendEvent(category: string, name: string) {
  if (config.matomo.enabled && ReactPiwik != null) {
    ReactPiwik.push(['trackEvent', category, name]);
  }
}