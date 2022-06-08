/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@payvo/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import nock from "nock";
import React from "react";
import { Route } from "react-router-dom";

import { Transactions } from "./Transactions";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import {
	env,
	getDefaultProfileId,
	MNEMONICS,
	render,
	renderResponsiveWithRoute,
	screen,
	syncDelegates,
	useDefaultNetMocks,
	waitFor,
	within,
} from "@/utils/testing-library";

const history = createHashHistory();
let profile: Contracts.IProfile;

const fixtureProfileId = getDefaultProfileId();
let dashboardURL: string;

const API_BASE_URL = "https://ark-test.arkvault.io";

describe("Transactions", () => {
	beforeAll(async () => {
		useDefaultNetMocks();

		const { meta, data } = require("tests/fixtures/coins/ark/devnet/transactions.json");

		nock("https://neoscan.io/api/main_net/v1/")
			.get("/get_last_transactions_by_address/AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX/1")
			.reply(200, []);

		const emptyResponse = {
			data: [],
			meta: {},
		};

		const singleItemsResponse = {
			data: data.slice(0, 1),
			meta,
		};

		const twoItemsResponse = {
			data: data.slice(0, 2),
			meta,
		};

		nock(API_BASE_URL)
			.get((uri) => uri.includes("DCX2kvwgL2mrd9GjyYAbfXLGGXWwgN3Px7") && !uri.includes("typeGroup=2"))
			.reply(200, () => singleItemsResponse)
			.get((uri) => uri.includes("DCX2kvwgL2mrd9GjyYAbfXLGGXWwgN3Px7") && uri.includes("typeGroup=2"))
			.reply(200, () => emptyResponse)
			.persist();

		nock(API_BASE_URL)
			.get((uri) => uri.includes("DDHk393YcsxTPN1H5SWTcbjfnCRmF1iBR8") && !uri.includes("type=3"))
			.reply(200, () => singleItemsResponse)
			.get((uri) => uri.includes("DDHk393YcsxTPN1H5SWTcbjfnCRmF1iBR8") && uri.includes("type=3"))
			.reply(200, () => emptyResponse)
			.persist();

		nock(API_BASE_URL)
			.get("/api/transactions?limit=30&address=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD&typeGroup=2")
			.reply(200, () => emptyResponse)
			.get("/api/transactions?limit=30&address=D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb&typeGroup=2")
			.reply(200, () => emptyResponse)
			.get("/api/transactions?limit=30&address=DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr&typeGroup=2")
			.reply(200, () => emptyResponse)
			.persist();

		nock(API_BASE_URL)
			.get("/api/transactions?page=2&limit=30&address=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD")
			.reply(200, () => emptyResponse)
			.get("/api/transactions?page=2&limit=30&address=D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb")
			.reply(200, () => emptyResponse)
			.get("/api/transactions?page=2&limit=30&address=DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr")
			.reply(200, () => emptyResponse)
			.persist();

		nock(API_BASE_URL)
			.get("/api/transactions")
			.query(true)
			.reply(200, () => twoItemsResponse)
			.persist();

		profile = env.profiles().findById(fixtureProfileId);

		await env.profiles().restore(profile);
		await profile.sync();

		await syncDelegates(profile);
	});

	beforeEach(async () => {
		dashboardURL = `/profiles/${fixtureProfileId}/dashboard`;
		history.push(dashboardURL);
	});

	it("should render", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions profile={profile} wallets={profile.wallets().values()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(
			() => expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(4),
			{ timeout: 4000 },
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with custom title", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions profile={profile} wallets={profile.wallets().values()} title={<span>Test</span>} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(
			() => expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(4),
			{ timeout: 4000 },
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render hidden", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions profile={profile} wallets={profile.wallets().values()} isVisible={false} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should filter by type", async () => {
		render(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions profile={profile} wallets={profile.wallets().values()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(
			() => expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(4),
			{ timeout: 4000 },
		);

		const button = screen.getAllByRole("button", { name: /Type/ })[0];

		expect(button).toBeInTheDocument();

		expect(button).not.toBeDisabled();

		userEvent.click(button);

		await expect(screen.findByTestId("dropdown__option--core-0")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("dropdown__option--core-0"));

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(4),
		);
	});

	it("should filter by type on mobile", async () => {
		renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions profile={profile} wallets={profile.wallets().values()} />
			</Route>,
			"xs",
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(
			() => expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(4),
			{ timeout: 4000 },
		);

		const button = within(screen.getByTestId("FilterTransactions--Mobile")).getByTestId("CollapseToggleButton");

		expect(button).toBeInTheDocument();

		expect(button).not.toBeDisabled();

		userEvent.click(button);

		await expect(screen.findByTestId("dropdown__option--core-0")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("dropdown__option--core-0"));

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(4),
		);
	});

	it("should filter by type and see empty results text", async () => {
		const emptyProfile = await env.profiles().create("test2");

		const wallet = await emptyProfile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: MNEMONICS[2],
			network: "ark.devnet",
		});

		emptyProfile.wallets().push(wallet);

		render(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions profile={emptyProfile} wallets={emptyProfile.wallets().values()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(
			() => expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(1),
			{ timeout: 4000 },
		);

		const button = screen.getAllByRole("button", { name: /Type/ })[0];

		expect(button).toBeInTheDocument();

		expect(button).not.toBeDisabled();

		userEvent.click(button);

		await expect(screen.findByTestId("dropdown__option--core-7")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("dropdown__option--core-7"));

		await expect(screen.findByTestId("EmptyBlock")).resolves.toBeVisible();
	});

	it("should filter by type and see empty screen", async () => {
		const emptyProfile = await env.profiles().create("empty screen profile");

		emptyProfile.wallets().push(
			await emptyProfile.walletFactory().fromMnemonicWithBIP39({
				coin: "ARK",
				mnemonic: MNEMONICS[0],
				network: "ark.devnet",
			}),
		);

		render(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions profile={emptyProfile} wallets={emptyProfile.wallets().values()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(
			() => expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(2),
			{ timeout: 4000 },
		);

		const button = screen.getAllByRole("button", { name: /Type/ })[0];

		expect(button).toBeInTheDocument();

		expect(button).not.toBeDisabled();

		userEvent.click(button);

		await expect(screen.findByTestId("dropdown__option--magistrate-0")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("dropdown__option--magistrate-0"));

		await expect(screen.findByTestId("EmptyBlock")).resolves.toBeVisible();
	});

	it("should open detail modal on transaction row click", async () => {
		await env.profiles().restore(profile);
		await profile.sync();

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions profile={profile} wallets={profile.wallets().values()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(
			() => expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(4),
			{ timeout: 4000 },
		);

		userEvent.click(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")[0]);

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		});

		userEvent.click(screen.getByTestId("Modal__close-button"));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should fetch more transactions", async () => {
		process.env.REACT_APP_IS_UNIT = "1";

		await env.profiles().restore(profile);
		await profile.sync();

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions profile={profile} isLoading={false} wallets={profile.wallets().values()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		const fetchMoreButtonHasContent = (content) =>
			expect(screen.getByTestId("transactions__fetch-more-button")).toHaveTextContent(content);

		await waitFor(() => fetchMoreButtonHasContent(commonTranslations.VIEW_MORE));

		expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(4);

		userEvent.click(screen.getByTestId("transactions__fetch-more-button"));

		fetchMoreButtonHasContent(commonTranslations.LOADING);

		await waitFor(() => fetchMoreButtonHasContent(commonTranslations.VIEW_MORE));

		expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(8);

		process.env.REACT_APP_IS_UNIT = undefined;

		expect(asFragment()).toMatchSnapshot();
	});

	it("should hide view more button when there are no next pages", async () => {
		await env.profiles().restore(profile);
		await profile.sync();

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions profile={profile} isLoading={false} wallets={profile.wallets().values()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() => {
			expect(screen.queryByTestId("transactions__fetch-more-button")).not.toBeInTheDocument();
		});

		await waitFor(() => {
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(4);
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should show loading state if set", async () => {
		await env.profiles().restore(profile);
		await profile.sync();

		render(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions isLoading={true} profile={profile} wallets={profile.wallets().values()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() => {
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(8);
		});
	});

	it("should abort previous request", async () => {
		nock.cleanAll();
		const { meta, data } = require("tests/fixtures/coins/ark/devnet/transactions.json");

		nock(API_BASE_URL)
			.get("/api/transactions")
			.query(true)
			.reply(200, () => ({
				data: data.slice(0, 4),
				meta,
			}))
			.get("/api/transactions")
			.query((parameters) => !!parameters.senderId)
			.delayBody(500)
			.reply(200, () => ({
				data: data.slice(0, 1),
				meta,
			}))
			.get("/api/transactions")
			.query((parameters) => !!parameters.recipientId)
			.reply(200, () => ({
				data: data.slice(0, 3),
				meta,
			}));

		render(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions profile={profile} isLoading={false} wallets={profile.wallets().values()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() => expect(screen.getAllByTestId("TableRow")).toHaveLength(4), { timeout: 500 });

		userEvent.click(screen.getByTestId("tabs__tab-button-received"));
		userEvent.click(screen.getByTestId("tabs__tab-button-sent"));

		await waitFor(() => expect(screen.getAllByTestId("TableRow")).toHaveLength(1), { timeout: 1000 });
	});

	it("should filter by mode", async () => {
		render(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions profile={profile} wallets={profile.wallets().values()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(4),
		);

		userEvent.click(screen.getByTestId("tabs__tab-button-sent"));

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(1),
		);
	});

	it("should filter by mode on mobile", async () => {
		renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions profile={profile} wallets={profile.wallets().values()} />
			</Route>,
			"xs",
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow__mobile")).toHaveLength(4),
		);

		const dropdownContainer = within(screen.getByTestId("Transactions--filter-dropdown"));

		const button = dropdownContainer.getByTestId("dropdown__toggle");

		expect(button).toBeInTheDocument();

		expect(button).not.toBeDisabled();

		userEvent.click(button);

		await expect(dropdownContainer.findByTestId("dropdown__option--2")).resolves.toBeVisible();

		userEvent.click(dropdownContainer.getByTestId("dropdown__option--2"));

		await waitFor(
			() =>
				expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow__mobile")).toHaveLength(
					1,
				),
			{ timeout: 4000 },
		);
	});

	it("should ignore tab change on loading state", async () => {
		render(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions profile={profile} wallets={profile.wallets().values()} isLoading={true} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(8),
		);

		userEvent.click(screen.getByTestId("tabs__tab-button-sent"));

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(8),
		);
	});

	it("should show empty message", async () => {
		const emptyProfile = await env.profiles().create("test-empty");
		const emptyProfileURL = `/profiles/${emptyProfile.id()}/dashboard`;

		history.push(emptyProfileURL);
		render(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions profile={emptyProfile} wallets={[]} />
			</Route>,
			{
				history,
				route: emptyProfileURL,
			},
		);

		await expect(screen.findByTestId("EmptyBlock")).resolves.toBeVisible();
	});

	it("should update wallet filters", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions isUpdatingWallet={true} profile={profile} wallets={[]} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await expect(screen.findByTestId("EmptyBlock")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});
});
