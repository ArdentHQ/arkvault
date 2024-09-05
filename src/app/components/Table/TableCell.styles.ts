const baseStyle = "flex items-center px-3 my-1 transition-colors duration-100";

const getHeight = (isCompact: boolean) => (isCompact ? "min-h-11" : "min-h-17.5");

const getVariant = (variant: "start" | "middle" | "end", size?: "sm" | "base"): string | null => {
	if (variant === "start") {
		const variants = {
			base: "pl-6 rounded-l",
			sm: "pl-2 -ml-2 rounded-l",
		};

		return variants[size as keyof typeof variants] || variants.base;
	}

	if (variant === "end") {
		const variants = {
			base: "pr-6 rounded-r",
			sm: "pr-2 -mr-2 rounded-r",
		};

		return variants[size as keyof typeof variants] || variants.base;
	}

	return "";
};

export const getStyles = ({ variant, isCompact, size }: any) =>
	`${baseStyle} ${getHeight(isCompact)} ${getVariant(variant, size)}`;
