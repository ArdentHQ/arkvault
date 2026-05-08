import { useRef, useState, useLayoutEffect } from "react";

interface MiddleTruncateProps {
	text: string;
}

const useAutoComputedStyles = ({ element }: { element: HTMLDivElement | null }) => {
	const [lineHeight, setLineHeight] = useState<number | null>(null);

	useLayoutEffect(() => {
		if (!element) {
			return;
		}

		const computedLineHeight = parseFloat(getComputedStyle(element).lineHeight);
		setLineHeight(computedLineHeight);
	}, [setLineHeight, element]);

	return {
		lineHeight,
	};
};

// Monitor if text is fitting.
const useMonitorOverflow = (container: HTMLDivElement | null, ghost: HTMLSpanElement | null) => {
	const [isFitting, setIsFitting] = useState<boolean | null>(null);

	useLayoutEffect(() => {
		if (!container || !ghost) {
			return;
		}

		const check = () => {
			const fits = ghost.clientWidth <= container.clientWidth;
			console.log("checking if it fits", { container, ghost, fits });
			setIsFitting(fits);
		};

		check();

		const observer = new ResizeObserver(check);
		observer.observe(container);

		return () => observer.disconnect();
	}, [container, ghost]);

	return {
		isFitting,
	};
};

export function MiddleTruncate({ text }: MiddleTruncateProps) {
	const ref = useRef<HTMLDivElement>(null);
	const ghostRef = useRef<HTMLSpanElement>(null);

	const { lineHeight } = useAutoComputedStyles({ element: ref.current });
	const { isFitting } = useMonitorOverflow(ref.current, ghostRef.current);

	const middlePosition = Math.floor(text.length / 2);
	const firstHalf = text.slice(0, middlePosition);
	const secondHalf = text.slice(middlePosition);

	return (
		<div
			ref={ref}
			className="flex w-full items-start overflow-y-hidden"
			style={{ height: lineHeight ? `${lineHeight}px` : undefined }}
		>
			<span ref={ghostRef} className="invisible absolute whitespace-nowrap">
				{text}
			</span>

			{isFitting === true && <span className="truncate">{text}</span>}
			{isFitting === false && (
				<>
					<span className="rtl no-ligatures block w-full min-w-0 text-right break-all whitespace-break-spaces">
						{firstHalf.split("").map((char, index) => (
							<span key={index} className="break-all">
								{char}
							</span>
						))}
					</span>
					<span className="block shrink-0">...</span>
					<span className="no-ligatures block w-full min-w-0 text-left break-all whitespace-break-spaces">
						{secondHalf.split("").map((char, index) => (
							<span key={middlePosition + index} className="break-all">
								{char}
							</span>
						))}
					</span>
				</>
			)}
		</div>
	);
}
