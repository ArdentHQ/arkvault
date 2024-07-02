/* eslint-disable testing-library/no-node-access */
import { Contracts, ReadOnlyWallet } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react-hooks";
import userEvent from "@testing-library/user-event";
import React from "react";
import { useTranslation } from "react-i18next";

import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";

import { WalletVote } from "./WalletVote";

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

const multivote = "WALLETS.PAGE_WALLET_DETAILS.VOTES.MULTIVOTE";

const expectHintIcon = () => expect(document.querySelector("svg#hint-small")).toBeInTheDocument();

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

		expect(screen.getByRole("button")).toBeDisabled();
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

		expect(screen.getByRole("button")).toBeDisabled();
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
					username: "arkx",
				}),
			},
			{
				amount: 0,
				wallet: new ReadOnlyWallet({
					...defaultDelegate,
					rank: 2,
					username: "arky",
				}),
			},
		];

		const usesLockedBalance = vi.spyOn(wallet.network(), "usesLockedBalance").mockReturnValue(true);

		render(<WalletVote wallet={wallet} onButtonClick={vi.fn()} votes={votes} isLoadingVotes={false} />);

		await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

		expect(screen.getByTestId("Votes--lockedvotes")).toBeVisible();

		usesLockedBalance.mockRestore();
	});

	it("doesnt shows the locked votes when doenst used locked balance", async () => {
		const votes = [
			{
				amount: 0,
				wallet: new ReadOnlyWallet({
					...defaultDelegate,
					rank: 1,
					username: "arkx",
				}),
			},
			{
				amount: 0,
				wallet: new ReadOnlyWallet({
					...defaultDelegate,
					rank: 2,
					username: "arky",
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

		await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();
		await expect(screen.findByText("0/101")).resolves.toBeVisible();

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
					username: "arkx",
				}),
			};

			const { asFragment } = render(
				<WalletVote wallet={wallet} onButtonClick={vi.fn()} votes={[delegate]} isLoadingVotes={false} />,
			);

			await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

			expect(screen.getByText(delegate.wallet.username()!)).toBeInTheDocument();
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
					username: "arkx",
				}),
			};

			const { asFragment } = render(
				<WalletVote wallet={wallet} onButtonClick={vi.fn()} votes={[delegate]} isLoadingVotes={false} />,
			);

			await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

			expect(screen.getByText(delegate.wallet.username()!)).toBeInTheDocument();
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
					username: "arkx",
				}),
			};

			const { asFragment } = render(
				<WalletVote wallet={wallet} onButtonClick={vi.fn()} votes={[delegate]} isLoadingVotes={false} />,
			);

			await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

			expect(screen.getByText(delegate.wallet.username()!)).toBeInTheDocument();
			expect(screen.getByText(t("COMMON.NOT_AVAILABLE"))).toBeInTheDocument();

			expect(screen.getByText(t("WALLETS.PAGE_WALLET_DETAILS.VOTES.STANDBY", { count: 1 }))).toBeInTheDocument();

			expectHintIcon();

			expect(asFragment()).toMatchSnapshot();
		});
	});

	describe("multi vote networks", () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		let maxVotesSpy: vi.SpyInstance;

		beforeEach(() => {
			process.env.REACT_APP_IS_UNIT = "1";
			maxVotesSpy = vi.spyOn(wallet.network(), "maximumVotesPerWallet").mockReturnValue(101);
		});

		afterEach(() => maxVotesSpy.mockRestore());

		it("should render votes when all delegates are active", async () => {
			const votes = [
				{
					amount: 0,
					wallet: new ReadOnlyWallet({
						...defaultDelegate,
						rank: 1,
						username: "arkx",
					}),
				},
				{
					amount: 0,
					wallet: new ReadOnlyWallet({
						...defaultDelegate,
						rank: 2,
						username: "arky",
					}),
				},
			];

			const { asFragment } = render(
				<WalletVote wallet={wallet} onButtonClick={vi.fn()} votes={votes} isLoadingVotes={false} />,
			);

			await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

			expect(screen.getByText(t(multivote))).toBeInTheDocument();
			expect(
				screen.getByText(t("WALLETS.PAGE_WALLET_DETAILS.VOTES.ACTIVE", { count: votes.length })),
			).toBeInTheDocument();

			expect(asFragment()).toMatchSnapshot();
		});

		it("should render votes when all delegates are on standby", async () => {
			const { result } = renderHook(() => useTranslation());
			const { t } = result.current;

			const votes = [
				{
					amount: 0,
					wallet: new ReadOnlyWallet({
						...defaultDelegate,
						username: "arkx",
					}),
				},
				{
					amount: 0,
					wallet: new ReadOnlyWallet({
						...defaultDelegate,
						username: "arky",
					}),
				},
			];

			const { asFragment } = render(
				<WalletVote wallet={wallet} onButtonClick={vi.fn()} votes={votes} isLoadingVotes={false} />,
			);

			await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

			expect(screen.getByText(t(multivote))).toBeInTheDocument();
			expect(
				screen.getByText(t("WALLETS.PAGE_WALLET_DETAILS.VOTES.STANDBY", { count: votes.length })),
			).toBeInTheDocument();

			expect(asFragment()).toMatchSnapshot();
		});

		it("should render a vote for multiple active and standby delegates", async () => {
			const { result } = renderHook(() => useTranslation());
			const { t } = result.current;

			const votes = [
				{
					amount: 0,
					wallet: new ReadOnlyWallet({
						...defaultDelegate,
						rank: 1,
						username: "arkx",
					}),
				},
				{
					amount: 0,
					wallet: new ReadOnlyWallet({
						...defaultDelegate,
						username: "arky",
					}),
				},
			];

			const { asFragment } = render(
				<WalletVote wallet={wallet} onButtonClick={vi.fn()} votes={votes} isLoadingVotes={false} />,
			);

			await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

			expect(screen.getByText(t(multivote))).toBeInTheDocument();
			expect(
				screen.getByText(t("WALLETS.PAGE_WALLET_DETAILS.VOTES.ACTIVE_COUNT", { count: 1 })),
			).toBeInTheDocument();
			expect(
				screen.getByText(`/ ${t("WALLETS.PAGE_WALLET_DETAILS.VOTES.STANDBY_COUNT", { count: 1 })}`),
			).toBeInTheDocument();

			expectHintIcon();

			expect(asFragment()).toMatchSnapshot();
		});

		it("should render a vote for multiple active and resigned delegates", async () => {
			const { result } = renderHook(() => useTranslation());
			const { t } = result.current;

			const votes = [
				{
					amount: 0,
					wallet: new ReadOnlyWallet({
						...defaultDelegate,
						isDelegate: true,
						rank: 1,
						username: "arkx",
					}),
				},
				{
					amount: 0,
					wallet: new ReadOnlyWallet({
						...defaultDelegate,
						isDelegate: true,
						isResignedDelegate: true,
						username: "arky",
					}),
				},
			];

			const { asFragment } = render(
				<WalletVote wallet={wallet} onButtonClick={vi.fn()} votes={votes} isLoadingVotes={false} />,
			);

			await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

			expect(screen.getByText(t(multivote))).toBeInTheDocument();

			expect(screen.getByTestId("WalletVote")).toHaveTextContent("Active 1");
			expect(screen.getByTestId("WalletVote")).toHaveTextContent("Resigned 1");

			expectHintIcon();

			expect(asFragment()).toMatchSnapshot();
		});

		it("should render a vote for multiple standby and resigned delegates", async () => {
			const { result } = renderHook(() => useTranslation());
			const { t } = result.current;

			const votes = [
				{
					amount: 0,
					wallet: new ReadOnlyWallet({
						...defaultDelegate,
						isDelegate: true,
						username: "arkx",
					}),
				},
				{
					amount: 0,
					wallet: new ReadOnlyWallet({
						...defaultDelegate,
						isDelegate: true,
						isResignedDelegate: true,
						username: "arky",
					}),
				},
			];

			const { asFragment } = render(
				<WalletVote wallet={wallet} onButtonClick={vi.fn()} votes={votes} isLoadingVotes={false} />,
			);

			await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

			expect(screen.getByText(t(multivote))).toBeInTheDocument();

			expect(screen.getByTestId("WalletVote")).toHaveTextContent("Standby 1");
			expect(screen.getByTestId("WalletVote")).toHaveTextContent("Resigned 1");

			expectHintIcon();

			expect(asFragment()).toMatchSnapshot();
		});

		it("should render a vote for multiple active, standby and resigned delegates", async () => {
			const { result } = renderHook(() => useTranslation());
			const { t } = result.current;

			const votes = [
				{
					amount: 0,
					wallet: new ReadOnlyWallet({
						...defaultDelegate,
						isDelegate: true,
						rank: 1,
						username: "arkx",
					}),
				},
				{
					amount: 0,
					wallet: new ReadOnlyWallet({
						...defaultDelegate,
						isDelegate: true,
						username: "arky",
					}),
				},
				{
					amount: 0,
					wallet: new ReadOnlyWallet({
						...defaultDelegate,
						isDelegate: true,
						isResignedDelegate: true,
						username: "arkz",
					}),
				},
			];

			const { asFragment } = render(
				<WalletVote wallet={wallet} onButtonClick={vi.fn()} votes={votes} isLoadingVotes={false} />,
			);

			await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

			expect(screen.getByText(t(multivote))).toBeInTheDocument();

			expect(screen.getByTestId("WalletVote")).toHaveTextContent("Active 1");
			expect(screen.getByTestId("WalletVote")).toHaveTextContent("Standby 1");
			expect(screen.getByTestId("WalletVote")).toHaveTextContent("Resigned 1");

			expectHintIcon();

			expect(asFragment()).toMatchSnapshot();
		});
	});

	it("should emit action on multivote click", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const votes = [
			{
				amount: 0,
				wallet: new ReadOnlyWallet({
					...defaultDelegate,
					rank: 1,
					username: "arkx",
				}),
			},
			{
				amount: 0,
				wallet: new ReadOnlyWallet({
					...defaultDelegate,
					rank: 2,
					username: "arky",
				}),
			},
		];

		const onButtonClick = vi.fn();

		render(<WalletVote wallet={wallet} onButtonClick={onButtonClick} votes={votes} isLoadingVotes={false} />);

		await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

		await userEvent.click(screen.getByText(t(multivote)));

		expect(onButtonClick).toHaveBeenCalledWith("current");
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

		await waitFor(() => expect(screen.getByTestId("WalletVote")).not.toBeDisabled());

		await userEvent.click(screen.getByText(t("COMMON.VOTE")));

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
					username: "arky",
				}),
			},
			{
				amount: 0,
				wallet: new ReadOnlyWallet({
					...defaultDelegate,
					isDelegate: true,
					isResignedDelegate: true,
					username: "arky",
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
