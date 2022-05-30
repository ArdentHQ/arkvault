import React from "react";

import { DropdownOption } from "@/app/components/Dropdown";
import { NavbarVariant } from "@/types";

export interface NavigationBarMenuItem {
	title: string;
	mountPath: ((profileId: string) => string) | (() => string);
}

export interface NavigationBarProperties {
	title?: string | React.ReactNode;
	isBackDisabled?: boolean;
	variant?: NavbarVariant;
}

export interface UserMenuProperties {
	avatarImage: string;
	onUserAction: (option: DropdownOption) => void;
	userInitials?: string;
}

export interface NavigationBarLogoOnlyProperties {
	title?: string | React.ReactNode;
	onClick?: () => void;
}

export interface NavigationBarFullProperties {
	title?: string | React.ReactNode;
	isBackDisabled?: boolean;
}
