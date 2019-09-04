export const initGA = () => {
  console.log("GA Stub: Initialized");
};

export const pageView = () => {
  console.log("GA Stub: PageView");
};

export const gaRellOperationTiming = (variable: string, value: number) => {
  console.log("GA Stub: Rell Operation", variable, value);
};

export const gaRellQueryTiming = (variable: string, value: number) => {
  console.log("GA Stub: Rell Query", variable, value);
};