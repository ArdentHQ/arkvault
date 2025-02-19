import cn from "classnames";
import React, { cloneElement, FC, useCallback, useState } from "react";

import { DropdownOption, DropdownProperties, DropdownVariantType } from "./Dropdown.contracts";
import { renderOptions } from "./Dropdown.helpers";
import { Icon } from "@/app/components/Icon";
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
} from "@floating-ui/react";
import { twMerge } from "tailwind-merge";
import classNames from "classnames";

export const Wrapper = ({ variant, ...props }: { variant?: DropdownVariantType } & React.HTMLProps<HTMLDivElement>) => (
	<div
		{...props}
		className={twMerge(
			cn({
				"py-3 dark:bg-theme-secondary-800": variant === undefined,
				"rounded-xl": variant !== "navbar",
			}),
			props.className,
		)}
	/>
);

export const Dropdown: FC<DropdownProperties> = ({
	children,
	top,
	bottom,
	wrapperClass,
	variant,
	options,
	onSelect,
	placement = "bottom",
	toggleIcon = "Gear",
	toggleSize,
	toggleContent,
	disableToggle = false,
	closeOnSelect,
	...properties
}) => {
	const [isOpen, setIsOpen] = useState(false);

	const onSelectOption = useCallback(
		(option: DropdownOption) => {
			if (closeOnSelect !== false) {
				setIsOpen(false);
			}

			if (typeof onSelect === "function") {
				onSelect(option);
			}
		},
		[onSelect],
	);

	const renderToggle = () => {
		if (!toggleContent) {
			return (
				<div className="cursor-pointer outline-none focus:outline-none">
					<Icon name={toggleIcon} size={toggleSize} />
				</div>
			);
		}

		// Call children as a function and provide isOpen state
		if (typeof toggleContent === "function") {
			return toggleContent(isOpen);
		}

		// Render children as provided
		return toggleContent;
	};

	const { refs, floatingStyles, context } = useFloating({
		middleware: [offset(10), flip(), shift()],
		onOpenChange: setIsOpen,
		open: isOpen,
		placement: placement,
		whileElementsMounted: autoUpdate,
	});

	const click = useClick(context, {
		enabled: !disableToggle,
	});

	const dismiss = useDismiss(context);
	const role = useRole(context);

	// Merge all the interactions into prop getters
	const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

	const testId: string | undefined = properties["data-testid"];
	const testIdSuffix = testId ? `-${testId}` : "";

	const clonedElement = children ? cloneElement(children, { hideDropdown: () => setIsOpen(false) }) : undefined;

	return (
		<>
			<div
				data-testid={"dropdown__toggle" + testIdSuffix}
				ref={refs.setReference}
				{...getReferenceProps({
					onClick(event) {
						event.stopPropagation();
						event.preventDefault();
					},
				})}
			>
				{renderToggle()}
			</div>

			{isOpen && (
				<FloatingPortal>
					<div
						ref={refs.setFloating}
						className={twMerge(
							"z-40 w-full sm:w-auto",
							classNames({
								"px-5 sm:px-0": variant !== "navbar",
								"rounded-none": variant === "navbar",
							}),
							wrapperClass,
						)}
						style={floatingStyles}
						{...getFloatingProps()}
						data-testid={"dropdown__content" + testIdSuffix}
					>
						<Wrapper
							variant={options && variant === undefined ? "options" : variant}
							className="dropdown-body overflow-hidden bg-theme-background py-0 shadow-xl sm:px-1"
						>
							{top}
							{options?.length && renderOptions({ onSelect: onSelectOption, options })}
							{clonedElement && <div>{clonedElement}</div>}
							{bottom}
						</Wrapper>
					</div>
				</FloatingPortal>
			)}
		</>
	);
};
