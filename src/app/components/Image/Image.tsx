import React from "react";

import { images } from "@/app/assets/images";
import { useTheme } from "@/app/hooks";
import { shouldUseDarkColors, shouldUseDimColors } from "@/utils/theme";

type ImageProperties = {
	name: string;
	domain?: string;
	loading?: "eager" | "lazy";
} & React.HTMLProps<any>;

export const Image = ({ name, domain = "common", loading = "lazy", ...properties }: ImageProperties) => {
	const [imageName, setImageName] = React.useState("");
	const { isDarkMode, isDimMode } = useTheme();

	React.useLayoutEffect(() => {
		let imageName: string = name;

		if (shouldUseDimColors()) {
			imageName = `${imageName}Dim`;
		} else if (shouldUseDarkColors()) {
			imageName = `${imageName}Dark`;
		} else {
			imageName = `${imageName}Light`;
		}

		setImageName(imageName);
	}, [name, isDarkMode, isDimMode]);

	const Image = (images as any)[domain][imageName] || (images as any)[domain][name];

	if (typeof Image === "string") {
		return <img src={Image} alt="" {...(properties as React.ImgHTMLAttributes<any>)} loading={loading} />;
	}

	return Image ? <Image {...properties} /> : <></>;
};
