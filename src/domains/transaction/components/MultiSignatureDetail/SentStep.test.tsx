import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { Route } from "react-router-dom";

import { SentStep } from "./SentStep";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";

describe("Multisignature Detail Sent Step", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();

		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("should render sent step %s", async () => {
		vi.spyOn(wallet.transaction(), "isAwaitingConfirmation").mockReturnValue(true);
		vi.spyOn(wallet.coin().address(), "fromMultiSignature").mockResolvedValue({ address: wallet.address() });

		const { container } = render(
			<Route path="/profiles/:profileId">
				<SentStep
					isBroadcast
					wallet={wallet}
					transaction={{
						...TransactionFixture,
						get: () => ({ min: 2, publicKeys: [] }),
						min: () => 2,
						publicKeys: () => [wallet.publicKey()!, profile.wallets().last().publicKey()!],
						wallet: () => wallet,
						isMultiSignatureRegistration: () => true
					}}
				/>
				,
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await expect(screen.findByTestId("MusigGeneratedAddress")).resolves.toBeVisible();

		expect(container).toMatchSnapshot();
	});
});
