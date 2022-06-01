import tw from "twin.macro";

const baseStyles = () => tw`flex items-center space-x-4`;

const getBorder = (border?: boolean, borderPosition?: "top" | "bottom" | "both") => {
	if (!border) {
		return;
	}

	const borders = {
		both: () => tw`border-t border-b`,
		bottom: () => tw`border-b`,
		top: () => tw`border-t`,
	};

	return [
		tw`border-dashed border-theme-secondary-300 dark:border-theme-secondary-800`,
		(borders[borderPosition as keyof typeof borders] || borders.bottom)(),
	];
};

const getPadding = (padding?: boolean, paddingPosition?: "top" | "bottom" | "both" | "none") => {
	if (!padding) {
		return tw`py-0`;
	}

	const paddings = {
		both: () => tw`py-4 sm:py-6`,
		bottom: () => tw`py-4 sm:pb-6`,
		none: () => "",
		top: () => tw`py-4 sm:pt-6`,
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
