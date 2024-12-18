import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";

import { images } from "@/app/assets/images";
import { useActiveProfile } from "@/app/hooks";
import { useAccentColor as useAccentColorHook } from "@/app/hooks/use-accent-color";
import { shouldUseDarkColors } from "@/utils/theme";

type ImageProperties = {
	name: string;
	domain?: string;
	useAccentColor?: boolean;
	loading?: "eager" | "lazy";
} & React.HTMLProps<any>;

export const Image: React.VFC<ImageProperties> = ({
	name,
	domain = "common",
	useAccentColor = true,
	loading = "lazy",
	...properties
}) => {
	const [imageName, setImageName] = React.useState("");
	const { getCurrentAccentColor } = useAccentColorHook();
	const currentAccentColor = getCurrentAccentColor();

	// TODO: remove try/catch usage
	let profile: Contracts.IProfile | undefined;
	try {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		profile = useActiveProfile();
	} catch {
		profile = undefined;
	}

	React.useLayoutEffect(() => {
		let imageName: string = name;

		if (shouldUseDarkColors()) {
			imageName = `${imageName}Dark`;
		} else {
			imageName = `${imageName}Light`;
		}

		if (useAccentColor) {
			const theme: string = currentAccentColor.charAt(0).toUpperCase() + currentAccentColor.slice(1);

			setImageName(`${imageName}${theme}`);
		} else {
			setImageName(imageName);
		}
	}, [name, profile, currentAccentColor, useAccentColor]);

	const Image = (images as any)[domain][imageName] || (images as any)[domain][name];

	if (typeof Image === "string") {
		return <img src={Image} alt="" {...(properties as React.ImgHTMLAttributes<any>)} loading={loading} />;
	}

	return Image ? <Image {...properties} /> : <></>;
};
