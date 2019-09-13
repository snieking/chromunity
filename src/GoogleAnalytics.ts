import ReactGA from "react-ga";
import config from "./config";

export const initGA = () => {
  ReactGA.initialize(config.gaTrackingId, { gaOptions: { sampleRate: 100, siteSpeedSampleRate: 100 } });
};

export const pageView = () => {
  ReactGA.pageview(window.location.pathname + window.location.search);
};

export const pageViewPath = (path: string) => {
  ReactGA.pageview(path);
};

export const gaRellOperationTiming = (variable: string, value: number) => {
  ReactGA.timing({ category: "rell-operation", variable: variable, value: value });
};

export const gaRellQueryTiming = (variable: string, value: number) => {
  ReactGA.timing({ category: "rell-query", variable: variable, value: value });
};

export const gaSocialEvent = (action: string, label: string) => {
  ReactGA.event({ category: "Social", action: action, label: label });
};

export const gaGenericEvent = (category: string, action: string) => {
  ReactGA.event({ category: category, action: action });
};

export const gaException = (description: string) => {
  ReactGA.exception({ description: description, fatal: false });
};
