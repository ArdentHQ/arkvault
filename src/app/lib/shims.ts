export const lstat = () => {};
export const readdir = () => {};
export const readlink = () => {};
export const realpath = () => {};

export const emitWarning = () => {};
export const exit = () => {};

export const performance = window.performance || {
  now: () => Date.now(),
};
