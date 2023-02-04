import React from "react";

import { DTO } from "@ardenthq/sdk-profiles";
import { MigrationPolygonAddress } from "./MigrationPolygonAddress";
import { renderResponsive, env, getDefaultProfileId } from "@/utils/testing-library";
import { migrationWalletAddress } from "@/utils/polygon-migration";

let transactionFixture: DTO.ExtendedSignedTransactionData;

describe("MigrationPolygonAddress", () => {
	beforeAll(async () => {
		const profile = env.profiles().findById(getDefaultProfileId());
		const wallet = profile.wallets().first();

		transactionFixture = new DTO.ExtendedSignedTransactionData(
			await wallet
				.coin()
				.transaction()
				.transfer({
					data: {
						amount: 1,
						to: migrationWalletAddress(),
					},
					fee: 1,
					nonce: "1",
					signatory: await wallet
						.coin()
						.signatory()
						.multiSignature({
							min: 2,
							publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()!],
						}),
				}),
			wallet,
		);
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", async (breakpoint) => {
		const { container } = renderResponsive(
			<MigrationPolygonAddress transaction={transactionFixture} />,
			breakpoint,
		);

		expect(container).toMatchSnapshot();
	});
});
