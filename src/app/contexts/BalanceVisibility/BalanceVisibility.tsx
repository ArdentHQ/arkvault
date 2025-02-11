import React, { useState } from "react";

interface BalanceVisibilityContextType {
	hideBalance: boolean;
	setHideBalance: (hideBalance: boolean) => void;
}

interface Properties {
	children: React.ReactNode;
}

const BalanceVisibilityContext = React.createContext<BalanceVisibilityContextType | undefined>(undefined);

export const BalanceVisibilityProvider = ({ children }: Properties) => {
	const [hideBalance, setHideBalance] = useState(() => {
		const stored = localStorage.getItem("hideBalance");
		return stored ? JSON.parse(stored) : false;
	});

	const updateHideBalance = (value: boolean) => {
		localStorage.setItem("hideBalance", JSON.stringify(value));
		setHideBalance(value);
	};

	return (
		<BalanceVisibilityContext.Provider value={{ hideBalance, setHideBalance: updateHideBalance }}>
			{children}
		</BalanceVisibilityContext.Provider>
	);
};

export const useBalanceVisibilityContext = () => {
	const context = React.useContext(BalanceVisibilityContext);
	if (context === undefined) {
		throw new Error("useBalanceVisibilityContext must be used within a BalanceVisibilityProvider");
	}
	return context;
};
