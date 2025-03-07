// src/shims/emptyFsPromises.js
export const lstat = () => {};
export const readdir = () => {};
export const readlink = () => {};
export const realpath = () => {};

// src/shims/process.js
export const emitWarning = () => {};
export const exit = () => {};
// Optionally, you can export other process properties if needed.
