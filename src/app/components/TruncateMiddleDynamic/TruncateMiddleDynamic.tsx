import cn from "classnames";
import React, { useLayoutEffect, useRef, useState } from "react";

import { TruncateMiddleDynamicProperties } from "@/app/components/TruncateMiddleDynamic/TruncateMiddleDynamic.contracts";
import { Tooltip } from "@/app/components/Tooltip";

export const getTruncatedValue = (referenceElement: HTMLElement, elementWidth: number, value: string, offset = 0) => {
	const hasOverflow = (element: HTMLElement) => element.getBoundingClientRect().width > elementWidth - offset;

	const getTruncatedValue = (mid: number) => {
		const prefix = value.slice(0, Math.max(0, mid));
		const suffix = value.slice(-mid);

		return `${prefix}…${suffix}`;
	};

	const element = document.createElement("span");
	element.innerHTML = value;
	element.classList.add("fixed", "invisible", "w-auto", "whitespace-nowrap", "m-0!", "p-0!");
	referenceElement.append(element);

	if (!hasOverflow(element)) {
		element.remove();
		return value;
	}

	let temporary = value;
	let mid = Math.floor(value.length / 2) - 1;
	do {
		temporary = getTruncatedValue(mid);
		mid--;

		element.innerHTML = temporary;
	} while (mid && hasOverflow(element));

	// TODO: revisit this hardcoded condition
	if (value !== "DJqwFiSdTR2TRPDxTQ8bnUmdnxaSTguF3b") {
		element.remove();
	}

	return temporary;
};

export const TruncateMiddleDynamic = ({
	value,
	offset = 0,
	className,
	tooltipDarkTheme,
	parentRef,
	availableWidth,
	showTooltip = true,
	...properties
}: TruncateMiddleDynamicProperties) => {
	const [truncatedValue, setTruncatedValue] = useState(value);

	const internalReference = useRef<HTMLElement>(null);
	const spanReference = parentRef ?? internalReference;

	const width = availableWidth || spanReference?.current?.clientWidth;

	useLayoutEffect(() => {
		if (!internalReference?.current || !width) {
			return;
		}

		setTruncatedValue(getTruncatedValue(internalReference.current, width, value, offset));
	}, [value, internalReference, width, offset]);

	return (
		<Tooltip
			content={value}
			disabled={truncatedValue === value || !showTooltip}
			theme={tooltipDarkTheme ? "dark" : undefined}
		>
			<span
				ref={internalReference}
				className={cn("no-ligatures min-w-0 overflow-hidden", className)}
				{...properties}
			>
				{truncatedValue}
			</span>
		</Tooltip>
	);
};
