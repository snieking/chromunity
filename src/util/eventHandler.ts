import ReactPiwik from "react-piwik";

declare global {
  interface Window { _paq: any; }
}

export const genericEvent = (category: string, action: string) => {
  ReactPiwik.push(['trackEvent', category, action]);
};