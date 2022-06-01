import tw, { styled } from "twin.macro";

export const Input = styled("input", { target: "select-category-input" })`
	${tw`sr-only`}
`;

export const CustomButton = styled.div`
	${tw`p-2 px-4 font-semibold text-center transition-colors duration-200 border-2 rounded-md border-theme-primary-100 text-theme-secondary-700 hover:border-theme-primary-400 cursor-pointer dark:text-theme-secondary-200 dark:border-theme-secondary-800 dark:hover:border-theme-primary-400`}
	${Input}:checked + & {
		${tw`border-theme-primary-600 bg-theme-primary-50 dark:bg-theme-primary-900 dark:border-theme-primary-600 `}
	}
`;
