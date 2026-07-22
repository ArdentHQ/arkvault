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
	FloatingPortal,
	FloatingFocusManager,
} from "@floating-ui/react";
import { twMerge } from "tailwind-merge";
import cn from "classnames";

interface Context {
	open: boolean;
	setOpen: (value: boolean | ((value: boolean) => boolean)) => void;
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

export type DropdownToggleChildren = ReactNode | ((props: { isOpen: boolean }) => ReactNode);

interface DropdownToggleProperties extends Omit<React.HTMLProps<HTMLButtonElement>, "children"> {
	children?: DropdownToggleChildren;
}

export const DropdownToggle: FC<DropdownToggleProperties> = ({ children, ...props }) => {
	const { refs, getReferenceProps, setOpen, open } = useDropdown();
	const renderChildren = () => (typeof children === "function" ? children({ isOpen: open }) : children);

	return (
		<button
			data-testid="DropdownToggle"
			ref={refs.setReference}
			type="button"
			{...getReferenceProps(props)}
			onClick={(event) => {
				event.preventDefault();
				setOpen((previous) => !previous);
			}}
		>
			{renderChildren()}
		</button>
	);
};

export const DropdownContent: FC<{
	children?: ReactNode;
	className?: string;
	top?: ReactNode;
	bottom?: ReactNode;
}> = ({ children, className, top, bottom }) => {
	const { open, refs, getFloatingProps, floatingStyles, context } = useDropdown();

	if (!open) {
		return <></>;
	}

	return (
		<FloatingPortal>
			<FloatingFocusManager context={context} modal={false}>
				<div
					data-testid="DropdownContent"
					ref={refs.setFloating}
					style={{ ...floatingStyles }}
					{...getFloatingProps()}
					className={cn(
						"shadow-xl! outline-hidden z-50 w-full rounded-xl border border-transparent bg-white dim:border-theme-dim-700 dim:bg-theme-dim-900 dark:border-theme-dark-700 dark:bg-theme-dark-900 sm:w-auto",
						className,
					)}
				>
					{top}
					{children}
					{bottom}
				</div>
			</FloatingFocusManager>
		</FloatingPortal>
	);
};

export const DropdownListItem = (props: React.HTMLProps<HTMLLIElement> & { close?: boolean }) => {
	const { setOpen } = useDropdown();
	return (
		<li
			data-testid="DropdownListItem"
			{...props}
			className={twMerge(
				"focus:outline-hidden m-1 flex cursor-pointer items-center space-x-2 whitespace-nowrap rounded-lg px-5 py-4 text-base font-semibold text-theme-secondary-700 transition-colors-shadow duration-100 hover:bg-theme-secondary-200 hover:text-theme-secondary-900 focus:ring-2 focus:ring-inset focus:ring-theme-primary-400 dim:text-theme-dim-200 dim-hover:bg-theme-dim-700 dim-hover:text-theme-dim-50 dark:text-theme-dark-200 dark:hover:bg-theme-dark-700 dark:hover:text-theme-dark-50",
				props.className,
			)}
			onClick={(event) => {
				if (props.close !== false) {
					setOpen(false);
				}
				props.onClick?.(event);
			}}
		/>
	);
};
