import { Contracts, ReadOnlyWallet } from "@/app/lib/profiles";
import { renderHook } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { useTranslation } from "react-i18next";

import { WalletVote } from "./WalletVote";
import {
	env,
	getDefaultMainsailWalletId,
	getMainsailProfileId,
	render,
	screen,
	waitFor,
} from "@/utils/testing-library";
import { ValidatorName, ValidatorStatus } from "./WalletVote.blocks";
import { renderResponsive } from "@/utils/testing-library";

let wallet: Contracts.IReadWriteWallet;
let profile: Contracts.IProfile;
let defaultValidator: {
	address: string;
	publicKey?: string;
	explorerLink: string;
	isValidator: boolean;
	isResignedValidator: boolean;
	governanceIdentifier: string;
};

let votes: Contracts.VoteRegistryItem[];

describe("WalletVote", () => {
	beforeEach(() => {
		profile = env.profiles().findById(getMainsailProfileId());
		wallet = profile.wallets().findById(getDefaultMainsailWalletId());

		defaultValidator = {
			address: wallet.address(),
			explorerLink: "",
			governanceIdentifier: "address",
			isResignedValidator: false,
			isValidator: false,
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

	it("should render tooltip when wallet does not have sufficient funds", async () => {
		const balanceMock = vi.spyOn(wallet, "balance").mockReturnValue(0);

		render(
			<WalletVote wallet={wallet} wallets={[wallet]} onButtonClick={vi.fn()} votes={votes} isLoadingVotes={false} />,
		);

		await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

		await userEvent.hover(screen.getByTestId("WalletVote__button"));

		expect(screen.getByText(/Voting disabled due to insufficient balance./)).toBeInTheDocument();

		balanceMock.mockRestore();
	});

	it("should render skeleton if loading", async () => {
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
			<WalletVote
				wallet={wallet}
				wallets={[wallet]}
				onButtonClick={vi.fn()}
				votes={votes}
				isLoadingVotes={false}
			/>,
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
			<WalletVote
				wallet={wallet}
				wallets={[wallet]}
				onButtonClick={vi.fn()}
				votes={votes}
				isLoadingVotes={false}
			/>,
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
					...defaultValidator,
					rank: 1,
				}),
			},
			{
				amount: 0,
				wallet: new ReadOnlyWallet({
					...defaultValidator,
					rank: 2,
				}),
			},
		];

		const usesLockedBalance = vi.spyOn(wallet.network(), "usesLockedBalance").mockReturnValue(true);

		render(
			<WalletVote
				wallets={[wallet]}
				wallet={wallet}
				onButtonClick={vi.fn()}
				votes={votes}
				isLoadingVotes={false}
			/>,
		);

		await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

		usesLockedBalance.mockRestore();
	});
	//
	it("doesnt shows the locked votes when doenst used locked balance", async () => {
		const votes = [
			{
				amount: 0,
				wallet: new ReadOnlyWallet({
					...defaultValidator,
					rank: 1,
				}),
			},
			{
				amount: 0,
				wallet: new ReadOnlyWallet({
					...defaultValidator,
					rank: 2,
				}),
			},
		];

		const usesLockedBalance = vi.spyOn(wallet.network(), "usesLockedBalance").mockReturnValue(false);

		render(
			<WalletVote
				wallets={[wallet]}
				wallet={wallet}
				onButtonClick={vi.fn()}
				votes={votes}
				isLoadingVotes={false}
			/>,
		);

		await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

		expect(screen.queryByTestId("Votes--lockedvotes")).toBeNull();

		usesLockedBalance.mockRestore();
	});
	//
	it("should render the maximum votes", async () => {
		const votes = [];
		const maxVotesSpy = vi.spyOn(wallet.network(), "maximumVotesPerWallet").mockReturnValue(101);

		const { asFragment } = render(
			<WalletVote
				wallet={wallet}
				wallets={[wallet]}
				onButtonClick={vi.fn()}
				votes={votes}
				isLoadingVotes={false}
			/>,
		);

		await expect(screen.findByTestId("EmptyVotes")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		maxVotesSpy.mockRestore();
	});

	describe("single vote networks", () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		it("should render a vote for an active validator", async () => {
			const validator = {
				amount: 0,
				wallet: new ReadOnlyWallet({
					...defaultValidator,
					rank: 10,
				}),
			};

			const { asFragment } = render(
				<WalletVote
					wallets={[wallet]}
					wallet={wallet}
					onButtonClick={vi.fn()}
					votes={[validator]}
					isLoadingVotes={false}
				/>,
			);

			await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

			expect(screen.getByText(`#${validator.wallet.rank()}`)).toBeInTheDocument();

			expect(screen.getByText(t("WALLETS.PAGE_WALLET_DETAILS.VOTES.ACTIVE", { count: 1 }))).toBeInTheDocument();

			expect(asFragment()).toMatchSnapshot();
		});

		it("should render a vote for a standby validator", async () => {
			const { result } = renderHook(() => useTranslation());
			const { t } = result.current;

			const validator = {
				amount: 0,
				wallet: new ReadOnlyWallet({
					...defaultValidator,
					rank: 54,
				}),
			};

			const { asFragment } = render(
				<WalletVote wallet={wallet} onButtonClick={vi.fn()} votes={[validator]} isLoadingVotes={false} />,
			);

			await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

			expect(screen.getByText(`#${validator.wallet.rank()}`)).toBeInTheDocument();

			expect(screen.getByText(t("WALLETS.PAGE_WALLET_DETAILS.VOTES.STANDBY", { count: 1 }))).toBeInTheDocument();

			expect(asFragment()).toMatchSnapshot();
		});

		it("should render a vote for a validator without rank", async () => {
			const { result } = renderHook(() => useTranslation());
			const { t } = result.current;

			const validator = {
				amount: 0,
				wallet: new ReadOnlyWallet({
					...defaultValidator,
					isResignedValidator: false,
					isValidator: true,
				}),
			};

			const { asFragment } = render(
				<WalletVote
					wallet={wallet}
					wallets={[wallet]}
					onButtonClick={vi.fn()}
					votes={[validator]}
					isLoadingVotes={false}
				/>,
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

		const votes = [];

		const onButtonClick = vi.fn();

		render(
			<WalletVote
				wallets={[wallet]}
				wallet={wallet}
				onButtonClick={onButtonClick}
				votes={votes}
				isLoadingVotes={false}
			/>,
		);

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
					...defaultValidator,
					isResignedValidator: true,
					isValidator: true,
				}),
			},
			{
				amount: 0,
				wallet: new ReadOnlyWallet({
					...defaultValidator,
					isResignedValidator: true,
					isValidator: true,
				}),
			},
		];

		const { asFragment } = render(
			<WalletVote
				wallets={[wallet]}
				wallet={wallet}
				onButtonClick={vi.fn()}
				votes={votes}
				isLoadingVotes={false}
			/>,
		);

		await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should handle click on vote button in mobile view", async () => {
		const onButtonClick = vi.fn();

		renderResponsive(
			<WalletVote
				wallets={[wallet]}
				wallet={wallet}
				onButtonClick={onButtonClick}
				votes={[]}
				isLoadingVotes={false}
			/>,
			{
				viewport: { height: 667, width: 375 },
			},
		);

		await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

		await userEvent.click(screen.queryAllByTestId("WalletVote__button_mobile")[0]);

		expect(onButtonClick).toHaveBeenCalledWith();
	});
});

