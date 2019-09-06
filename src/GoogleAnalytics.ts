import ReactGA from "react-ga";
import config from "./config";

export const initGA = () => {
  ReactGA.initialize(config.gaTrackingId);
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