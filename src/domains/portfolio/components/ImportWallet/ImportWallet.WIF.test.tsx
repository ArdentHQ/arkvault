import userEvent from "@testing-library/user-event";
import React from "react";
import { Route } from "react-router-dom";

import {
	env,
	render,
	screen,
	waitFor,
	mockProfileWithPublicAndTestNetworks,
	getMainsailProfileId,
} from "@/utils/testing-library";
import * as usePortfolio from "@/domains/portfolio/hooks/use-portfolio";
import { Contracts } from "@/app/lib/profiles";
import { ImportAddressesSidePanel } from "./ImportAddressSidePanel";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";

let profile: Contracts.IProfile;
const fixtureProfileId = getMainsailProfileId();

const randomAddress = "0x659A76be283644AEc2003aa8ba26485047fd1BFB";

const detailStep = () => screen.getByTestId("ImportWallet__detail-step");
const continueButton = () => screen.getByTestId("ImportWallet__continue-button");
const successStep = () => screen.getByTestId("ImportWallet__success-step");
const methodStep = () => screen.getByTestId("ImportWallet__method-step");
const wifInput = () => screen.getByTestId("ImportWallet__wif-input");

const testNetwork = "mainsail.devnet";
let network;
const route = `/profiles/${fixtureProfileId}/dashboard`;

describe("ImportWallet WIF", () => {
	let resetProfileNetworksMock: () => void;
	const wif = "wif.1111";
	let newWallet: Contracts.IReadWriteWallet | undefined;

	beforeEach(async () => {
		vi.spyOn(usePortfolio, "usePortfolio").mockReturnValue({
			selectedAddresses: [],
			setSelectedAddresses: () => {},
		});

		profile = env.profiles().findById(fixtureProfileId);
		network = profile.activeNetwork();
		newWallet = await profile.walletFactory().fromSecret({ secret: "123" });

		network.importMethods = () => ({
			wif: {
				canBeEncrypted: true,
				default: true,
				permissions: ["read", "write"],
			},
		});

		await env.profiles().restore(profile);

		const walletId = profile.wallets().findByAddressWithNetwork(randomAddress, testNetwork)?.id();

		if (walletId) {
			profile.wallets().forget(walletId);
		}

		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	it("should import with valid wif", async () => {
		const activeNetworkMock = vi.spyOn(network, "importMethods").mockImplementation(() => ({
			wif: {
				canBeEncrypted: true,
				default: true,
				permissions: ["read", "write"],
			},
		}));

		const fromWIFMock = vi.spyOn(profile.walletFactory(), "fromWIF").mockResolvedValue(newWallet);

		render(
			<Route path="/profiles/:profileId/dashboard">
				<ImportAddressesSidePanel open={true} onOpenChange={vi.fn()} />
			</Route>,
			{
				route: route,
			},
		);

		expect(profile.wallets().count()).toBe(2);

		expect(methodStep()).toBeInTheDocument();

		await expect(screen.findByText(commonTranslations.WIF)).resolves.toBeVisible();

		await userEvent.click(screen.getByText(commonTranslations.WIF));

		expect(detailStep()).toBeInTheDocument();

		await userEvent.clear(wifInput());
		await userEvent.type(wifInput(), wif);

		await waitFor(() => {
			expect(wifInput()).toHaveValue(wif);
		});

		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.click(continueButton());

		await waitFor(() => {
			expect(successStep()).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(profile.wallets().count()).toBe(3);
		});

		activeNetworkMock.mockRestore();
		fromWIFMock.mockRestore();
	});

	it("should import with invalid wif", async () => {
		render(
			<Route path="/profiles/:profileId/dashboard">
				<ImportAddressesSidePanel open={true} onOpenChange={vi.fn()} />
			</Route>,
			{
				route: route,
			},
		);

		expect(methodStep()).toBeInTheDocument();

		await expect(screen.findByText(commonTranslations.WIF)).resolves.toBeVisible();

		await userEvent.click(screen.getByText(commonTranslations.WIF));

		expect(detailStep()).toBeInTheDocument();

		await waitFor(() => expect(wifInput()));

		await userEvent.clear(wifInput());
		await userEvent.type(wifInput(), wif);

		await waitFor(() => {
			expect(wifInput()).toHaveValue(wif);
		});
	});
});
