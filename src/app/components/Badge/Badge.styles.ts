import tw, { css } from "twin.macro";

import { Position, Size } from "@/types";

const baseStyle = (size?: Size, noShadow?: boolean) => {
	const base = tw`absolute transform`;

	if (noShadow) {
		return [base];
	}

	const shadowSize = size === "sm" ? "3px" : "5px";
	const shadow = css`
		& {
			box-shadow: 0 0 0 ${shadowSize} var(--theme-background-color);
		}
	`;
	return [base, shadow];
};

const shape = "flex border-2 rounded-full justify-center items-center align-middle";
const colors = "bg-theme-background border-transparent";

export const defaultClasses = `${shape} ${colors}`;

const getPosition = (position?: Position) => {
	const positions = {
		bottom: () => tw`bottom-1 translate-y-full`,
		"bottom-left": () => tw`bottom-0 translate-y-1/2 left-0 -translate-x-1/2`,
		default: () => tw`bottom-0 translate-y-1/2 right-0 translate-x-1/2`,
		left: () => tw`left-1 -translate-x-full`,
		right: () => tw`right-1 translate-x-full`,
		top: () => tw`top-1 -translate-y-full`,
		"top-left": () => tw`top-0 -translate-y-1/2 left-0 -translate-x-1/2`,
		"top-right": () => tw`top-0 -translate-y-1/2 right-0 translate-x-1/2`,
	};

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	return (positions[position as keyof typeof positions] || positions.default)();
};

const getSize = (size?: Size) => {
	const sizes = {
		default: () => tw`w-5 h-5`,
		lg: () => tw`w-6 h-6`,
		sm: () => tw`w-2 h-2`,
	};

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	return (sizes[size as keyof typeof sizes] || sizes.default)();
};

export interface BadgeStyleProperties {
	position?: Position;
	size?: Size;
	noShadow?: boolean;
}
export const getStyles = ({ position, size, noShadow }: BadgeStyleProperties) => [
	baseStyle(size, noShadow),
	getPosition(position),
	getSize(size),
];
