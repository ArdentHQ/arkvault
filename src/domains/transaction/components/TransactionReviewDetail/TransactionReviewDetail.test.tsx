import React from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { RecipientProperties } from "./SearchRecipient.contracts";
import { env, getDefaultProfileId, render, screen, waitFor, within, renderResponsive } from "@/utils/testing-library";
import { TransactionReviewDetail, TransactionReviewLabelText } from "./TransactionReviewDetail"
import { translations } from "@/app/i18n/common/i18n";

describe("TransactionAddresses", () => {
	let profile: Contracts.IProfile;
	let recipients: RecipientProperties[];

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		const wallets: Contracts.IReadWriteWallet[] = profile.wallets().values();

		recipients = wallets.map((wallet) => ({
			address: wallet.address(),
			alias: wallet.alias(),
			avatar: wallet.avatar(),
			id: wallet.id(),
			network: wallet.networkId(),
			type: "wallet",
		}));
	});

	it.each(["sm", "md", "lg"])("should render TransactionReviewDetail in %s", (breakpoint: string) => {
		const { container } = renderResponsive(<TransactionReviewDetail>
			<div data-testid="content" />
		</TransactionReviewDetail>, breakpoint);

		expect(screen.getByTestId("TransactionReviewDetail")).toBeInTheDocument();
		expect(screen.getByTestId("content")).toBeInTheDocument();
	});

	it("should render TransactionReviewDetail ", () => {
		const { container } = render(<TransactionReviewDetail label="label-text"> <div data-testid="content" /> </TransactionReviewDetail>);

		expect(screen.getByTestId("TransactionReviewDetail")).toBeInTheDocument();
		expect(screen.getByTestId("TransactionReviewDetailLabel")).toBeInTheDocument();
		expect(screen.getByTestId("content")).toBeInTheDocument();
		expect(screen.getByText("label-text")).toBeInTheDocument();
	});

	it.each(["sm", "md", "lg"])("should render TransactionReviewLabelText in %s", (breakpoint: string) => {
		const { container } = renderResponsive(<TransactionReviewLabelText>
			<div data-testid="content" />
		</TransactionReviewLabelText>, breakpoint);

		expect(screen.getByTestId("TransactionReviewLabelText")).toBeInTheDocument();
		expect(screen.getByTestId("content")).toBeInTheDocument();
	});
});
