import cn from "classnames";
import React, { useEffect } from "react";

import { Input } from "@/app/components/Input";

type TextareaProperties = {
	isInvalid?: boolean;
	palceholder?: string;
	initialHeight?: number;
} & React.TextareaHTMLAttributes<any>;

export const TextArea = React.forwardRef(
	({ initialHeight = 100, ...properties }: TextareaProperties, reference: any) => {
		useEffect(() => {
			const current = reference?.current;
			if (current) {
				current.style.height = `${initialHeight}px`;
				// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
				current.style.height = `${current.scrollHeight + 4}px`;
			}
		}, [reference, properties.value, initialHeight]);

		return (
			<div className="relative">
				<div className="hidden absolute right-3 bottom-4 z-10 w-0 h-0 border-t-8 -rotate-45 pointer-events-none md:block border-t-theme-secondary-400 border-x-8 border-x-transparent dark:border-t-theme-secondary-700" />

				<Input
					data-testid="TextArea"
					as="textarea"
					isTextArea
					ref={reference}
					{...properties}
					innerClassName={cn("resize-none min-h-[8rem] md:min-h-auto md:resize-y", {
						"resize-none": properties.disabled,
					})}
				/>
			</div>
		);
	},
);

TextArea.displayName = "TextArea";
