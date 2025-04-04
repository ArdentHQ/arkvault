import { Contracts, ReadOnlyWallet } from "@ardenthq/sdk-profiles";
import React from "react";
import { VoteValidatorProperties } from "@/domains/vote/components/ValidatorsTable/ValidatorsTable.contracts";
import { data } from "@/tests/fixtures/coins/ark/devnet/delegates.json";
import { env, getMainsailProfileId, render, screen } from "@/utils/testing-library";
import { ValidatorRowMobile } from "./ValidatorRowMobile";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";

let wallet: Contracts.IReadWriteWallet;
let validator: Contracts.IReadOnlyWallet;

const firstValidatorVoteButton = () => screen.getByTestId("DelegateRow__toggle-0");

describe("ValidatorRowMobile", () => {
	beforeAll(() => {
		const profile = env.profiles().findById(getMainsailProfileId());
		wallet = profile.wallets().values()[0];
		validator = new ReadOnlyWallet({
			address: data[0].address,
			explorerLink: "",
			governanceIdentifier: "address",
			isDelegate: true,
			isResignedDelegate: false,
			publicKey: data[0].publicKey,
			username: data[0].username,
		});
	});

	it("should render", () => {
		render(
			<table>
				<tbody>
					<ValidatorRowMobile
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
		expect(screen.getAllByTestId("DelegateRowMobile")[0]).toBeInTheDocument();
	});

	it("should render mobile skeleton while loading", () => {
		render(
			<table>
				<tbody>
					<ValidatorRowMobile
						index={0}
						validator={validator}
						selectedVotes={[]}
						selectedUnvotes={[]}
						isLoading={true}
						availableBalance={wallet.balance()}
						setAvailableBalance={vi.fn()}
						toggleUnvotesSelected={vi.fn()}
						toggleVotesSelected={vi.fn()}
						selectedWallet={wallet}
					/>
				</tbody>
			</table>,
		);
		expect(screen.getAllByTestId("ValidatorRowMobileSkeleton")[0]).toBeInTheDocument();
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
		render(
			<table>
				<tbody>
					<ValidatorRowMobile
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
		expect(firstValidatorVoteButton()).toHaveTextContent(commonTranslations.UNSELECTED);
	});

	it("should render the selected vote", () => {
		const secondDelegate = new ReadOnlyWallet({
			address: data[1].address,
			explorerLink: "",
			governanceIdentifier: "address",
			isDelegate: true,
			isResignedDelegate: false,
			publicKey: data[1].publicKey,
			username: data[1].username,
		});

		const thirdDelegate = new ReadOnlyWallet({
			address: data[2].address,
			explorerLink: "",
			governanceIdentifier: "address",
			isDelegate: true,
			isResignedDelegate: false,
			publicKey: data[2].publicKey,
			username: data[2].username,
		});

		const { container, asFragment } = render(
			<table>
				<tbody>
					<ValidatorRowMobile
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
					<ValidatorRowMobile
						index={1}
						validator={secondDelegate}
						selectedVotes={[]}
						selectedUnvotes={[]}
						availableBalance={wallet.balance()}
						setAvailableBalance={vi.fn()}
						toggleUnvotesSelected={vi.fn()}
						toggleVotesSelected={vi.fn()}
						selectedWallet={wallet}
					/>
					<ValidatorRowMobile
						index={2}
						validator={thirdDelegate}
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
		expect(screen.getByTestId("DelegateRow__toggle-1")).toHaveTextContent(commonTranslations.SELECT);
		expect(screen.getByTestId("DelegateRow__toggle-2")).toBeDisabled();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render the selected validator", () => {
		const selectedVotes: VoteValidatorProperties[] = [
			{
				amount: 0,
				validatorAddress: validator.address(),
			},
		];
		render(
			<table>
				<tbody>
					<ValidatorRowMobile
						index={0}
						validator={validator}
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
		expect(firstValidatorVoteButton()).toHaveTextContent(commonTranslations.SELECTED);
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
		render(
			<table>
				<tbody>
					<ValidatorRowMobile
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
		expect(firstValidatorVoteButton()).toHaveTextContent(commonTranslations.CHANGED);
		votesAmountMinimumMock.mockRestore();
	});
});
