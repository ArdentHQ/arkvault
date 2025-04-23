import { Contracts, DTO } from "@/app/lib/profiles";
import { env, getDefaultProfileId, renderResponsive } from "@/utils/testing-library";

import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";
import React from "react";
import { UnconfirmedTransactionTable } from "./UnconfirmedTransactionTable";

let transactions: DTO.ExtendedConfirmedTransactionData[];
let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

describe("Unconfirmed transaction table", () => {
	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();

		//@ts-ignore
		transactions = [
			{
				convertedTotal: () => BigNumber.ZERO,
				isConfirmed: () => false,
				isMultiPayment: () => false,
				isSent: () => true,
				isTransfer: () => true,
				isUnvote: () => false,
				isVote: () => false,
				recipient: () => "D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
				recipients: () => ["D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb", wallet.address()],
				timestamp: () => DateTime.make(),
				total: () => BigNumber.make(1),
				type: () => "transfer",
				wallet: () => wallet,
			},
			{
				convertedTotal: () => BigNumber.ZERO,
				isConfirmed: () => false,
				isMultiPayment: () => true,
				isSent: () => true,
				isTransfer: () => false,
				isUnvote: () => false,
				isVote: () => false,
				recipient: () => "D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
				recipients: () => ["D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb", wallet.address()],
				timestamp: () => DateTime.make(),
				total: () => BigNumber.make(1),
				type: () => "multiPayment",
				wallet: () => wallet,
			},
		];
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should not render in %s", (breakpoint) => {
		const { asFragment } = renderResponsive(
			<UnconfirmedTransactionTable transactions={transactions} profile={profile} />,
			breakpoint,
		);

		expect(asFragment()).toMatchSnapshot();
	});
});
