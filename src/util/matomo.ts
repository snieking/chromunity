import ReactPiwik from "react-piwik";

const CATEGORY_USER_REGISTRATION = "user";

export const userRegisteredEvent = (name: string) => {
  if (ReactPiwik != null)
    ReactPiwik.push(['trackEvent', CATEGORY_USER_REGISTRATION, "registration", name]);
};

export const userSignInEvent = (name: string) => {
  if (ReactPiwik != null)
    ReactPiwik.push(['trackEvent', CATEGORY_USER_REGISTRATION, "sign-in", name]);
};

export const userAuthenticatedEvent = (name: string) => {
  if (ReactPiwik != null)
    ReactPiwik.push(['trackEvent', CATEGORY_USER_REGISTRATION, "authenticated", name]);
};