describe("ValidatorName", () => {
	it("should render an address", () => {
		render(<ValidatorName validatorName={wallet.address()} isUsername={false} />);

		expect(screen.getByText(wallet.address())).toBeInTheDocument();
	});

	it("should render a username", () => {
		render(<ValidatorName validatorName={"TestingUsername"} isUsername={true} />);
		expect(screen.getByText("TestingUsername")).toBeInTheDocument();
	});
});

describe("ValidatorStatus", () => {
	it("should render stand by", () => {
		render(<ValidatorStatus votes={votes} activeValidators={10} />);
		expect(screen.getByText("Standby")).toBeInTheDocument();
	});

	it("should render resigned", () => {
		const votes = [
			{
				amount: 0,
				wallet: new ReadOnlyWallet({
					...defaultValidator,
					isResignedValidator: true,
					isValidator: true,
				}),
			},
		];

		render(<ValidatorStatus votes={votes} activeValidators={10} />);
		expect(screen.getByText("Resigned")).toBeInTheDocument();
	});

	it("should render active", () => {
		const votes = [
			{
				amount: 1,
				wallet: new ReadOnlyWallet({
					...defaultValidator,
					isResignedValidator: false,
					isValidator: true,
					rank: 1,
				}),
			},
		];

		render(<ValidatorStatus votes={votes} activeValidators={10} />);
		expect(screen.getByText("Active")).toBeInTheDocument();
	});

	it("should render the three validators", () => {
		const votes = [
			{
				amount: 1,
				wallet: new ReadOnlyWallet({
					...defaultValidator,
					isResignedValidator: false,
					isValidator: true,
					rank: 1,
				}),
			},
			{
				amount: 1,
				wallet: new ReadOnlyWallet({
					...defaultValidator,
					isResignedValidator: false,
					isValidator: true,
					rank: 52,
				}),
			},
			{
				amount: 1,
				wallet: new ReadOnlyWallet({
					...defaultValidator,
					isResignedValidator: true,
					isValidator: true,
				}),
			},
		];

		render(<ValidatorStatus votes={votes} activeValidators={10} />);

		expect(screen.getByText("Active 1")).toBeInTheDocument();
		expect(screen.getByText("/ Standby 1")).toBeInTheDocument();
		expect(screen.getByText("& Resigned 1")).toBeInTheDocument();
	});

	it("should render with '&' separator when there are active and standby validators", () => {
		const votes = [
			{
				amount: 1,
				wallet: new ReadOnlyWallet({
					...defaultValidator,
					isResignedValidator: false,
					isValidator: true,
					rank: 1,
				}),
			},
			{
				amount: 1,
				wallet: new ReadOnlyWallet({
					...defaultValidator,
					isResignedValidator: false,
					isValidator: true,
					rank: 52,
				}),
			},
			{
				amount: 1,
				wallet: new ReadOnlyWallet({
					...defaultValidator,
					isResignedValidator: true,
					isValidator: true,
				}),
			},
		];

		render(<ValidatorStatus votes={votes} activeValidators={10} />);

		expect(screen.getByText("& Resigned 1")).toBeInTheDocument();
	});

	it("should render with '/' separator when there are only active and resigned validators", () => {
		const votes = [
			{
				amount: 1,
				wallet: new ReadOnlyWallet({
					...defaultValidator,
					isResignedValidator: false,
					isValidator: true,
					rank: 1,
				}),
			},
			{
				amount: 1,
				wallet: new ReadOnlyWallet({
					...defaultValidator,
					isResignedValidator: true,
					isValidator: true,
				}),
			},
		];

		render(<ValidatorStatus votes={votes} activeValidators={10} />);

		expect(screen.getByText("/ Resigned 1")).toBeInTheDocument();
	});
});
