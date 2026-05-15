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
	addons?: InputProperties["addons"];
} & React.TextareaHTMLAttributes<any>;

export const TextArea = ({ ref, hideResizeIcon = false, initialHeight = 100, ...properties }: TextareaProperties) => {
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
			{!hideResizeIcon && (
				<div className="pointer-events-none absolute bottom-4 right-3 z-10 hidden h-0 w-0 -rotate-45 border-x-8 border-t-8 border-x-transparent border-t-theme-secondary-400 dim:border-t-theme-dim-500 dark:border-t-theme-secondary-700 md:block" />
			)}

			<Input
				data-testid="TextArea"
				as="textarea"
				isTextArea
				ref={ref}
				{...properties}
				innerClassName={twMerge(
					cn("resize-none min-h-[8rem] md:min-h-auto md:resize-y", {
						"resize-none": properties.disabled,
						"resize-none md:resize-none": hideResizeIcon,
					}),
				)}
			/>
		</div>
	);
};

TextArea.displayName = "TextArea";
