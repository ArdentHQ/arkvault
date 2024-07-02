/* eslint-disable @typescript-eslint/require-await */
import { act, renderHook } from "@testing-library/react-hooks";

import { waitFor } from "@/utils/testing-library";

import { useTransactionExportForm } from "./use-transaction-export-form";

describe("useTransactionExportForm", () => {
	it("should be invalid if all toggles are off", async () => {
		const { result } = renderHook(() => useTransactionExportForm());

		act(() => {
			result.current.setValue("includeCryptoAmount", false);
			result.current.setValue("includeDate", false);
			result.current.setValue("includeFiatAmount", false);
			result.current.setValue("includeSenderRecipient", false);
			result.current.setValue("includeTransactionId", false);
		});

		await waitFor(() => expect(result.current.formState.isValid).toBe(false));
	});
});
