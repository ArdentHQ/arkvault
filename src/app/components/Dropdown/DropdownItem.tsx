import { twMerge } from "tailwind-merge";
import cn from 'classnames';

export const DropdownItem = ({ isActive, ...props}: { isActive: boolean } & React.HTMLProps<HTMLLIElement>) => {
	return (
		<li {...props} className={twMerge("flex items-center space-x-2 py-4 px-8 border-l-4 transition-colors-shadow duration-100 text-base font-semibold text-left whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-inset focus:ring-theme-primary-400", cn({
			"bg-theme-primary-50 text-theme-primary-600 dark:bg-black border-theme-primary-600": isActive,
			"cursor-pointer text-theme-secondary-700 hover:text-theme-secondary-900 hover:bg-theme-secondary-200 hover:dark:bg-theme-secondary-900 hover:dark:text-theme-secondary-200 dark:text-theme-secondary-200 border-transparent": !isActive

		}), props.className)} />
	)
}