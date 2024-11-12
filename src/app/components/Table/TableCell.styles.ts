const baseStyle = "flex px-3 items-center my-1 transition-colors duration-100 min-h-11";

const getVariant = (isSelected: boolean, variant: "start" | "middle" | "end", size?: "sm" | "base"): string | null => {
	if (variant === "start") {
		const variants = {
			base: isSelected
				? "pl-3 ml-3 bg-theme-success-100 rounded-l dark:bg-transparent dark:bg-transparent dark:border-y-2 dark:border-l-2 dark:border-theme-success-600"
				: "pl-3 ml-3 rounded-l dark:group-hover:bg-black group-hover:bg-theme-secondary-200",
			sm: "pl-0 ml-2 rounded-l dark:group-hover:bg-black group-hover:bg-theme-secondary-200",
		};

		return variants[size as keyof typeof variants] || variants.base;
	}

	if (variant === "end") {
		const variants = {
			base: isSelected
				? "pr-3 mr-3 bg-theme-success-100 rounded-r dark:bg-transparent dark:border-y-2 dark:border-r-2 dark:border-theme-success-600"
				: "pr-3 mr-3 rounded-r dark:group-hover:bg-black group-hover:bg-theme-secondary-200",
			sm: "pr-0 mr-2 rounded-r dark:group-hover:bg-black group-hover:bg-theme-secondary-200",
		};

		return variants[size as keyof typeof variants] || variants.base;
	}

	return isSelected
		? "bg-theme-success-100 dark:bg-transparent dark:border-y-2 dark:border-theme-success-600"
		: "dark:group-hover:bg-black group-hover:bg-theme-secondary-200";
};

export const getStyles = ({ variant, size, isSelected }: any) =>
	`${baseStyle} ${getVariant(isSelected, variant, size)}`;
