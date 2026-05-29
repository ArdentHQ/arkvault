import { describe, expect, it, vi, beforeEach } from "vitest";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { render, screen, waitFor } from "@/utils/testing-library";
import { LedgerConnectionStep } from "./LedgerConnectionStep";
import { useLedgerContext } from "@/app/contexts/Ledger";

const defaultLedgerContext = {
	abortConnectionRetry: vi.fn(),
	connect: vi.fn(),
	error: "",
	isConnected: false,
};

vi.mock("@/app/contexts/Ledger", () => ({
	useLedgerContext: vi.fn(() => defaultLedgerContext),
}));

vi.mock("@/app/hooks", async (importOriginal) => {
	const original = await importOriginal<typeof import("@/app/hooks")>();
	return {
		...original,
		useActiveProfile: vi.fn(() => ({ id: () => "test-profile" })),
	};
});

const networkMock = {
	coin: () => "Mainsail",
	id: () => "mainsail.mainnet",
	isLive: () => true,
	isTest: () => false,
	ticker: () => "ARK",
};

describe("LedgerConnectionStep component", () => {
	beforeEach(() => {
		vi.mocked(useLedgerContext).mockReturnValue({ ...defaultLedgerContext });
	});

	const Component = ({
		onConnect = vi.fn(),
		onFailed = vi.fn(),
		cancelling = false,
	}: {
		onConnect?: () => void;
		onFailed?: (error: Error) => void;
		cancelling?: boolean;
	}) => {
		const form = useForm();
		return (
			<FormProvider {...form}>
				<LedgerConnectionStep
					network={networkMock as any}
					onConnect={onConnect}
					onFailed={onFailed}
					cancelling={cancelling}
				/>
			</FormProvider>
		);
	};

	it("should call setValue and onConnect when isConnected becomes true", async () => {
		const onConnect = vi.fn();

		vi.mocked(useLedgerContext).mockReturnValue({
			...defaultLedgerContext,
			isConnected: true,
		});

		const { getByTestId } = render(<Component onConnect={onConnect} />);

		await waitFor(() => {
			expect(getByTestId("LedgerConnectionStep")).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(onConnect).toHaveBeenCalled();
		});
	});

	it("should render LedgerCancelling when cancelling is true", () => {
		render(<Component cancelling />);

		expect(screen.getByTestId("LedgerCancellingScreen")).toBeInTheDocument();
		expect(screen.queryByTestId("LedgerConnectionStep")).not.toBeInTheDocument();
	});
});
