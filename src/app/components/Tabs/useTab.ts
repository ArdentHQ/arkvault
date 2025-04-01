import React from "react";

export type TabId = string | number | undefined;

export function useTab({ initialId, disabled }: { initialId: TabId, disabled?: boolean }) {
	const [currentId, setCurrentId] = React.useState<TabId>(initialId);

	const isIdActive = React.useCallback((id: TabId) => currentId === id, [currentId]);

	return { currentId, isIdActive, setCurrentId, disabled };
}

export const TabContext = React.createContext<ReturnType<typeof useTab> | undefined>(undefined);
