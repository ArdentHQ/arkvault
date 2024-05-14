import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";

import { TransferLedgerReview } from "./LedgerReview";
import { env, getDefaultProfileId, renderWithForm, screen } from "@/utils/testing-library";
import * as envHooks from "@/app/hooks/env";

describe("TransferLedgerReview", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();
	});

	it("should render", () => {
		const { asFragment } = renderWithForm(<TransferLedgerReview wallet={wallet} estimatedExpiration={123} />, {
			defaultValues: {
				fee: "0",
				recipients: [],
			},
			registerCallback: ({ register }) => {
				register("fee");
				register("recipients");
			},
		});

		expect(screen.getByText("123")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with multiple recipients", () => {
		const useActiveProfileSpy = vi.spyOn(envHooks, "useActiveProfile").mockReturnValue(profile);

		renderWithForm(<TransferLedgerReview wallet={wallet} estimatedExpiration={123} />, {
			defaultValues: {
				fee: "0",
				recipients: [
					{
						address: "DRgF3PvzeGWndQjET7dZsSmnrc6uAy23ES",
						amount: 1,
					},
					{
						address: "DJpFwW39QnQvQRQJF2MCfAoKvsX4DJ28jq",
						amount: 2,
					},
				],
			},
			registerCallback: ({ register }) => {
				register("fee");
				register("recipients");
			},
		});

		expect(screen.getByText("123")).toBeInTheDocument();

		expect(screen.getAllByTestId("recipient-list__recipient-list-item")).toHaveLength(2);

		useActiveProfileSpy.mockRestore();
	});

	it("should render with memo", () => {
		const { asFragment } = renderWithForm(<TransferLedgerReview wallet={wallet} estimatedExpiration={123} />, {
			defaultValues: {
				fee: "0",
				memo: "test",
				recipients: [],
			},
			registerCallback: ({ register }) => {
				register("memo");
				register("fee");
				register("recipients");
			},
		});

		expect(screen.getByText("123")).toBeInTheDocument();
		expect(screen.getByTestId("TransactionMemo")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render skeleton while loading expiration", () => {
		const { asFragment } = renderWithForm(
			<TransferLedgerReview wallet={wallet} estimatedExpiration={undefined} />,
			{
				defaultValues: {
					fee: "0",
					recipients: [],
				},
				registerCallback: ({ register }) => {
					register("fee");
					register("recipients");
				},
			},
		);

		expect(screen.getByTestId("TransferLedgerReview__expiration-skeleton")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
