import React from "react";

import { NavbarVariant } from "@/types";

export interface PageProperties {
	navbarVariant?: NavbarVariant;
	title?: string | React.ReactNode;
	pageTitle?: string;
	wrapperClassName?: string;
	isBackDisabled?: boolean;
	children: React.ReactNode;
	showBottomNavigationBar?: boolean;
}
