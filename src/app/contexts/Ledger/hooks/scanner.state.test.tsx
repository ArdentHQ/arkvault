import { renderHook, act } from "@testing-library/react";
import { useReducer } from "react";

import { Action, scannerReducer, State } from "./scanner.state";
import { waitFor } from "@/utils/testing-library";
import { LedgerData } from "@/app/contexts";

const toggleSelectAction: Action = {
	path: `44'/1'/1'/0/0`,
	type: "toggleSelect",
};

const toggleSelectAllAction: Action = {
	type: "toggleSelectAll",
};

const initialState = (path?: string, wallets?: LedgerData[]): State => {
	const state: State = {
		selected: [],
		wallets: [
			{
				address: "DJpFwW39QnQvQRQJF2MCfAoKvsX4DJ28jq",
				path: `44'/1'/0'/0/0`,
			},
		],
	};

	if (path) {
		state.selected.push(path);
	}

	if (wallets?.length) {
		state.wallets = [...state.wallets, ...wallets];
	}

	return state;
};

describe("Scanner State", () => {
	it("should dispatch toggleSelect with selected", async () => {
		const { result } = renderHook(() => useReducer(scannerReducer, initialState(`44'/1'/1'/0/0`)));
		const [, dispatch] = result.current;

		act(() => {
			dispatch(toggleSelectAction);
		});

		await waitFor(() => expect(result.current[0].selected).toStrictEqual([]));
	});

	it("should dispatch toggleSelect without selected", async () => {
		const { result } = renderHook(() => useReducer(scannerReducer, initialState()));
		const [, dispatch] = result.current;

		act(() => {
			dispatch(toggleSelectAction);
		});

		await waitFor(() => expect(result.current[0].selected).toStrictEqual([`44'/1'/1'/0/0`]));
	});

	it("should dispatch toggleSelectAll with selected length and wallets length", async () => {
		const { result } = renderHook(() =>
			useReducer(
				scannerReducer,
				initialState(`44'/1'/1'/0/0`, [
					{
						address: "DJpFwW39QnQvQRQJF2MCfAoKvsX4DJ28jq",
						path: `44'/1'/2'/0/0`,
					},
				]),
			),
		);
		const [, dispatch] = result.current;

		act(() => {
			dispatch(toggleSelectAllAction);
		});

		await waitFor(() => expect(result.current[0].selected).toStrictEqual([`44'/1'/0'/0/0`, `44'/1'/2'/0/0`]));
	});

	it("should dispatch toggleSelectAll without selected", async () => {
		const { result } = renderHook(() => useReducer(scannerReducer, initialState()));
		const [, dispatch] = result.current;

		act(() => {
			dispatch(toggleSelectAllAction);
		});

		await waitFor(() => expect(result.current[0].selected).toStrictEqual([`44'/1'/0'/0/0`]));
	});

	it("should dispatch failed", async () => {
		const { result } = renderHook(() => useReducer(scannerReducer, initialState(`44'/1'/1'/0/0`)));
		const [, dispatch] = result.current;

		act(() => {
			dispatch({
				error: "Failed",
				type: "failed",
			});
		});

		await waitFor(() => expect(result.current[0].error).toBe("Failed"));
	});
});
