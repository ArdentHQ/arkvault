import React from "react";
import tw, { styled } from "twin.macro";

import { Tooltip } from "@/app/components/Tooltip";

type Properties = {
	text: string;
	maxChars?: number;
	as?: React.ElementType;
	showTooltip?: boolean;
} & React.HTMLProps<any>;

const Wrapper = styled.span(() => tw`transition-colors duration-200`);

export const TruncateEnd = ({ text, maxChars = 16, showTooltip = true, ...properties }: Properties) => {
	const result = React.useMemo(() => {
		if (!maxChars || text.length <= maxChars) {
			return text;
		}

		const start = text.slice(0, Math.max(0, maxChars));

		return `${start}…`;
	}, [maxChars, text]);

	return (
		<Tooltip content={text} disabled={!showTooltip}>
			<Wrapper data-testid="TruncateEnd" {...properties}>
				{result}
			</Wrapper>
		</Tooltip>
	);
};
