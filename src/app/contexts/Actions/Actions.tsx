import React, { useState } from "react";

enum Action {
	SendTransfer = "sendTransfer",
	SendVote = "sendVote",
	SignMessage = "signMessage",
	// ... etc
}

interface ActionsContextValue {
	currentAction: Action | undefined;
}

const ActionsContext = React.createContext<ActionsContextValue | undefined>(undefined);

export const ActionsProvider = ({ children }: { children: React.ReactNode }) => {
	const [currentAction, setCurrentAction] = useState<Action | undefined>(undefined);

	return (
		<ActionsContext.Provider
			value={{
				currentAction,
			}}
		>
			{children}
		</ActionsContext.Provider>
	);
};

export const useActions = (): ActionsContextValue => {
	const context = React.useContext(ActionsContext);

	if (context === undefined) {
		throw new Error("[useActions] Component not wrapped within a Provider");
	}

	return context;
};
