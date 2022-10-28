import React, { createContext, useContext } from "react";

import { useLedgerConnection } from "./hooks/connection";

interface Properties {
	children: React.ReactNode;
}

const LedgerContext = createContext<any>(undefined);

export const LedgerProvider = ({ children }: Properties) => (
	<LedgerContext.Provider value={useLedgerConnection()}>{children}</LedgerContext.Provider>
);

/* istanbul ignore next -- @preserve */
export const useLedgerContext = (): ReturnType<typeof useLedgerConnection> => useContext(LedgerContext);
