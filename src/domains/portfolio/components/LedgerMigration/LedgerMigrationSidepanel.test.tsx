import React, { useEffect } from "react";
import {
	env,
	render,
	screen,
	waitFor,
	getMainsailProfileId,
	mockNanoSTransport,
} from "@/utils/testing-library";
import { expect, it, describe, beforeEach, vi } from "vitest";
import { Contracts } from "@/app/lib/profiles";
import { LedgerMigrationSidepanel } from "./LedgerMigrationSidepanel";
import { useLedgerContext } from "@/app/contexts";
import { minVersionList } from "@/app/contexts";
import userEvent from "@testing-library/user-event";

describe("LedgerMigrationSidepanel", () => {
	let profile: Contracts.IProfile;
	const route = `/profiles/${getMainsailProfileId()}/dashboard`;
	let publicKeyPaths: Map<string, string>;

	beforeEach(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

		await env.profiles().restore(profile);

		publicKeyPaths = new Map([
			["m/44'/1'/1'/0/0", profile.wallets().first().publicKey()!],
			["m/44'/1'/1'/0/1", profile.wallets().last().publicKey()!],
		]);
	});


	it("should render", async () => {
		mockNanoSTransport()
		const wallet = profile.wallets().first()
		console.log({ version: minVersionList[wallet.network().coin()] })


		const isEthBasedAppSpy = vi.spyOn(wallet.ledger(), "isEthBasedApp").mockResolvedValue(true);
		const versionSpy = vi.spyOn(wallet.ledger(), "getVersion").mockResolvedValue(minVersionList[wallet.network().coin()]);

		const publicKeySpy = vi
			.spyOn(wallet.ledger(), "getPublicKey")
			.mockResolvedValue(publicKeyPaths.values().next().value!);

		render(<LedgerMigrationSidepanel open onOpenChange={vi.fn()} />, { route });

		expect(screen.getByTestId("LedgerMigrationSidepanel")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByTestId("LedgerAuthStep")).toBeInTheDocument();
		})

		await waitFor(() => {
			expect(screen.getByTestId("LedgerConnectionStep")).toBeInTheDocument();
		})

		await waitFor(() => {
			expect(screen.getByTestId("LedgerScanStep")).toBeInTheDocument();
		})

		await waitFor(() => {
			expect(screen.getByTestId("LedgerScanStep__continue-button")).toBeInTheDocument();
		})

		await userEvent.click(screen.getByTestId("LedgerScanStep__continue-button"))

		publicKeySpy.mockRestore()
		versionSpy.mockRestore()
		isEthBasedAppSpy.mockRestore()
	});
});
