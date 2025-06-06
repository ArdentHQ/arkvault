const shouldUseDarkColors = () => document.querySelector("html")?.classList.contains("dark");

const shouldUseDimColors = () => document.querySelector("html")?.classList.contains("dim");

export { shouldUseDarkColors, shouldUseDimColors };
