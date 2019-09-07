export const initGA = () => {
  console.log("GA Stub: Initialized");
};

export const pageView = () => {
  console.log("GA Stub: PageView");
};

export const pageViewPath = (path: string) => {
  console.log("GA Stub: PageViewPath", path);
};

export const gaRellOperationTiming = (variable: string, value: number) => {
  console.log("GA Stub: Rell Operation", variable, value);
};

export const gaRellQueryTiming = (variable: string, value: number) => {
  console.log("GA Stub: Rell Query", variable, value);
};

export const gaSocialEvent = (action: string, label: string) => {
  console.log("GA Stub: Social Event", action, label);
};

export const gaGenericEvent = (category: string, action: string) => {
  console.log("GA Stub: Generic Event", category, action);
};

export const gaException = (description: string) => {
  console.log("GA Stub: Exception", description);
};