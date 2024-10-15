import React, { useRef, VFC } from "react";
import cn from "classnames";

interface InputSuggestionProperties {
	innerClassName?: string;
	suggestion?: string;
	hiddenReference?: React.RefObject<HTMLElement>;
}

export const InputSuggestion: VFC<InputSuggestionProperties> = ({ hiddenReference, suggestion, innerClassName }) => {
	const suggestionReference = useRef<HTMLSpanElement>(null);

	if (!suggestion) {
		return null;
	}

	const hideSuggestion = () => {
		const suggestionWidth = suggestionReference.current?.clientWidth || 0;
		const parentWidth = suggestionReference.current?.parentElement?.clientWidth || 0;

		/* istanbul ignore next -- @preserve */
		if (!suggestionWidth || suggestionWidth < parentWidth) {
			return false;
		}

		/* istanbul ignore next -- @preserve */
		return (hiddenReference?.current?.clientWidth || 0) >= suggestionWidth;
	};

	return (
		<span
			data-testid="Input__suggestion"
			className={cn(
				"pointer-events-none absolute inset-y-0 text-sm sm:text-base flex w-full items-center font-normal opacity-50",
				{ invisible: hideSuggestion() },
				innerClassName,
			)}
		>
			<span ref={suggestionReference} className="truncate">
				{suggestion}
			</span>
		</span>
	);
};
