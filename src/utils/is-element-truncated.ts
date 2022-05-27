export const isElementTruncated = (element: HTMLElement | null) => {
	if (element) {
		return element.offsetWidth < element.scrollWidth;
	}

	return false;
};
