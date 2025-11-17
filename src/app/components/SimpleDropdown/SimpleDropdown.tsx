import React, { createContext, useContext, useState, ReactNode, FC } from "react";
import {
	useFloating,
	autoUpdate,
	offset,
	flip,
	shift,
	useClick,
	useDismiss,
	useRole,
	useInteractions,
} from "@floating-ui/react";

interface Context {
	open: boolean;
	setOpen: (value: boolean) => void;
	refs: ReturnType<typeof useFloating>["refs"];
	getReferenceProps: ReturnType<typeof useInteractions>["getReferenceProps"];
	getFloatingProps: ReturnType<typeof useInteractions>["getFloatingProps"];
	floatingStyles: React.CSSProperties;
	context: ReturnType<typeof useFloating>["context"];
}

const DropdownContext = createContext<Context | null>(null);

export const useDropdown = () => {
	const ctx = useContext(DropdownContext);
	if (!ctx) {
		throw new Error("Dropdown parts must be used inside DropdownRoot");
	}
	return ctx;
};

export const DropdownRoot: FC<{ children: ReactNode }> = ({ children }) => {
	const [open, setOpen] = useState(false);

	const { refs, floatingStyles, context } = useFloating({
		middleware: [offset(4), flip(), shift()],
		onOpenChange: setOpen,
		open,
		placement: "bottom-start",
		whileElementsMounted: autoUpdate,
	});
	const { getReferenceProps, getFloatingProps } = useInteractions([
		useClick(context),
		useDismiss(context),
		useRole(context),
	]);
	return (
		<DropdownContext.Provider
			value={{ context, floatingStyles, getFloatingProps, getReferenceProps, open, refs, setOpen }}
		>
			{children}
		</DropdownContext.Provider>
	);
};
