import { DTO } from "@/app/lib/profiles";
import { useCallback, useMemo, useRef } from "react";

type ConfirmedTransaction = DTO.ExtendedConfirmedTransactionData;

interface TransactionPaginationProperties {
	limit: number;
}

export interface TransactionPagination {
	reset: () => void;
	startAt: (items: ConfirmedTransaction[]) => void;
	nextCursor: () => number;
	acceptPage: (page: number, items: ConfirmedTransaction[]) => ConfirmedTransaction[];
	dedupe: (items: ConfirmedTransaction[]) => ConfirmedTransaction[];
	hasMorePages: (itemsLength: number, hasMorePages: boolean, itemsLimit?: number) => boolean;
}

export const useTransactionPagination = ({ limit }: TransactionPaginationProperties): TransactionPagination => {
	const cursorRef = useRef(1);
	const displayedHashesRef = useRef(new Set<string>());

	const dedupe = useCallback((items: ConfirmedTransaction[]) => {
		const seen = new Set<string>();
		const unique: ConfirmedTransaction[] = [];

		for (const item of items) {
			/* istanbul ignore next -- @preserve */
			if (seen.has(item.hash())) {
				continue;
			}

			seen.add(item.hash());
			unique.push(item);
		}

		return unique;
	}, []);

	const reset = useCallback(() => {
		cursorRef.current = 1;
		displayedHashesRef.current = new Set<string>();
	}, []);

	const startAt = useCallback(
		(items: ConfirmedTransaction[]) => {
			cursorRef.current = 1;
			displayedHashesRef.current = new Set<string>();

			for (const item of dedupe(items)) {
				displayedHashesRef.current.add(item.hash());
			}
		},
		[dedupe],
	);

	const nextCursor = useCallback(() => cursorRef.current + 1, []);

	const acceptPage = useCallback((page: number, items: ConfirmedTransaction[]) => {
		const fresh = items.filter((item) => !displayedHashesRef.current.has(item.hash()));

		cursorRef.current = page;

		for (const item of fresh) {
			displayedHashesRef.current.add(item.hash());
		}

		return fresh;
	}, []);

	const hasMorePages = useCallback(
		(itemsLength: number, hasMorePages: boolean, itemsLimit = limit) => {
			if (itemsLength < itemsLimit) {
				return false;
			}

			return hasMorePages;
		},
		[limit],
	);

	return useMemo(
		() => ({ acceptPage, dedupe, hasMorePages, nextCursor, reset, startAt }),
		[acceptPage, dedupe, hasMorePages, nextCursor, reset, startAt],
	);
};
