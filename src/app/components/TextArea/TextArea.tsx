import cn from "classnames";
import React, { useEffect } from "react";

import { Input, InputProperties } from "@/app/components/Input";
import { twMerge } from "tailwind-merge";

type TextareaProperties = {
	isInvalid?: boolean;
	palceholder?: string;
	initialHeight?: number;
	hideResizeIcon?: boolean;
	ref?: React.Ref<HTMLInputElement>;
	addons?: InputProperties['addons'];
} & React.TextareaHTMLAttributes<any>;

export const TextArea = ({ ref, hideResizeIcon, initialHeight = 100, ...properties }: TextareaProperties) => {
	useEffect(() => {
		const current = ref && "current" in ref ? ref.current : null;
		if (current) {
			current.style.height = `${initialHeight}px`;
			// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
			current.style.height = `${current.scrollHeight + 4}px`;
		}
	}, [ref, properties.value, initialHeight]);

	return (
		<div className="relative">
			{!hideResizeIcon && <div className="border-t-theme-secondary-400 dark:border-t-theme-secondary-700 dim:border-t-theme-dim-500 pointer-events-none absolute right-3 bottom-4 z-10 hidden h-0 w-0 -rotate-45 border-x-8 border-t-8 border-x-transparent md:block" />}

			<Input
				data-testid="TextArea"
				as="textarea"
				isTextArea
				ref={ref}
				{...properties}
				innerClassName={twMerge(cn("resize-none min-h-[8rem] md:min-h-auto md:resize-y", {
					"resize-none md:resize-none": properties.disabled || hideResizeIcon,
				}))}
			/>
		</div>
	);
};

TextArea.displayName = "TextArea";
