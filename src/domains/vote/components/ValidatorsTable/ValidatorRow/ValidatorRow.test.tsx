import { Contracts, ReadOnlyWallet } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { ValidatorRow } from "./ValidatorRow";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import { VoteValidatorProperties } from "@/domains/vote/components/ValidatorsTable/ValidatorsTable.contracts";
import { data } from "@/tests/fixtures/coins/mainsail/devnet/validators.json";
import { env, getMainsailProfileId, render, screen } from "@/utils/testing-library";

let wallet: Contracts.IReadWriteWallet;
let validator: Contracts.IReadOnlyWallet;

const firstValidatorVoteButton = () => screen.getByTestId("ValidatorRow__toggle-0");

describe("ValidatorRow", () => {
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
			<table>
				<tbody>
					<ValidatorRow
						index={0}
						validator={validator}
						selectedVotes={[]}
						selectedUnvotes={[]}
						availableBalance={wallet.balance()}
						setAvailableBalance={vi.fn()}
						toggleUnvotesSelected={vi.fn()}
						toggleVotesSelected={vi.fn()}
						selectedWallet={wallet}
					/>
				</tbody>
			</table>,
		);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should emit action on select button", async () => {
		const toggleVotesSelected = vi.fn();
		const { container, asFragment } = render(
			<table>
				<tbody>
					<ValidatorRow
						index={0}
						validator={validator}
						selectedVotes={[]}
						selectedUnvotes={[]}
						availableBalance={wallet.balance()}
						setAvailableBalance={vi.fn()}
						toggleUnvotesSelected={vi.fn()}
						toggleVotesSelected={toggleVotesSelected}
						selectedWallet={wallet}
					/>
				</tbody>
			</table>,
		);

		await userEvent.click(firstValidatorVoteButton());

		expect(container).toBeInTheDocument();
		expect(toggleVotesSelected).toHaveBeenCalledWith(validator.address());
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render the selected validator", () => {
		const selected = [
			{
				amount: 0,
				validatorAddress: validator.address(),
			},
		];

		const { container, asFragment } = render(
			<table>
				<tbody>
					<ValidatorRow
						index={0}
						validator={validator}
						selectedVotes={selected}
						selectedUnvotes={[]}
						availableBalance={wallet.balance()}
						setAvailableBalance={vi.fn()}
						toggleUnvotesSelected={vi.fn()}
						toggleVotesSelected={vi.fn()}
						selectedWallet={wallet}
					/>
				</tbody>
			</table>,
		);

		expect(container).toBeInTheDocument();
		expect(firstValidatorVoteButton()).toHaveTextContent(commonTranslations.SELECTED);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render the selected vote", () => {
		const secondValidator = new ReadOnlyWallet({
			address: data[1].address,
			explorerLink: "",
			governanceIdentifier: "address",
			isResignedValidator: false,
			isValidator: true,
			publicKey: data[1].publicKey,
			username: "testusernaame",
		});

		const thirdValidator = new ReadOnlyWallet({
			address: data[2].address,
			explorerLink: "",
			governanceIdentifier: "address",
			isResignedValidator: false,
			isValidator: true,
			publicKey: data[2].publicKey,
			username: data[2].username,
		});

		const { container, asFragment } = render(
			<table>
				<tbody>
					<ValidatorRow
						index={0}
						validator={validator}
						voted={{
							amount: 10,
							wallet: validator,
						}}
						selectedVotes={[]}
						selectedUnvotes={[]}
						availableBalance={wallet.balance()}
						setAvailableBalance={vi.fn()}
						toggleUnvotesSelected={vi.fn()}
						toggleVotesSelected={vi.fn()}
						selectedWallet={wallet}
					/>
					<ValidatorRow
						index={1}
						validator={secondValidator}
						selectedVotes={[]}
						selectedUnvotes={[]}
						availableBalance={wallet.balance()}
						setAvailableBalance={vi.fn()}
						toggleUnvotesSelected={vi.fn()}
						toggleVotesSelected={vi.fn()}
						selectedWallet={wallet}
					/>
					<ValidatorRow
						index={2}
						validator={thirdValidator}
						selectedVotes={[]}
						selectedUnvotes={[]}
						isVoteDisabled={true}
						availableBalance={wallet.balance()}
						setAvailableBalance={vi.fn()}
						toggleUnvotesSelected={vi.fn()}
						toggleVotesSelected={vi.fn()}
						selectedWallet={wallet}
					/>
				</tbody>
			</table>,
		);

		expect(container).toBeInTheDocument();
		expect(firstValidatorVoteButton()).toHaveTextContent(commonTranslations.CURRENT);
		expect(screen.getByTestId("ValidatorRow__toggle-1")).toHaveTextContent(commonTranslations.SELECT);
		expect(screen.getByTestId("ValidatorRow__toggle-2")).toBeDisabled();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render the unselected vote", () => {
		const selectedUnvotes: VoteValidatorProperties[] = [
			{
				amount: 0,
				validatorAddress: validator.address(),
			},
		];
		const voted: Contracts.VoteRegistryItem = {
			amount: 10,
			wallet: validator,
		};

		const { container, asFragment } = render(
			<table>
				<tbody>
					<ValidatorRow
						index={0}
						validator={validator}
						voted={voted}
						selectedVotes={[]}
						selectedUnvotes={selectedUnvotes}
						availableBalance={wallet.balance()}
						setAvailableBalance={vi.fn()}
						toggleUnvotesSelected={vi.fn()}
						toggleVotesSelected={vi.fn()}
						selectedWallet={wallet}
					/>
				</tbody>
			</table>,
		);

		expect(container).toBeInTheDocument();
		expect(firstValidatorVoteButton()).toHaveTextContent(commonTranslations.UNSELECTED);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render when network requires vote amount", () => {
		const votesAmountMinimumMock = vi.spyOn(wallet.network(), "votesAmountMinimum").mockReturnValue(10);

		const { container, asFragment } = render(
			<table>
				<tbody>
					<ValidatorRow
						index={0}
						validator={validator}
						selectedVotes={[]}
						selectedUnvotes={[]}
						availableBalance={wallet.balance()}
						setAvailableBalance={vi.fn()}
						toggleUnvotesSelected={vi.fn()}
						toggleVotesSelected={vi.fn()}
						selectedWallet={wallet}
					/>
				</tbody>
			</table>,
		);

		expect(screen.getByTestId("ValidatorVoteAmount")).toBeInTheDocument();

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		votesAmountMinimumMock.mockRestore();
	});

	it("should render changed style when network requires vote amount", () => {
		const votesAmountMinimumMock = vi.spyOn(wallet.network(), "votesAmountMinimum").mockReturnValue(10);

		const selectedVotes: VoteValidatorProperties[] = [
			{
				amount: 20,
				validatorAddress: validator.address(),
			},
		];
		const voted: Contracts.VoteRegistryItem = {
			amount: 10,
			wallet: validator,
		};

		const { container, asFragment } = render(
			<table>
				<tbody>
					<ValidatorRow
						index={0}
						validator={validator}
						voted={voted}
						selectedVotes={selectedVotes}
						selectedUnvotes={[]}
						availableBalance={wallet.balance()}
						setAvailableBalance={vi.fn()}
						toggleUnvotesSelected={vi.fn()}
						toggleVotesSelected={vi.fn()}
						selectedWallet={wallet}
					/>
				</tbody>
			</table>,
		);

		expect(container).toBeInTheDocument();
		expect(firstValidatorVoteButton()).toHaveTextContent(commonTranslations.CHANGED);

		expect(asFragment()).toMatchSnapshot();

		votesAmountMinimumMock.mockRestore();
	});
});
