import ReactPiwik from "react-piwik";
import * as config from "../config";

const CATEGORY_USER_REGISTRATION = "user";

export const userRegisteredEvent = (name: string) => sendEvent(CATEGORY_USER_REGISTRATION, "registration");

export const userSignInEvent = (name: string) => sendEvent(CATEGORY_USER_REGISTRATION, "sign-in");

export const userAuthenticatedEvent = (name: string) => sendEvent(CATEGORY_USER_REGISTRATION, "authenticated");

function sendEvent(category: string, name: string) {
  if (config.matomo.enabled && ReactPiwik != null) {
    ReactPiwik.push(['trackEvent', category, name]);
  }
}