import React from "react";

import { NavbarVariant } from "@/types";

export interface PageProperties {
	navbarVariant?: NavbarVariant;
	title?: string;
	pageTitle?: string;
	isBackDisabled?: boolean;
	sidebar?: React.ReactNode;
	children: React.ReactNode;
}
