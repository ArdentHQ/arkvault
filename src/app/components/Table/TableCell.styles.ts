const baseStyle = "flex px-3 items-center my-1 transition-colors duration-100 min-h-11";

const getVariant = (isSelected: boolean, variant: "start" | "middle" | "end", size?: "sm" | "base"): string | null => {
	if (variant === "start") {
		const variants = {
			base: isSelected
				? "pl-3 ml-3 bg-theme-success-100 rounded-l dark:bg-transparent dark:bg-transparent dark:border-y-2 dark:border-l-2 dark:border-theme-success-600"
				: "pl-6 rounded-l",
			sm: "pl-2 -ml-2 rounded-l",
		};

		return variants[size as keyof typeof variants] || variants.base;
	}

	if (variant === "end") {
		const variants = {
			base: isSelected
				? "pr-3 mr-3 bg-theme-success-100 rounded-r dark:bg-transparent dark:border-y-2 dark:border-r-2 dark:border-theme-success-600"
				: "pr-6 rounded-r",
			sm: "pr-2 -mr-2 rounded-r",
		};

		return variants[size as keyof typeof variants] || variants.base;
	}

	return isSelected ? "bg-theme-success-100 dark:bg-transparent dark:border-y-2 dark:border-theme-success-600" : "";
};

export const getStyles = ({ variant, size, isSelected }: any) =>
	`${baseStyle} ${getVariant(isSelected, variant, size)}`;
