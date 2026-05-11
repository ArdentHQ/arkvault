import { useRef } from "react";
import { ResizeContainer } from "./ResizeContainer";

interface Dimensions {
	width: number;
	lineHeight: number;
}
function MiddleTruncateContent({ text = "", dimensions }: { text?: string; dimensions: Dimensions }) {
	const ghostRef = useRef<HTMLSpanElement>(null);

	const middlePosition = Math.floor(text.length / 2);
	const firstHalf = text.slice(0, middlePosition);
	const secondHalf = text.slice(middlePosition);

	// Ghost element always has the actual size of the text.
	const offset = 5;
	const ghostWidth = ghostRef.current?.clientWidth ?? 0;
	const isFitting = dimensions?.width >= ghostWidth - offset;

	return (
		<span className="flex w-full items-start overflow-y-hidden" style={{ height: `${dimensions.lineHeight}px` }}>
			<span ref={ghostRef} className="invisible absolute left-0 whitespace-nowrap">
				{text}
			</span>

			{isFitting === true && (
				<span className="no-ligatures truncate break-all whitespace-break-spaces">{text}</span>
			)}

			{isFitting === false && (
				<>
					<span className="rtl no-ligatures block w-full min-w-0 text-right break-all whitespace-break-spaces">
						{firstHalf.split("").map((char, index) => (
							<span key={index}>{char}</span>
						))}
					</span>
					<span className="block shrink-0">...</span>
					<span className="no-ligatures block w-full min-w-0 text-left break-all whitespace-break-spaces">
						{secondHalf.split("").map((char, index) => (
							<span key={middlePosition + index}>{char}</span>
						))}
					</span>
				</>
			)}
		</span>
	);
}

export function MiddleTruncate({ text }: { text?: string }) {
	return (
		<ResizeContainer>
			{(dimensions: Dimensions) => <MiddleTruncateContent text={text} dimensions={dimensions} />}
		</ResizeContainer>
	);
}
