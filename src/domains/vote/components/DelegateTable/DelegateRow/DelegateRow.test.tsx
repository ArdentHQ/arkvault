import { Contracts, ReadOnlyWallet } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { DelegateRow } from "./DelegateRow";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import { VoteDelegateProperties } from "@/domains/vote/components/DelegateTable/DelegateTable.contracts";
import { data } from "@/tests/fixtures/coins/ark/devnet/delegates.json";
import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";

let wallet: Contracts.IReadWriteWallet;
let delegate: Contracts.IReadOnlyWallet;

const firstDelegateVoteButton = () => screen.getByTestId("DelegateRow__toggle-0");

describe("DelegateRow", () => {
	beforeAll(() => {
		const profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().values()[0];

		delegate = new ReadOnlyWallet({
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
		const { container, asFragment } = render(
			<table>
				<tbody>
					<DelegateRow
						index={0}
						delegate={delegate}
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
					<DelegateRow
						index={0}
						delegate={delegate}
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

		await userEvent.click(firstDelegateVoteButton());

		expect(container).toBeInTheDocument();
		expect(toggleVotesSelected).toHaveBeenCalledWith(delegate.address());
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render the selected delegate", () => {
		const selected = [
			{
				amount: 0,
				delegateAddress: delegate.address(),
			},
		];

		const { container, asFragment } = render(
			<table>
				<tbody>
					<DelegateRow
						index={0}
						delegate={delegate}
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
		expect(firstDelegateVoteButton()).toHaveTextContent(commonTranslations.SELECTED);
		expect(asFragment()).toMatchSnapshot();
	});

	it.each([true, false])("should render the selected vote", (isCompact: boolean) => {
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
					<DelegateRow
						index={0}
						delegate={delegate}
						voted={{
							amount: 10,
							wallet: delegate,
						}}
						selectedVotes={[]}
						selectedUnvotes={[]}
						availableBalance={wallet.balance()}
						setAvailableBalance={vi.fn()}
						toggleUnvotesSelected={vi.fn()}
						toggleVotesSelected={vi.fn()}
						selectedWallet={wallet}
						isCompact={isCompact}
					/>
					<DelegateRow
						index={1}
						delegate={secondDelegate}
						selectedVotes={[]}
						selectedUnvotes={[]}
						availableBalance={wallet.balance()}
						setAvailableBalance={vi.fn()}
						toggleUnvotesSelected={vi.fn()}
						toggleVotesSelected={vi.fn()}
						selectedWallet={wallet}
						isCompact={isCompact}
					/>
					<DelegateRow
						index={2}
						delegate={thirdDelegate}
						selectedVotes={[]}
						selectedUnvotes={[]}
						isVoteDisabled={true}
						availableBalance={wallet.balance()}
						setAvailableBalance={vi.fn()}
						toggleUnvotesSelected={vi.fn()}
						toggleVotesSelected={vi.fn()}
						selectedWallet={wallet}
						isCompact={isCompact}
					/>
				</tbody>
			</table>,
		);

		expect(container).toBeInTheDocument();
		expect(firstDelegateVoteButton()).toHaveTextContent(commonTranslations.CURRENT);
		expect(screen.getByTestId("DelegateRow__toggle-1")).toHaveTextContent(commonTranslations.SELECT);
		expect(screen.getByTestId("DelegateRow__toggle-2")).toBeDisabled();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render the unselected vote", () => {
		const selectedUnvotes: VoteDelegateProperties[] = [
			{
				amount: 0,
				delegateAddress: delegate.address(),
			},
		];
		const voted: Contracts.VoteRegistryItem = {
			amount: 10,
			wallet: delegate,
		};

		const { container, asFragment } = render(
			<table>
				<tbody>
					<DelegateRow
						index={0}
						delegate={delegate}
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
		expect(firstDelegateVoteButton()).toHaveTextContent(commonTranslations.UNSELECTED);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render when network requires vote amount", () => {
		const votesAmountMinimumMock = vi.spyOn(wallet.network(), "votesAmountMinimum").mockReturnValue(10);

		const { container, asFragment } = render(
			<table>
				<tbody>
					<DelegateRow
						index={0}
						delegate={delegate}
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

		expect(screen.getByTestId("DelegateVoteAmount")).toBeInTheDocument();

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		votesAmountMinimumMock.mockRestore();
	});

	it("should render changed style when network requires vote amount", () => {
		const votesAmountMinimumMock = vi.spyOn(wallet.network(), "votesAmountMinimum").mockReturnValue(10);

		const selectedVotes: VoteDelegateProperties[] = [
			{
				amount: 20,
				delegateAddress: delegate.address(),
			},
		];
		const voted: Contracts.VoteRegistryItem = {
			amount: 10,
			wallet: delegate,
		};

		const { container, asFragment } = render(
			<table>
				<tbody>
					<DelegateRow
						index={0}
						delegate={delegate}
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
		expect(firstDelegateVoteButton()).toHaveTextContent(commonTranslations.CHANGED);

		expect(asFragment()).toMatchSnapshot();

		votesAmountMinimumMock.mockRestore();
	});
});
