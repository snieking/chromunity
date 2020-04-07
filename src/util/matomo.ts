import ReactPiwik from "react-piwik";

const CATEGORY_USER_REGISTRATION = "user-registration";

export const userRegisteredEvent = (name: string) => {
  if (ReactPiwik != null)
    ReactPiwik.push(['trackEvent', CATEGORY_USER_REGISTRATION, name]);
};