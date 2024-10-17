import cn from "classnames";
import React, { cloneElement, FC, useCallback, useState } from "react";
import { styled } from "twin.macro";

import { DropdownOption, DropdownProperties, DropdownVariantType } from "./Dropdown.contracts";
import { defaultClasses, getStyles } from "./Dropdown.styles";
import { renderOptions } from "./Dropdown.helpers";
import { Icon } from "@/app/components/Icon";
import { Position } from "@/types";
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

export const Wrapper = styled.div<{ position?: Position; variant: DropdownVariantType }>(getStyles);

export const Dropdown: FC<DropdownProperties> = ({
	children,
	top,
	wrapperClass,
	variant,
	options,
	onSelect,
	placement = "bottom",
	toggleIcon = "Gear",
	toggleSize,
	toggleContent,
	disableToggle = false,
	...properties
}) => {
	const [isOpen, setIsOpen] = useState(false);

	const onSelectOption = useCallback(
		(option: DropdownOption) => {
			setIsOpen(false);
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
						className={twMerge("z-40 w-full px-5 sm:w-auto sm:px-0", wrapperClass)}
						style={floatingStyles}
						{...getFloatingProps()}
						data-testid={"dropdown__content" + testIdSuffix}
					>
						<Wrapper variant={variant || options ? "options" : "custom"} className={cn(defaultClasses)}>
							{top}
							{options?.length && renderOptions({ onSelect: onSelectOption, options })}
							{clonedElement && <div>{clonedElement}</div>}
						</Wrapper>
					</div>
				</FloatingPortal>
			)}
		</>
	);
};
