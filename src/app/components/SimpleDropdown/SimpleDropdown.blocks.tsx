import { twMerge } from "tailwind-merge";
import React, { ReactNode, FC, HTMLProps } from "react";
import { FloatingPortal, FloatingFocusManager } from "@floating-ui/react";
import cn from "classnames";
import { useDropdown } from "./SimpleDropdown";

export const DropdownToggle: FC<HTMLProps<HTMLButtonElement>> = ({ children, ...props }) => {
	const { refs, getReferenceProps, setOpen } = useDropdown();
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
			{children}
		</button>
	);
};

export const DropdownContent: FC<{ children: ReactNode; className?: string }> = ({ children, className }) => {
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
					style={floatingStyles}
					{...getFloatingProps()}
					className={cn(
						"dark:bg-theme-dark-900 dark:border-theme-dark-700 dim:bg-theme-dim-900 dim:border-theme-dim-700 z-50 w-auto rounded-xl border border-transparent bg-white shadow-xl! outline-hidden",
						className,
					)}
				>
					{children}
				</div>
			</FloatingFocusManager>
		</FloatingPortal>
	);
};

export const DropdownListItem = (props: React.HTMLProps<HTMLLIElement>) => {
	const { setOpen } = useDropdown();
	return (
		<li
			data-testid="DropdownListItem"
			{...props}
			className={twMerge(
				"text-theme-secondary-700 transition-colors-shadow hover:bg-theme-secondary-200 hover:text-theme-secondary-900 focus:ring-theme-primary-400 dark:text-theme-dark-200 dark:hover:bg-theme-dark-700 dark:hover:text-theme-dark-50 dim:text-theme-dim-200 dim-hover:bg-theme-dim-700 dim-hover:text-theme-dim-50 my-0.5 flex cursor-pointer items-center justify-between rounded-lg px-5 py-[14px] text-base font-semibold whitespace-nowrap duration-100 focus:ring-2 focus:outline-hidden focus:ring-inset",
				props.className,
			)}
			onClick={(event) => {
				setOpen(false);
				props.onClick?.(event);
			}}
		/>
	);
};
