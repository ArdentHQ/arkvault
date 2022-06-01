import React, { useState, createContext, useContext, useMemo } from "react";

interface NavigationContextType {
	setHasFixedFormButtons: (show: boolean) => void;
	setShowMobileNavigation: (show: boolean) => void;
	hasFixedFormButtons: boolean;
	showMobileNavigation: boolean;
}

interface Properties {
	children: React.ReactNode;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider = ({ children }: Properties) => {
	// Places like the wallet creation form contains fixed buttons floating at
	// the bottom, we use this state to change the design of the mobile menu
	// to prevent the buttons from overlapping with the menu.
	const [hasFixedFormButtons, setHasFixedFormButtons] = useState(false);
	const [showMobileNavigation, setShowMobileNavigation] = useState(true);

	const navigationContext = useMemo<NavigationContextType>(
		() => ({
			hasFixedFormButtons,
			setHasFixedFormButtons,
			setShowMobileNavigation,
			showMobileNavigation,
		}),
		[hasFixedFormButtons, showMobileNavigation],
	);

	return <NavigationContext.Provider value={navigationContext}>{children}</NavigationContext.Provider>;
};

export const useNavigationContext = () => {
	const value = useContext(NavigationContext);

	if (value === undefined) {
		throw new Error("[useNavigationContext] Component not wrapped within a Provider");
	}

	return value;
};
