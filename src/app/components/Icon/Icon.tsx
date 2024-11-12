// Assets
import React from "react";
import { styled } from "twin.macro";

import { SvgCollection } from "@/app/assets/svg";
import { Size } from "@/types";
import { useTheme } from "@/app/hooks/use-theme";
import { getCurrentAccentColor } from "@/utils/theme";

type IconProperties = {
	name: string;
	size?: Size;
	as?: React.ElementType;
	fallback?: React.ReactNode;
	dimensions?: [number, number];
} & Omit<React.HTMLProps<any>, "size" | "width" | "height">;

interface WrapperProperties {
	width: number;
	height: number;
}

const Wrapper = styled.div(({ width, height }: WrapperProperties) => ({
	svg: {
		height,
		width,
	},
}));

const getDimensions = (size?: Size, dimensions?: [number, number]): [number, number] => {
	if (dimensions) {
		return dimensions;
	}

	const sizeMap: Record<string, [number, number]> = {
		lg: [20, 20],
		md: [16, 16],
		sm: [10, 10],
		xl: [40, 40],
		xs: [8, 8],
	};

	return sizeMap[size || "md"];
};

export const Icon: React.VFC<IconProperties> = ({ name, fallback, size, dimensions, ...properties }) => {
	const Svg = SvgCollection[name];

	const [width, height] = getDimensions(size, dimensions);

	return (
		<Wrapper width={width} height={height} {...properties}>
			{Svg ? <Svg /> : fallback}
		</Wrapper>
	);
};

type ThemeIconProperties = {
	darkIcon: string;
	lightIcon: string;
	greenDarkIcon?: string;
	greenLightIcon?: string;
} & Omit<IconProperties, "name">;

export const ThemeIcon = ({
	darkIcon,
	lightIcon,
	greenLightIcon,
	greenDarkIcon,
	...properties
}: ThemeIconProperties): JSX.Element => {
	const { isDarkMode } = useTheme();

	let icon = isDarkMode ? darkIcon : lightIcon;

	if (greenDarkIcon && greenLightIcon) {
		const accentColor = getCurrentAccentColor();

		if (accentColor === "green") {
			icon = isDarkMode ? greenDarkIcon : greenLightIcon;
		}
	}

	return <Icon name={icon} data-testid={`icon-${icon}`} {...properties} />;
};
