import { Contracts, ReadOnlyWallet } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { ValidatorFooter } from "./ValidatorFooter";
import { buildTranslations } from "@/app/i18n/helpers";
import { VoteValidatorProperties } from "@/domains/vote/components/ValidatorsTable/ValidatorsTable.contracts";
import { translations as voteTranslations } from "@/domains/vote/i18n";
import { data } from "@/tests/fixtures/coins/mainsail/devnet/validators.json";
import { env, getMainsailProfileId, render, screen, waitFor } from "@/utils/testing-library";

let wallet: Contracts.IReadWriteWallet;
let validator: Contracts.IReadOnlyWallet;

const translations = buildTranslations();

const continueButton = () => screen.getByTestId("ValidatorTable__continue-button");

describe("ValidatorFooter", () => {
	beforeAll(() => {
		const profile = env.profiles().findById(getMainsailProfileId());
		wallet = profile.wallets().values()[0];

		validator = new ReadOnlyWallet({
			address: data[0].address,
			explorerLink: "",
			governanceIdentifier: "address",
			isResignedValidator: false,
			isValidator: true,
			publicKey: data[0].publicKey,
			username: data[0].username,
		});
	});

	it("should render", () => {
		const { container, asFragment } = render(
			<ValidatorFooter
				selectedWallet={wallet}
				availableBalance={wallet.balance()}
				selectedVotes={[]}
				selectedUnvotes={[]}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should show available balance if network requires vote amount", () => {
		const { rerender } = render(
			<ValidatorFooter
				selectedWallet={wallet}
				availableBalance={wallet.balance()}
				selectedVotes={[]}
				selectedUnvotes={[]}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		expect(screen.queryByTestId("ValidatorTable__available-balance")).not.toBeInTheDocument();

		const votesAmountMinimumMock = vi.spyOn(wallet.network(), "votesAmountMinimum").mockReturnValue(10);

		rerender(
			<ValidatorFooter
				selectedWallet={wallet}
				availableBalance={wallet.balance()}
				selectedVotes={[]}
				selectedUnvotes={[]}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		expect(screen.getByTestId("ValidatorTable__available-balance")).toBeInTheDocument();

		votesAmountMinimumMock.mockRestore();
	});

	it("should calculate remaining balance show it", () => {
		const votesAmountMinimumMock = vi.spyOn(wallet.network(), "votesAmountMinimum").mockReturnValue(10);

		render(
			<ValidatorFooter
				selectedWallet={wallet}
				availableBalance={wallet.balance() / 2}
				selectedVotes={[]}
				selectedUnvotes={[]}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		expect(screen.getByTestId("ValidatorTable__available-balance")).toBeInTheDocument();

		expect(
			screen.getByText(
				translations.VOTE.VALIDATOR_TABLE.VOTE_AMOUNT.AVAILABLE_TO_VOTE.replace("{{percent}}", "50"),
			),
		).toBeInTheDocument();

		expect(screen.getByText(`47.63826626162534 ${wallet.network().ticker()}`)).toBeInTheDocument();

		votesAmountMinimumMock.mockRestore();
	});

	it("should disable continue button with tooltip if user doesn't select a validator", async () => {
		const { baseElement } = render(
			<ValidatorFooter
				selectedWallet={wallet}
				availableBalance={wallet.balance()}
				selectedVotes={[]}
				selectedUnvotes={[]}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
				onContinue={vi.fn()}
			/>,
		);

		await waitFor(() => {
			expect(continueButton()).toBeDisabled();
		});

		await userEvent.hover(screen.getByTestId("ValidatorTable__continue--wrapper"));

		expect(baseElement).toHaveTextContent(voteTranslations.VALIDATOR_TABLE.TOOLTIP.SELECTED_VALIDATOR);
	});

	it("should disable continue button with tooltip if there is at least 1 empty amount field when network requires vote amount", async () => {
		const selectedValidator: VoteValidatorProperties[] = [
			{
				amount: 0,
				validatorAddress: validator.address(),
			},
		];

		vi.spyOn(wallet.network(), "votesAmountMinimum").mockReturnValue(2);

		const { baseElement } = render(
			<ValidatorFooter
				selectedWallet={wallet}
				availableBalance={wallet.balance()}
				selectedVotes={selectedValidator}
				selectedUnvotes={[]}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
				onContinue={vi.fn()}
			/>,
		);

		expect(continueButton()).toBeDisabled();

		await userEvent.hover(screen.getByTestId("ValidatorTable__continue--wrapper"));

		expect(baseElement).toHaveTextContent(voteTranslations.VALIDATOR_TABLE.TOOLTIP.INVALID_AMOUNT);
	});
});
