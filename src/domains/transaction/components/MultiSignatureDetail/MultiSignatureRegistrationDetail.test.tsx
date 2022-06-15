import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { Route } from "react-router-dom";

import { MultiSignatureRegistrationDetail } from "./MultiSignatureRegistrationDetail";
import { translations } from "@/domains/transaction/i18n";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { env, getDefaultProfileId, renderResponsiveWithRoute, screen, waitFor } from "@/utils/testing-library";

describe("MultiSignatureRegistrationDetail", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();

		await env.profiles().restore(profile);
		await profile.sync();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", (breakpoint) => {
		const { container } = renderResponsiveWithRoute(
			<Route path="/profiles/:profileId">
				<MultiSignatureRegistrationDetail
					transaction={{
						...TransactionFixture,
						min: () => 2,
						publicKeys: () => [wallet.publicKey()!, profile.wallets().last().publicKey()!],
						wallet: () => wallet,
					}}
					isOpen
				/>
			</Route>,
			breakpoint,
		);

		expect(container).toMatchSnapshot();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])(
		"should render sender's address as generated address when musig address derivation is not supported in %s",
		async (breakpoint) => {
			jest.spyOn(wallet.network(), "allows").mockReturnValue(false);

			const { container } = renderResponsiveWithRoute(
				<Route path="/profiles/:profileId">
					<MultiSignatureRegistrationDetail
						transaction={{
							...TransactionFixture,
							min: () => 2,
							publicKeys: () => [wallet.publicKey()!, profile.wallets().last().publicKey()!],
							wallet: () => wallet,
						}}
						isOpen
					/>
				</Route>,
				breakpoint,
				{
					route: `/profiles/${profile.id()}`,
				},
			);

			await expect(
				screen.findByText(translations.MODAL_MULTISIGNATURE_DETAIL.STEP_1.TITLE),
			).resolves.toBeVisible();

			await waitFor(() => expect(screen.getAllByText(wallet.address())).toHaveLength(3));

			expect(container).toMatchSnapshot();

			jest.restoreAllMocks();
		},
	);
});
