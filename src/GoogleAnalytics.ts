import ReactGA from "react-ga";
import config from "./config";
import ReactPiwik from "react-piwik";

let initialized: boolean = false;

declare global {
  interface Window { _paq: any; }
}

const initGA = () => {
  if (!initialized) {
    ReactGA.initialize(config.gaTrackingId, { gaOptions: { sampleRate: 100, siteSpeedSampleRate: 100 } });
    initialized = true;
  }
};

export const pageView = () => {
  initGA();
  ReactGA.pageview(window.location.pathname + window.location.search);
};

export const pageViewPath = (path: string) => {
  initGA();
  ReactGA.pageview(path);
};

export const gaRellOperationTiming = (variable: string, value: number) => {
  initGA();
  ReactGA.timing({ category: "rell-operation", variable: variable, value: value });
};

export const gaRellQueryTiming = (variable: string, value: number) => {
  initGA();
  ReactGA.timing({ category: "rell-query", variable: variable, value: value });
};

export const gaSocialEvent = (action: string, label: string) => {
  initGA();
  ReactGA.event({ category: "Social", action: action, label: label });
};

export const gaGenericEvent = (category: string, action: string) => {
  initGA();
  ReactGA.event({ category: category, action: action });
  ReactPiwik.push(['trackEvent', category, action]);
};

export const gaException = (description: string) => {
  initGA();
  ReactGA.exception({ description: description, fatal: false });
  ReactPiwik.push(['trackEvent', "exceptions", description]);
};