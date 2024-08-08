/* eslint-disable @typescript-eslint/require-await */
import { renderHook, act } from "@testing-library/react";
import { useTransactionExportForm } from "./use-transaction-export-form";
import { waitFor } from "@/utils/testing-library";

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
