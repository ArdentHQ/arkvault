import { Contracts, ReadOnlyWallet } from "@/app/lib/profiles";
import { BigNumber } from "@/app/lib/helpers";
import { requestMock, server } from "@/tests/mocks/server";
import { TransactionDetailSidePanel } from "./TransactionDetailSidePanel";
import { translations } from "@/domains/transaction/i18n";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { act, env, getDefaultProfileId, render, screen, syncValidators, waitFor } from "@/utils/testing-library";
import userEvent from "@testing-library/user-event";

const fixtureProfileId = getDefaultProfileId();
let dashboardURL: string;

const blockHash = "bbe10cb07743e41a9ac3b6c7801a31ca00ce1c250d79b9ec3b885289e3c66a68";

describe("TransactionDetailModal", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(async () => {
		dashboardURL = `/profiles/${fixtureProfileId}/dashboard`;
		profile = env.profiles().findById(getDefaultProfileId());

		await syncValidators(profile);

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().first();

		server.use(
			requestMock(
				`https://dwallets-evm.mainsailhq.com/api/blocks/*`,
				{ data: {} }, // Basic mock for block data
			),
		);
	});

	it("should not render if not open", () => {
		render(
			<TransactionDetailSidePanel
				profile={profile}
				isOpen={false}
				transactionItem={{
					...TransactionFixture,
					blockHash: () => blockHash,
					type: () => "transfer",
					wallet: () => wallet,
				}}
			/>,
		);

		expect(screen.queryByTestId("SidePanel__content")).not.toBeInTheDocument();
	});

	it("should handle onClose gracefully", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });

		const onCloseMock = vi.fn();

		render(
			<TransactionDetailSidePanel
				profile={profile}
				isOpen={true}
				onClose={onCloseMock}
				transactionItem={{
					...TransactionFixture,
					blockHash: () => blockHash,
					type: () => "transfer",
					wallet: () => wallet,
				}}
			/>,
		);

		await expect(screen.findByTestId("SidePanel__content")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("SidePanel__close-button"));

		act(() => {
			vi.advanceTimersByTime(1000);
		});

		await waitFor(() => {
			expect(onCloseMock).toHaveBeenCalled();
		});
	});

	it("should render a transfer side panel", () => {
		render(
			<TransactionDetailSidePanel
				profile={profile}
				isOpen={true}
				transactionItem={{
					...TransactionFixture,
					blockHash: () => blockHash,
					isTransfer: () => true,
					memo: () => {},
					type: () => "transfer",
					wallet: () => wallet,
				}}
			/>,
			{
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("SidePanel__content")).toHaveTextContent(translations.MODAL_TRANSFER_DETAIL.TITLE);
	});

	it("should render a multi payment side panel", () => {
		render(
			<TransactionDetailSidePanel
				profile={profile}
				isOpen={true}
				transactionItem={{
					...TransactionFixture,
					blockHash: () => blockHash,
					isMultiPayment: () => true,
					isTransfer: () => false,
					recipients: () => [
						{ address: "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6", amount: 1 },
						{ address: "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6", amount: 1 },
					],
					type: () => "multiPayment",
					wallet: () => wallet,
				}}
			/>,
			{
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("SidePanel__content")).toHaveTextContent(
			translations.MODAL_TRANSACTION_DETAILS.TITLE,
		);
	});

	it.each(["vote", "unvote"])("should render a %s side panel", (transactionType) => {
		vi.spyOn(profile.validators(), "map").mockImplementation((wallet, votes) =>
			votes.map(
				(vote: string, index: number) =>
					// @ts-ignore
					new ReadOnlyWallet(
						{
							address: vote,
							username: `validator-${index}`,
						},
						profile,
					),
			),
		);

		render(
			<TransactionDetailSidePanel
				profile={profile}
				isOpen={true}
				transactionItem={{
					...TransactionFixture,
					blockHash: () => blockHash,
					data: () => ({
						data: {
							asset: {},
							blockHash: blockHash,
						},
					}),
					isConfirmed: () => true,
					isUnvote: () => transactionType === "unvote",
					isVote: () => transactionType === "vote",
					type: () => transactionType,
					unvotes: () => {
						if (transactionType !== "vote") {
							return TransactionFixture.unvotes();
						}
						return [];
					},
					votes: () => {
						if (transactionType !== "unvote") {
							return TransactionFixture.votes();
						}
						return [];
					},
					wallet: () => wallet,
				}}
			/>,
			{
				route: dashboardURL,
			},
		);

		const labels = {
			unvote: "Unvote",
			vote: "Vote",
		};

		expect(screen.getByTestId("SidePanel__content")).toHaveTextContent(labels[transactionType]);
	});

	it("should render a validator registration side panel", () => {
		render(
			<TransactionDetailSidePanel
				profile={profile}
				isOpen={true}
				transactionItem={{
					...TransactionFixture,
					blockHash: () => blockHash,
					type: () => "validatorRegistration",
					username: () => "ARK Wallet",
					wallet: () => wallet,
				}}
			/>,
			{
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("SidePanel__content")).toHaveTextContent("Registration");
	});

	it("should render a validator resignation side panel", () => {
		render(
			<TransactionDetailSidePanel
				profile={profile}
				isOpen={true}
				transactionItem={{
					...TransactionFixture,
					blockHash: () => blockHash,
					type: () => "validatorResignation",
					wallet: () => wallet,
				}}
			/>,
			{
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("SidePanel__content")).toHaveTextContent("Resignation");
	});

	it("should render contract deployment with deployed contract address", () => {
		const contractDeploymentFixture = {
			...TransactionFixture,
			blockHash: () => blockHash,
			confirmations: () => ({ toNumber: () => 10, valueOf: () => 10 }),
			data: () => ({
				data: {
					receipt: {
						deployedContractAddress: "0x123",
					},
				},
			}),
			isConfirmed: () => true,
			isContractDeployment: () => true,
			type: () => "contractDeployment",
			wallet: () => wallet,
		};

		render(
			<TransactionDetailSidePanel
				profile={profile}
				isOpen={true}
				transactionItem={contractDeploymentFixture as any}
			/>,
			{
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("SidePanel__content")).toBeInTheDocument();
	});

	it("should find wallet when transaction from/to matches wallet address", () => {
		const fromAddress = wallet.address();
		const toAddress = "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6";

		render(
			<TransactionDetailSidePanel
				profile={profile}
				isOpen={true}
				wallets={[wallet]}
				transactionItem={{
					...TransactionFixture,
					blockHash: () => blockHash,
					from: () => fromAddress,
					to: () => toAddress,
					type: () => "transfer",
					wallet: () => wallet,
				}}
			/>,
			{
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("SidePanel__content")).toBeInTheDocument();
	});

	it("should render token transfer with token address", () => {
		const tokenAddress = "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6";

		const mockTransactionToken = {
			to: () => tokenAddress,
			token: () => ({
				address: () => tokenAddress,
				displaySymbol: () => "TEST",
			}),
			value: () => BigNumber.make(100),
		};

		render(
			<TransactionDetailSidePanel
				profile={profile}
				isOpen={true}
				transactionItem={{
					...TransactionFixture,
					blockHash: () => blockHash,
					isTokenTransfer: () => true,
					to: () => tokenAddress,
					token: () => mockTransactionToken,
					type: () => "transfer",
					wallet: () => wallet,
				}}
			/>,
			{
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("SidePanel__content")).toBeInTheDocument();
	});

	it("should render with confirmations passed directly", () => {
		render(
			<TransactionDetailSidePanel
				profile={profile}
				isOpen={true}
				confirmations={15}
				transactionItem={{
					...TransactionFixture,
					blockHash: () => blockHash,
					confirmations: () => ({ toNumber: () => 10 }),
					isConfirmed: () => true,
					type: () => "transfer",
					wallet: () => wallet,
				}}
			/>,
			{
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("SidePanel__content")).toBeInTheDocument();
	});

	it("should render with isConfirmed passed directly", () => {
		render(
			<TransactionDetailSidePanel
				profile={profile}
				isOpen={true}
				isConfirmed={true}
				confirmations={20}
				transactionItem={{
					...TransactionFixture,
					blockHash: () => blockHash,
					confirmations: () => ({ toNumber: () => 10 }),
					isConfirmed: () => false,
					type: () => "transfer",
					wallet: () => wallet,
				}}
			/>,
			{
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("SidePanel__content")).toBeInTheDocument();
	});

	it("should render contract deployment with confirmations > 0", () => {
		const contractDeploymentFixture = {
			...TransactionFixture,
			blockHash: () => blockHash,
			confirmations: () => ({ toNumber: () => 10, valueOf: () => 10 }),
			data: () => ({
				data: {
					receipt: {
						deployedContractAddress: "0x123",
					},
				},
			}),
			isConfirmed: () => true,
			isContractDeployment: () => true,
			type: () => "contractDeployment",
			wallet: () => wallet,
		};

		render(
			<TransactionDetailSidePanel
				profile={profile}
				isOpen={true}
				transactionItem={contractDeploymentFixture as any}
			/>,
			{
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("SidePanel__content")).toBeInTheDocument();
	});
});
