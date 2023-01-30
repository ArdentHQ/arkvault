import cn from "classnames";
import React from "react";
import tw, { styled } from "twin.macro";

import { Tooltip } from "@/app/components/Tooltip";

type TruncateMiddleProperties = {
	text: string;
	maxChars?: number;
	as?: React.ElementType;
	showTooltip?: boolean;
} & React.HTMLProps<any>;

const Wrapper = styled.span``;

export const TruncateMiddle = React.forwardRef<HTMLElement, TruncateMiddleProperties>(
	({ className, text, maxChars = 16, showTooltip = true, ...properties }: TruncateMiddleProperties, reference) => {
		const result = React.useMemo(() => {
			if (!maxChars || text.length <= maxChars) {
				return text;
			}

			const midPos = Math.floor(maxChars / 2) - 2;
			const start = text.slice(0, Math.max(0, midPos));
			const end = text.slice(text.length - midPos, text.length);

			return `${start}…${end}`;
		}, [maxChars, text]);

		return (
			<Tooltip content={text} disabled={!showTooltip}>
				<Wrapper ref={reference} data-testid="TruncateMiddle" className={cn("no-ligatures", className)} {...properties}>
					{result}
				</Wrapper>
			</Tooltip>
		);
	},
);

TruncateMiddle.displayName = "TruncateMiddle";
