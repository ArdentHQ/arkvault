import cn from "classnames";
import React, { FC, useCallback, useEffect, useState } from "react";
import { styled } from "twin.macro";

import { DropdownOption, DropdownProperties, DropdownVariantType } from "./Dropdown.contracts";
import { defaultClasses, getStyles } from "./Dropdown.styles";
import { renderOptions } from "./Dropdown.helpers";
import { Icon } from "@/app/components/Icon";
import { clickOutsideHandler } from "@/app/hooks";
import { Position } from "@/types";

export const Wrapper = styled.div<{ position?: Position; variant: DropdownVariantType }>(getStyles);

export const Dropdown: FC<DropdownProperties> = ({
	children,
	top,
	dropdownClass,
	variant,
	options,
	onSelect,
	position = "right",
	toggleIcon = "Gear",
	toggleSize,
	toggleContent,
	disableToggle = false,
	...properties
}) => {
	const rootDivReference = React.useRef<HTMLDivElement>(null);
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

	const toggleHandler = useCallback(
		(event: React.MouseEvent) => {
			if (disableToggle) {
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			setIsOpen(!isOpen);
		},
		[disableToggle, setIsOpen, isOpen],
	);

	const hide = useCallback(() => setIsOpen(false), [setIsOpen]);

	const handleResize = useCallback(() => {
		const parentElement = rootDivReference.current;
		if (!parentElement) {
			return;
		}

		const numberFromPixels = (value: string): number => (value ? Number.parseInt(value.replace("px", "")) : 0);

		const OFFSET = 30;

		const toggleElement = parentElement.querySelector<HTMLElement>('[data-testid="dropdown__toggle"]');
		const dropdownElement = parentElement.querySelector<HTMLElement>('[data-testid="dropdown__content"]');

		if (!toggleElement || !dropdownElement) {
			return;
		}

		const setStyles = (styles: Partial<CSSStyleDeclaration>) => {
			Object.assign(dropdownElement.style, styles);
		};

		const toggleHeight = toggleElement.parentElement!.offsetHeight;

		const spaceBefore = toggleElement.getBoundingClientRect().top + document.documentElement.scrollTop;
		const spaceAfter = document.body.clientHeight - (spaceBefore + toggleHeight);

		setStyles({ height: "", marginTop: "" });

		const styles = getComputedStyle(dropdownElement);

		const calculatedSpace = dropdownElement.offsetHeight + numberFromPixels(styles.marginTop) + OFFSET;
		if (spaceAfter < calculatedSpace && spaceBefore > calculatedSpace) {
			setStyles({
				marginTop: `-${dropdownElement.offsetHeight + toggleHeight + numberFromPixels(styles.marginTop)}px`,
				opacity: "1",
			});
			return;
		}

		const newHeight = spaceAfter - numberFromPixels(styles.marginTop) - OFFSET;

		const newStyles =
			newHeight >=
			dropdownElement.firstElementChild!.clientHeight +
				numberFromPixels(styles.paddingTop) +
				numberFromPixels(styles.paddingBottom)
				? {
						height: "",
						overflowY: "",
					}
				: {
						height: `${newHeight}px`,
						marginTop: "",
						overflowY: "scroll",
					};

		setStyles({ opacity: "1", ...newStyles });
	}, [rootDivReference]);

	useEffect(() => {
		if (isOpen) {
			window.addEventListener("resize", handleResize);
		}

		handleResize();

		return () => window.removeEventListener("resize", handleResize);
	}, [isOpen, handleResize]);

	useEffect(() => clickOutsideHandler(rootDivReference, hide), [rootDivReference, hide]);

	useEffect(() => {
		const handleKeys = (event: KeyboardEvent) => {
			/* istanbul ignore next -- @preserve */
			if (event.key === "Escape") {
				hide();
			}
		};

		if (isOpen) {
			window.addEventListener("keydown", handleKeys);
		}

		return () => window.removeEventListener("keydown", handleKeys);
	}, [isOpen, hide]);

	return (
		<div ref={rootDivReference} className="static sm:relative" {...properties}>
			<span data-testid="dropdown__toggle" onClick={toggleHandler}>
				{renderToggle()}
			</span>

			{isOpen && (
				<Wrapper
					data-testid="dropdown__content"
					position={position}
					variant={variant || options ? "options" : "custom"}
					className={cn("opacity-0", defaultClasses, dropdownClass)}
				>
					{top}
					{options?.length && renderOptions({ onSelect: onSelectOption, options })}
					{children && <div>{children}</div>}
				</Wrapper>
			)}
		</div>
	);
};
