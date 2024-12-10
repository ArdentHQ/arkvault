const baseStyles = () => "flex items-center space-x-4";

const getBorder = (border?: boolean, borderPosition?: "top" | "bottom" | "both") => {
	if (!border) {
		return;
	}

	const borders = {
		both: () => "border-t border-b",
		bottom: () => "border-b",
		top: () => "border-t",
	};

	return [
		"border-dashed border-theme-secondary-300 dark:border-theme-secondary-800",
		(borders[borderPosition as keyof typeof borders] || borders.bottom)(),
	];
};

const getPadding = (padding?: boolean, paddingPosition?: "top" | "bottom" | "both" | "none") => {
	if (!padding) {
		return "py-0";
	}

	const paddings = {
		both: () => "py-4 sm:py-6",
		bottom: () => "pb-4 sm:pb-6",
		none: () => "",
		top: () => "pt-4 sm:pt-6",
	};

	return (paddings[paddingPosition as keyof typeof paddings] || paddings.both)();
};

export const getStyles = ({
	border,
	borderPosition,
	padding,
	paddingPosition,
}: {
	border?: boolean;
	borderPosition?: "top" | "bottom" | "both";
	padding?: boolean;
	paddingPosition?: "top" | "bottom" | "both" | "none";
}) => [baseStyles(), getBorder(border, borderPosition), getPadding(padding, paddingPosition)];
