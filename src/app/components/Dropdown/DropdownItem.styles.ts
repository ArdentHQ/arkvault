import tw, { styled } from "twin.macro";

export const DropdownItem = styled.li<{ isActive: boolean }>(({ isActive = false }) => [
	isActive &&
		tw`
			bg-theme-primary-50 text-theme-primary-600 dark:bg-black
			border-theme-primary-600
		`,
	!isActive &&
		tw`
			cursor-pointer text-theme-secondary-700
			hover:(text-theme-secondary-900 bg-theme-secondary-200 dark:bg-theme-secondary-900 dark:text-theme-secondary-200)
			dark:(text-theme-secondary-200)
			border-transparent
		`,
	tw`flex items-center space-x-2 py-4 px-8 border-l-4 transition-colors-shadow duration-100`,
	tw`text-base font-semibold text-left whitespace-nowrap focus:outline-none`,
	tw`
			focus:(ring-2 ring-inset ring-theme-primary-400)
		`,
]);
