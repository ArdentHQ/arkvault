import React, { ReactNode, FC, HTMLProps } from "react";
import { FloatingPortal, FloatingFocusManager } from "@floating-ui/react";
import { twMerge } from "tailwind-merge";
import cn from "classnames";
import { useDropdown } from "./SimpleDropdown";

export type DropdownToggleChildren = ReactNode | ((props: { isOpen: boolean }) => ReactNode);

interface DropdownToggleProperties extends Omit<HTMLProps<HTMLButtonElement>, "children"> {
	children?: DropdownToggleChildren;
}

export const DropdownToggle: FC<DropdownToggleProperties> = ({ children, ...props }) => {
	const { refs, getReferenceProps, setOpen, open } = useDropdown();
	const renderChildren = () => (typeof children === "function" ? children({ isOpen: open }) : children);

	return (
		<div
			data-testid="dropdown__toggle"
			ref={refs.setReference}
			role="button"
			tabIndex={0}
			{...getReferenceProps(props)}
			onClick={(event) => {
				event.preventDefault();
				setOpen((previous) => !previous);
			}}
			onKeyDown={(event) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					setOpen((previous) => !previous);
				}
			}}
		>
			{renderChildren()}
		</div>
	);
};

export const DropdownContent: FC<{ children?: ReactNode; className?: string }> = ({ children, className }) => {
	const { open, refs, getFloatingProps, floatingStyles, context } = useDropdown();

	if (!open) {
		return <></>;
	}

	return (
		<FloatingPortal>
			<FloatingFocusManager context={context} modal={false}>
				<div
					data-testid="dropdown__content"
					ref={refs.setFloating}
					style={{ ...floatingStyles }}
					{...getFloatingProps()}
					className={cn(
						"shadow-xl! outline-hidden z-50 w-full rounded-xl border border-transparent bg-white dim:border-theme-dim-700 dim:bg-theme-dim-900 dark:border-theme-dark-700 dark:bg-theme-dark-900 sm:w-auto",
						className,
					)}
				>
					{children}
				</div>
			</FloatingFocusManager>
		</FloatingPortal>
	);
};

export const DropdownListItem = (props: HTMLProps<HTMLLIElement> & { close?: boolean }) => {
	const { setOpen } = useDropdown();
	return (
		<li
			data-testid="DropdownListItem"
			{...props}
			className={twMerge(
				"focus:outline-hidden min-w-35 m-1 flex cursor-pointer items-center space-x-2 whitespace-nowrap rounded-lg px-5 py-4 text-base font-semibold text-theme-secondary-700 transition-colors-shadow duration-100 hover:bg-theme-secondary-200 hover:text-theme-secondary-900 focus:ring-2 focus:ring-inset focus:ring-theme-primary-400 dim:text-theme-dim-200 dim-hover:bg-theme-dim-700 dim-hover:text-theme-dim-50 dark:text-theme-dark-200 dark:hover:bg-theme-dark-700 dark:hover:text-theme-dark-50",
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
