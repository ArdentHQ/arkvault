// Assets
import React, { JSX } from "react";
import { SvgCollection } from "@/app/assets/svg";
import { Size } from "@/types";
import { useTheme } from "@/app/hooks/use-theme";

type IconProperties = {
	name: string;
	size?: Size;
	as?: React.ElementType;
	fallback?: React.ReactNode;
	dimensions?: [number, number];
} & Omit<React.HTMLProps<any>, "size">;

interface WrapperProperties {
	width: string | number;
	height: string | number;
}

const Wrapper = ({ width, height, children, ...props }: WrapperProperties & React.HTMLProps<HTMLDivElement>) => (
	<div {...props}>
		<div style={{ height, width }}>
			{
				React.isValidElement(children)
					? React.cloneElement(children as React.ReactElement<React.SVGProps<SVGSVGElement>>, {
							style: {
								height: "100%",
								width: "100%",
							},
						})
					: children // Render directly if it's not a valid React element
			}
		</div>
	</div>
);

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

export const Icon = ({ name, fallback, size, dimensions, ...properties }: IconProperties) => {
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
} & Omit<IconProperties, "name">;

export const ThemeIcon = ({ darkIcon, lightIcon, ...properties }: ThemeIconProperties): JSX.Element => {
	const { isDarkMode } = useTheme();
	const icon = isDarkMode ? darkIcon : lightIcon;

	return <Icon name={icon} data-testid={`icon-${icon}`} {...properties} />;
};
