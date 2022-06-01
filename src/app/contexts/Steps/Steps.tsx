import React from "react";

interface StepsContextType {
	steps: number;
	activeStep: number;
}

interface Properties {
	children: React.ReactNode;
	steps: number;
	activeStep: number;
}

const StepsContext = React.createContext<any>(undefined);

export const StepsProvider = ({ children, activeStep, steps }: Properties) => (
	<StepsContext.Provider value={{ activeStep, steps } as StepsContextType}>{children}</StepsContext.Provider>
);

export const useSteps = () => {
	const value = React.useContext(StepsContext);

	if (value === undefined) {
		return {};
	}

	return value;
};
