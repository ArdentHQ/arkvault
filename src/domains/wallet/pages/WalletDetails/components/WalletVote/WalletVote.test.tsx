/* eslint-disable testing-library/no-node-access */
import { Contracts, ReadOnlyWallet } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { useTranslation } from "react-i18next";

import { WalletVote } from "./WalletVote";
import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";

let wallet: Contracts.IReadWriteWallet;
let profile: Contracts.IProfile;
let defaultDelegate: {
	address: string;
	publicKey?: string;
	explorerLink: string;
	isDelegate: boolean;
	isResignedDelegate: boolean;
	governanceIdentifier: string;
};

let votes: Contracts.VoteRegistryItem[];

describe("WalletVote", () => {
	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().findById("ac38fe6d-4b67-4ef1-85be-17c5f6841129");

		defaultDelegate = {
			address: wallet.address(),
			explorerLink: "",
			governanceIdentifier: "address",
			isDelegate: false,
			isResignedDelegate: false,
			publicKey: wallet.publicKey(),
		};

		votes = wallet.voting().current();
	});

	it("should render", async () => {
		const { asFragment } = render(
			<WalletVote wallet={wallet} onButtonClick={vi.fn()} votes={votes} isLoadingVotes={false} />,
		);

		await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render ledger for incompatible ledger wallet", async () => {
		process.env.REACT_APP_IS_UNIT = undefined;
		const ledgerMock = vi.spyOn(wallet, "isLedger").mockReturnValue(true);

		const { asFragment } = render(
			<WalletVote wallet={wallet} onButtonClick={vi.fn()} votes={votes} isLoadingVotes={false} />,
		);

		await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
		ledgerMock.mockRestore();
	});

	it("should render skelethon if loading", async () => {
		const { asFragment } = render(
			<WalletVote wallet={wallet} onButtonClick={vi.fn()} votes={votes} isLoadingVotes={true} />,
		);

		await expect(screen.findByTestId("WalletVote__skeleton")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render without votes", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const votes = [];

		const { asFragment } = render(
			<WalletVote wallet={wallet} onButtonClick={vi.fn()} votes={votes} isLoadingVotes={false} />,
		);

		await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

		expect(screen.getByText(t("COMMON.LEARN_MORE"))).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render disabled vote button", async () => {
		const balanceSpy = vi.spyOn(wallet, "balance").mockReturnValue(0);

		const { asFragment } = render(
			<WalletVote wallet={wallet} onButtonClick={vi.fn()} votes={votes} isLoadingVotes={false} />,
		);

		await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

		expect(screen.queryAllByRole("button")[0]).toBeDisabled();
		expect(asFragment()).toMatchSnapshot();

		balanceSpy.mockRestore();
	});

	it("should disable vote button when balance is less than votesAmountStep", async () => {
		const usesLockedBalance = vi.spyOn(wallet.network(), "usesLockedBalance").mockReturnValue(true);
		const votesAmountStepSpy = vi.spyOn(wallet.network(), "votesAmountStep").mockReturnValue(10);
		const balanceSpy = vi.spyOn(wallet, "balance").mockReturnValue(5);

		const { asFragment } = render(
			<WalletVote wallet={wallet} onButtonClick={vi.fn()} votes={votes} isLoadingVotes={false} />,
		);

		await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

		expect(screen.queryAllByRole("button")[0]).toBeDisabled();
		expect(asFragment()).toMatchSnapshot();

		usesLockedBalance.mockRestore();
		votesAmountStepSpy.mockRestore();
		balanceSpy.mockRestore();
	});

	it("shows the locked votes when uses locked balance", async () => {
		const votes = [
			{
				amount: 0,
				wallet: new ReadOnlyWallet({
					...defaultDelegate,
					rank: 1,
				}),
			},
			{
				amount: 0,
				wallet: new ReadOnlyWallet({
					...defaultDelegate,
					rank: 2,
				}),
			},
		];

		const usesLockedBalance = vi.spyOn(wallet.network(), "usesLockedBalance").mockReturnValue(true);

		render(<WalletVote wallet={wallet} onButtonClick={vi.fn()} votes={votes} isLoadingVotes={false} />);

		await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

		usesLockedBalance.mockRestore();
	});

	it("doesnt shows the locked votes when doenst used locked balance", async () => {
		const votes = [
			{
				amount: 0,
				wallet: new ReadOnlyWallet({
					...defaultDelegate,
					rank: 1,
				}),
			},
			{
				amount: 0,
				wallet: new ReadOnlyWallet({
					...defaultDelegate,
					rank: 2,
				}),
			},
		];

		const usesLockedBalance = vi.spyOn(wallet.network(), "usesLockedBalance").mockReturnValue(false);

		render(<WalletVote wallet={wallet} onButtonClick={vi.fn()} votes={votes} isLoadingVotes={false} />);

		await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

		expect(screen.queryByTestId("Votes--lockedvotes")).toBeNull();

		usesLockedBalance.mockRestore();
	});

	it("should render the maximum votes", async () => {
		const votes = [];
		const maxVotesSpy = vi.spyOn(wallet.network(), "maximumVotesPerWallet").mockReturnValue(101);

		const { asFragment } = render(
			<WalletVote wallet={wallet} onButtonClick={vi.fn()} votes={votes} isLoadingVotes={false} />,
		);

		await expect(screen.findByTestId("EmptyVotes")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		maxVotesSpy.mockRestore();
	});

	describe("single vote networks", () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		it("should render a vote for an active delegate", async () => {
			const delegate = {
				amount: 0,
				wallet: new ReadOnlyWallet({
					...defaultDelegate,
					rank: 10,
				}),
			};

			const { asFragment } = render(
				<WalletVote wallet={wallet} onButtonClick={vi.fn()} votes={[delegate]} isLoadingVotes={false} />,
			);

			await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

			expect(screen.getByText(`#${delegate.wallet.rank()}`)).toBeInTheDocument();

			expect(screen.getByText(t("WALLETS.PAGE_WALLET_DETAILS.VOTES.ACTIVE", { count: 1 }))).toBeInTheDocument();

			expect(asFragment()).toMatchSnapshot();
		});

		it("should render a vote for a standby delegate", async () => {
			const { result } = renderHook(() => useTranslation());
			const { t } = result.current;

			const delegate = {
				amount: 0,
				wallet: new ReadOnlyWallet({
					...defaultDelegate,
					rank: 52,
				}),
			};

			const { asFragment } = render(
				<WalletVote wallet={wallet} onButtonClick={vi.fn()} votes={[delegate]} isLoadingVotes={false} />,
			);

			await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

			expect(screen.getByText(`#${delegate.wallet.rank()}`)).toBeInTheDocument();

			expect(screen.getByText(t("WALLETS.PAGE_WALLET_DETAILS.VOTES.STANDBY", { count: 1 }))).toBeInTheDocument();

			expect(asFragment()).toMatchSnapshot();
		});

		it("should render a vote for a delegate without rank", async () => {
			const { result } = renderHook(() => useTranslation());
			const { t } = result.current;

			const delegate = {
				amount: 0,
				wallet: new ReadOnlyWallet({
					...defaultDelegate,
					isDelegate: true,
					isResignedDelegate: false,
				}),
			};

			const { asFragment } = render(
				<WalletVote wallet={wallet} onButtonClick={vi.fn()} votes={[delegate]} isLoadingVotes={false} />,
			);

			await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

			expect(screen.getByText(t("COMMON.NOT_AVAILABLE"))).toBeInTheDocument();

			expect(screen.getByText(t("WALLETS.PAGE_WALLET_DETAILS.VOTES.STANDBY", { count: 1 }))).toBeInTheDocument();

			expect(asFragment()).toMatchSnapshot();
		});
	});

	it("should emit action on button click", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		await wallet.synchroniser().votes();
		await wallet.synchroniser().identity();
		await wallet.synchroniser().coin();

		const votes = [];

		const onButtonClick = vi.fn();

		render(<WalletVote wallet={wallet} onButtonClick={onButtonClick} votes={votes} isLoadingVotes={false} />);

		await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

		await waitFor(() => expect(screen.queryAllByTestId("WalletVote")[0]).not.toBeDisabled());

		await userEvent.click(screen.queryAllByText(t("COMMON.VOTE"))[0]);

		expect(onButtonClick).toHaveBeenCalledWith();
	});

	it("should render as all resigned", async () => {
		const votes = [
			{
				amount: 0,
				wallet: new ReadOnlyWallet({
					...defaultDelegate,
					isDelegate: true,
					isResignedDelegate: true,
				}),
			},
			{
				amount: 0,
				wallet: new ReadOnlyWallet({
					...defaultDelegate,
					isDelegate: true,
					isResignedDelegate: true,
				}),
			},
		];

		const { asFragment } = render(
			<WalletVote wallet={wallet} onButtonClick={vi.fn()} votes={votes} isLoadingVotes={false} />,
		);

		await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});
});
