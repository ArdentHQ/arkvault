export const lstat = () => {};
export const readdir = () => {};
export const readlink = () => {};
export const realpath = () => {};

export const emitWarning = () => {};
export const exit = () => {};

export const performance = window.performance || {
	now: () => Date.now(),
};
export const isMainThread = true;
export const parentPort = {
	postMessage: () => {},
};

export const fileURLToPath = () => {};
