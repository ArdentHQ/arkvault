import cn from "classnames";

const defaultClasses =
	"flex h-full w-full items-center items-center justify-between space-x-4 rounded-xl border-2 pl-4 pr-6";

const toggleClasses = (isSelected?: boolean) => {
	if (isSelected) {
		return "border-theme-primary-500 dark:border-theme-primary-600 bg-theme-primary-100 dark:bg-theme-primary-900 text-theme-secondary-600 dark:text-theme-secondary-200";
	}

	return "text-theme-secondary-500 dark:text-theme-secondary-800 border-theme-primary-100 dark:border-theme-secondary-800";
};

export const wrapperClasses = (isDisabled?: boolean) =>
	cn("flex h-18 w-full cursor-pointer", { "cursor-not-allowed": isDisabled });

export const optionClasses = (isSelected?: boolean) => cn(defaultClasses, toggleClasses(isSelected));
