import { env, getMainsailProfileId, render, screen } from "@/utils/testing-library";
import { requestMock, server } from "@/tests/mocks/server";

import { Contracts } from "@/app/lib/profiles";
import React from "react";
import userEvent from "@testing-library/user-event";
import { expect, vi } from "vitest";
import { AddTokenSidePanel } from "./AddTokenSidePanel";
import { toasts } from "@/app/services";
import { delay, http, HttpResponse } from "msw";

let profile: Contracts.IProfile;

const renderPanel = async () => {
	const mockOnOpenChange = vi.fn();

	const view = render(<AddTokenSidePanel open={true} onOpenChange={mockOnOpenChange} />, {
		route: `/profiles/${profile.id()}/dashboard`,
		withProviders: true,
	});

	await expect(screen.findByTestId("AddTokenSidePanel")).resolves.toBeVisible();

	return { ...view, mockOnOpenChange };
};

const validAddress = "0x12f6677522292654a231007c47b07971a7610904";
const continueButton = () => screen.getByTestId("AddToken__save-button");
const addressInput = () => screen.getByTestId("Input__ContractAddress");

const samCoinData = {
	data: {
		address: "0x12f6677522292654a231007c47b07971a7610908",
		decimals: 18,
		deploymentHash: "7a9052d9d5fd73f106cbf6728f0661054de13a03a2c199c51c1a11f547890d0c",
		name: "SamCoin",
		symbol: "SAM",
		totalSupply: "12345678912345000000000000000000",
	},
};

describe("AddTokenSidePanel", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId())!;

		await env.profiles().restore(profile);
		await profile.sync();
	});

	beforeEach(() => {
		server.use(requestMock(`https://dwallets-evm.mainsailhq.com/api/tokens/${validAddress}`, samCoinData));
	});

	it("should display error when an invalid contract address entered", async () => {
		await renderPanel();

		const user = userEvent.setup();

		await user.clear(addressInput());
		await user.paste("hello");

		expect(screen.getByTestId("Input__error")).toBeVisible();
		expect(continueButton()).toBeDisabled();
	});

	it("should display error when a non-existent contract address entered", async () => {
		await renderPanel();

		const invalidAddress = "0x22f6677522292654a231007c47b07971a7610904";

		server.use(
			requestMock(
				`https://dwallets-evm.mainsailhq.com/api/tokens/${invalidAddress}`,
				{ error: "Not Found", message: "Token not found", statusCode: 404 },
				{
					status: 404,
				},
			),
		);

		const user = userEvent.setup();

		await user.clear(addressInput());
		await user.paste(invalidAddress);

		await expect(screen.findByText(/The provided address is not a valid ERC20 token./)).resolves.toBeVisible();
		expect(continueButton()).toBeDisabled();
	});

	it("should display error when contract address lookup fails", async () => {
		await renderPanel();

		const invalidAddress = "0x22f6677522292654a231007c47b07971a7610904";

		server.use(
			requestMock(
				`https://dwallets-evm.mainsailhq.com/api/tokens/${invalidAddress}`,
				{},
				{
					status: 500,
				},
			),
		);

		const user = userEvent.setup();

		await user.clear(addressInput());
		await user.paste(invalidAddress);

		await expect(screen.findByText(/The provided address is not a valid ERC20 token./)).resolves.toBeVisible();
		expect(continueButton()).toBeDisabled();
	});

	it("should hide error message when address input changes", async () => {
		await renderPanel();

		const invalidAddress = "0x22f6677522292654a231007c47b07971a7610904";

		server.use(
			http.get(`https://dwallets-evm.mainsailhq.com/api/tokens/${invalidAddress}`, () => HttpResponse.error()),
		);

		const user = userEvent.setup();

		await user.clear(addressInput());
		await user.paste(invalidAddress);

		await expect(screen.findByText(/The provided address is not a valid ERC20 token./)).resolves.toBeVisible();

		await user.clear(addressInput());
		await user.paste("hello");

		expect(screen.queryByText(/The provided address is not a valid ERC20 token./)).not.toBeInTheDocument();
	});

	it("should display token details when a valid contract address entered", async () => {
		await renderPanel();

		const user = userEvent.setup();

		await user.clear(addressInput());
		await user.paste(validAddress);

		await expect(screen.findByText(/SAM/)).resolves.toBeVisible();
		await expect(screen.findByText(/SamCoin/)).resolves.toBeVisible();

		expect(continueButton()).toBeEnabled();
	});

	it("should add a custom token", async () => {
		const { mockOnOpenChange } = await renderPanel();

		const user = userEvent.setup();

		await user.clear(addressInput());
		await user.paste(validAddress);

		await expect(screen.findByText(/SamCoin/)).resolves.toBeVisible();

		expect(continueButton()).toBeEnabled();

		const whitelistContractAddressSpy = vi.spyOn(profile, "whitelistContractAddress");
		const successToastSpy = vi.spyOn(toasts, "success").mockImplementation(vi.fn());

		await user.click(continueButton());

		expect(whitelistContractAddressSpy).toHaveBeenCalledWith(validAddress);
		expect(successToastSpy).toHaveBeenCalled();
		expect(mockOnOpenChange).toHaveBeenCalledWith(false);
	});

	it("should display loading indicator while loading token", async () => {
		await renderPanel();

		server.use(
			http.get(`https://dwallets-evm.mainsailhq.com/api/tokens/${validAddress}`, async () => {
				await delay(1000);

				return HttpResponse.json(samCoinData);
			}),
		);

		const user = userEvent.setup();

		await user.clear(addressInput());
		await user.paste(validAddress);

		await expect(screen.findByText(/We’re fetching the token details./)).resolves.toBeVisible();
	});
});
