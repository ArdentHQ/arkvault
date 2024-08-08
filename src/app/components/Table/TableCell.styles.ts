import tw, { TwStyle } from "twin.macro";

const baseStyle = tw`flex items-center px-3 my-1 transition-colors duration-100`;

const getHeight = (isCompact: boolean) => (isCompact ? tw`min-h-11` : tw`min-h-17.5`);

const getVariant = (variant: "start" | "middle" | "end", size?: "sm" | "base"): TwStyle | undefined => {
	if (variant === "start") {
		const variants = {
			base: () => tw`pl-6 rounded-l-xl`,
			sm: () => tw`pl-2 -ml-2 rounded-l-xl`,
		};

		return (variants[size as keyof typeof variants] || variants.base)();
	}

	if (variant === "end") {
		const variants = {
			base: () => tw`pr-6 rounded-r-xl`,
			sm: () => tw`pr-2 -mr-2 rounded-r-xl`,
		};

		return (variants[size as keyof typeof variants] || variants.base)();
	}
};

export const getStyles = ({ variant, isCompact, size }: any) => [
	baseStyle,
	getHeight(isCompact),
	getVariant(variant, size),
];
