import { renderHook } from "@testing-library/react";

import { OptionsValue, useImportOptions } from "./use-import-options";
import { beforeAll } from "vitest";

describe("useImportOptions", () => {
	it("should return options and default option", () => {
		const {
			result: { current },
		} = renderHook(() =>
			useImportOptions({
				address: {
					default: true,
					permissions: [],
				},
			}),
		);

		expect(current.options).toHaveLength(2);
		expect(current.options[1].value).toBe(OptionsValue.ADDRESS);
		expect(current.defaultOption).contains({ label: "Address", value: OptionsValue.ADDRESS });
	});

	it("should return options from the available options", () => {
		const {
			result: { current },
		} = renderHook(() =>
			useImportOptions({
				address: {
					default: true,
					permissions: [],
				},
				secret: {
					default: false,
					permissions: [],
				},
			}),
		);

		expect(current.options).toHaveLength(3);
		expect(current.options[0].value).toBe(OptionsValue.LEDGER);

		expect(current.options[1].value).toBe(OptionsValue.SECRET);
		expect(current.options[1].canBeEncrypted).toBeDefined();
		expect(current.options[2].value).toBe(OptionsValue.ADDRESS);
		expect(current.options[2].canBeEncrypted).toBeDefined();
	});

	it("should convert method name", () => {
		const {
			result: { current },
		} = renderHook(() =>
			useImportOptions({
				bip38: {
					default: false,
					permissions: [],
				},
				bip84: {
					default: true,
					permissions: [],
				},
			}),
		);

		expect(current.options).toHaveLength(2);
		expect(current.options[1].value).toBe(OptionsValue.BIP84);
	});

	it("should return default option if exist in the available options", () => {
		const {
			result: { current },
		} = renderHook(() =>
			useImportOptions({
				address: {
					default: false,
					permissions: [],
				},
				secret: {
					default: true,
					permissions: [],
				},
			}),
		);

		expect(current.defaultOption).contains({ label: "Secret", value: OptionsValue.SECRET });
	});

	it("should return first option as default if doesn't have default option in network", () => {
		const {
			result: { current },
		} = renderHook(() =>
			useImportOptions({
				address: {
					default: false,
					permissions: [],
				},
				discovery: {
					default: false,
					permissions: [],
				},
			}),
		);

		expect(current.defaultOption).contains({
			label: "Ledger",
			value: OptionsValue.LEDGER,
		});
	});
});
