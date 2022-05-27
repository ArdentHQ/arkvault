import React from "react";

import { NavigationBarFull, NavigationBarLogoOnly } from "./NavigationBar.blocks";
import { NavigationBarProperties } from "./NavigationBar.contracts";

export const NavigationBar: React.FC<NavigationBarProperties> = ({ title, isBackDisabled, variant = "full" }) => {
	if (variant === "logo-only") {
		return <NavigationBarLogoOnly title={title} />;
	}

	return <NavigationBarFull title={title} isBackDisabled={isBackDisabled} />;
};
