const shouldUseDarkColors = () => document.querySelector("html")?.classList.contains("dark");

const getCurrentAccentColor = (): 'green' | 'navy' => {
	if (document.body.classList.contains("blue")) {
		return "navy";
	}

	return "green";
};

export { shouldUseDarkColors, getCurrentAccentColor };
