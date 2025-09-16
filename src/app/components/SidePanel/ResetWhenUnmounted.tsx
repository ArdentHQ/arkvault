import React, { useCallback, useState, ReactElement } from "react";Add a comment on lines L1 to L7Add diff commentMarkdown input:  edit mode selected.WritePreviewHeadingBoldItalicQuoteCodeLinkUnordered listNumbered listTask listMentionReferenceSaved repliesAdd FilesPaste, drop, or click to add filesCancelCommentStart a reviewReturn to code

export function ResetWhenUnmounted({ children }: { children: ReactElement }) {
	const [resetKey, setResetKey] = useState(0);

	const callbackRef = useCallback((element: Element | null) => {
		if (element === null) {
			setResetKey((previousKey) => previousKey + 1);
		}
	}, []);

	return (
		<div key={resetKey} ref={callbackRef} style={{ display: "contents" }}>
			{children}
		</div>
	);
}
