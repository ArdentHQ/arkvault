import tw, { css } from "twin.macro";

import { Color } from "@/types";
import { urlEncodeRootColor } from "@/utils/url-encode-root-color";

const baseStyle = [
	tw`w-5 h-5 bg-transparent rounded cursor-pointer`,
	tw`border-2`,
	tw`transition duration-150 ease-in-out`,
	tw`focus:(ring-offset-0 ring-theme-primary-400)`,
	tw`disabled:(
		bg-theme-secondary-200 border-theme-secondary-300 cursor-not-allowed
		dark:(bg-theme-secondary-800 border-theme-secondary-600)
	)!`,
	css`
		&:not(:checked) {
			${tw`border-theme-secondary-300 dark:border-theme-secondary-600`}
		}
		&:checked:disabled {
			background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='${urlEncodeRootColor(
				"--theme-color-secondary-300",
			)}' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");

			@media (prefers-color-scheme: dark) {
				background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='${urlEncodeRootColor(
					"--theme-color-secondary-600",
				)}' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
			}
		}
	`,
];

type baseColorsType = Record<
	string,
	{
		color: string;
		onHover?: string;
	}
>;
const getColor = (color: Color) => {
	const baseColors: baseColorsType = {
		danger: { color: "danger-400", onHover: "danger-500" },
		hint: { color: "hint-500" },
		info: { color: "primary-600" },
		success: { color: "primary-600", onHover: "primary-700" },
		warning: { color: "warning-600" },
	};

	return [
		css`
			color: var(--theme-color-${baseColors[color].color});
			&:hover {
				border-color: var(--theme-color-${baseColors[color].color});
			}
		`,
		baseColors[color].onHover &&
			css`
				&:checked:hover {
					color: var(--theme-color-${baseColors[color].onHover});
				}
			`,
	];
};

export const getStyles = ({ color }: { color?: Color }) => [baseStyle, getColor(color!)];
