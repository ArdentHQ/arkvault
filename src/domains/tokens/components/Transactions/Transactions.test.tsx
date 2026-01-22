import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { Transactions } from "./Transactions";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import {
	env,
	getDefaultProfileId,
	render,
	screen,
	syncValidators,
	waitFor,
	within,
} from "@/utils/testing-library";
import { server, requestMock, } from "@/tests/mocks/server";
import Fixtures from "@/tests/fixtures/coins/mainsail/devnet/tokens.json";

let profile: Contracts.IProfile;

const fixtureProfileId = getDefaultProfileId();
let tokensPageURL: string;

describe("Transactions", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(fixtureProfileId);

		await env.profiles().restore(profile);
		await profile.sync();

		await syncValidators(profile);
	});

	beforeEach(async () => {
		tokensPageURL = `/profiles/${fixtureProfileId}/tokens`;
	});

	it("should render", async () => {
		render(<Transactions profile={profile} wallets={profile.wallets().values()} />, {
			route: tokensPageURL,
		});

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(5),
		);
	});

	it("should render hidden", async () => {
		const { asFragment } = render(
			<Transactions profile={profile} wallets={profile.wallets().values()} isVisible={false} />,
			{
				route: tokensPageURL,
			},
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should open detail side panel on transaction row click", async () => {
		await env.profiles().restore(profile);
		await profile.sync();

		const { asFragment } = render(<Transactions profile={profile} wallets={profile.wallets().values()} />, {
			route: tokensPageURL,
		});

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(5),
		);

		await userEvent.click(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")[0]);

		await waitFor(() => {
			expect(screen.getByTestId("SidePanel__content")).toBeInTheDocument();
		});

		await userEvent.click(screen.getByTestId("SidePanel__close-button"));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should maximize and update side panel on transaction row click", async () => {
		await env.profiles().restore(profile);
		await profile.sync();

		render(<Transactions profile={profile} wallets={profile.wallets().values()} />, {
			route: tokensPageURL,
			withProviders: true,
		});

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(5),
		);

		await userEvent.click(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")[0]);

		await waitFor(() => {
			expect(screen.getByTestId("SidePanel__content")).toBeInTheDocument();
		});

		expect(
			within(screen.getByTestId("TransactionId")).getByText(/bf060a019f9f5a036f571e2/),
		).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("SidePanel__minimize-button"));

		await waitFor(() => {
			expect(screen.getByTestId("MinimizedSidePanel")).toBeInTheDocument();
		});

		await userEvent.click(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")[1]);

		await waitFor(() => {
			expect(screen.getByTestId("MaximizedSidePanel")).toBeInTheDocument();
		});
	});

	it("should fetch more transactions", async () => {
		process.env.REACT_APP_IS_UNIT = "1";

		await env.profiles().restore(profile);
		await profile.sync();

		// Paginated result
		server.use(
			requestMock("https://dwallets-evm.mainsailhq.com/api/tokens/transfers", {
				data: [...Fixtures.TokenTransfers.data, ...Fixtures.TokenTransfers.data,].slice(
					0,
					10,
				),
				meta: {
					...Fixtures.TokenTransfers.meta,
					count: 15,
					next: "/tokens/transfer?limit=10&page=2",
					totalCount: 15,
				},
			}),
		);

		const { asFragment } = render(
			<Transactions profile={profile} isLoading={false} wallets={profile.wallets().values()} />,
			{
				route: tokensPageURL,
			},
		);

		await expect(screen.findByTestId("transactions__fetch-more-button")).resolves.toBeVisible();

		const fetchMoreButtonHasContent = (content) =>
			expect(screen.getByTestId("transactions__fetch-more-button")).toHaveTextContent(content);

		await waitFor(() => fetchMoreButtonHasContent(commonTranslations.LOAD_MORE));

		expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(10);

		await userEvent.click(screen.getByTestId("transactions__fetch-more-button"));

		await waitFor(() => fetchMoreButtonHasContent(commonTranslations.LOAD_MORE));

		expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(20);

		process.env.REACT_APP_IS_UNIT = undefined;

		expect(asFragment()).toMatchSnapshot();
	});

	it("should hide view more button when there are no next pages", async () => {
		await env.profiles().restore(profile);
		await profile.sync();

		server.use(
			requestMock("https://dwallets-evm.mainsailhq.com/api/tokens/transfers", {
				data: [...Fixtures.TokenTransfers.data, ...Fixtures.TokenTransfers.data,].slice(
					0,
					10,
				),
				meta: {
					...Fixtures.TokenTransfers.meta,
					count: 10,
					next: undefined,
					totalCount: 10,
				},
			}),
		);

		const { asFragment } = render(
			<Transactions profile={profile} isLoading={false} wallets={profile.wallets().values()} />,
			{
				route: tokensPageURL,
			},
		);

		await waitFor(() => {
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(8);
		});

		await waitFor(() => {
			expect(screen.queryByTestId("transactions__fetch-more-button")).not.toBeInTheDocument();
		});
		expect(asFragment()).toMatchSnapshot();
	});

	it("should show loading state if set", async () => {
		await env.profiles().restore(profile);
		await profile.sync();

		render(<Transactions isLoading profile={profile} wallets={profile.wallets().values()} />, {
			route: tokensPageURL,
		});

		await waitFor(() => {
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(8);
		});
	});

	it("should show empty message", async () => {
		const emptyProfile = await env.profiles().create("test-empty");
		const emptyProfileURL = `/profiles/${emptyProfile.id()}/dashboard`;

		render(<Transactions profile={emptyProfile} wallets={[]} />, {
			route: emptyProfileURL,
		});

		await expect(screen.findByTestId("Transactions__no-filters-selected")).resolves.toBeVisible();
	});
});
