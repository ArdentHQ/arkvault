import tw from "twin.macro";

import { DividerSizeProperties, DividerStylesProperties, DividerTypeProperties } from "./Divider";

const baseStyle = tw`border-t border-solid`;

const getType = (type?: DividerTypeProperties) => {
	if (type === "horizontal") {
		return tw`flex clear-both w-full min-w-full my-4`;
	}

	return tw`relative inline-block align-middle border-t-0 border-l border-solid mx-2`;
};

const getSize = (type?: DividerTypeProperties, size?: DividerSizeProperties) => {
	if (type === "horizontal") {
		return;
	}

	const sizes = {
		default: () => tw`h-4`,
		lg: () => tw`h-8`,
		md: () => tw`h-5`,
		sm: () => tw`h-2`,
		xl: () => tw`h-10`,
	};

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	return (sizes[size as keyof typeof sizes] || sizes.default)();
};

const isDashed = (dashed?: boolean) => {
	if (!dashed) {
		return;
	}

	return tw`border-dashed [background:none]`;
};

export const getStyles = ({ size, type, dashed }: DividerStylesProperties) => [
	getSize(type, size),
	baseStyle,
	getType(type),
	isDashed(dashed),
];
