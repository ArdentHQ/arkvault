import tw from "twin.macro";

import { Size } from "@/types";

const defaultStyle = (noShadow: boolean) => [
	tw`transition-all inline-flex items-center justify-center align-middle border-2 rounded-full`,
	noShadow ? tw`ring-0` : tw`ring-6`,
];

const getSize = (size?: Size) => {
	const sizes = {
		default: () => tw`w-10 h-10 px-4 py-2`,
		lg: () => tw`px-2 py-1 w-11 h-11`,
		sm: () => tw`w-8 h-8 px-2 py-1 text-sm`,
		xl: () => tw`px-2 py-1 text-lg w-16 h-16`,
		xs: () => tw`w-5 h-5 text-sm`,
	};

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	return (sizes[size as keyof typeof sizes] || sizes.default)();
};

const getAvatarCss = (avatarId?: string) => {
	if (!avatarId) {
		return;
	}

	return tw`border-0 [background:#bad6f0]`;
};

export const getStyles = ({ size, avatarId, noShadow }: { size?: Size; avatarId?: string; noShadow?: boolean }) => [
	...defaultStyle(noShadow!),
	getSize(size),
	getAvatarCss(avatarId),
];
