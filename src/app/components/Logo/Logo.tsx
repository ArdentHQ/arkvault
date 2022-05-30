import React from "react";
import { images } from "@/app/assets/images";

const { ARKVaultLogo } = images.common;

export const Logo = ({ height }: { height?: number }) => (
	<span className="relative">
		<ARKVaultLogo height={height} />
	</span>
);

Logo.displayName = "Logo";
