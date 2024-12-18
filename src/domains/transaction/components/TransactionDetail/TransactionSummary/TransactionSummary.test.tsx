import React from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { RecipientProperties } from "./SearchRecipient.contracts";
import { env, getDefaultProfileId, screen, renderResponsive } from "@/utils/testing-library";
import { translations } from "@/app/i18n/common/i18n";
import { TransactionAddresses } from "@/domains/transaction/components/TransactionDetail";

describe("TransactionAddresses", () => {
	let profile: Contracts.IProfile;
	let recipients: RecipientProperties[];

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		const wallets: Contracts.IReadWriteWallet[] = profile.wallets().values();

		recipients = wallets.map((wallet) => ({
			address: wallet.address(),
			alias: wallet.alias(),
			avatar: wallet.avatar(),
			id: wallet.id(),
			network: wallet.networkId(),
			type: "wallet",
		}));
	});

	it.each(["sm", "md", "lg"])("should render in %s", (breakpoint: string) => {
		const wallet = profile.wallets().first();

		renderResponsive(
			<TransactionAddresses
				senderAddress={wallet.address()}
				network={wallet.network()}
				recipients={[recipients[1]]}
				profile={profile}
			/>,
			breakpoint,
		);

		expect(screen.getByTestId("DetailWrapper")).toBeInTheDocument();
		expect(screen.getByText(translations.FROM)).toBeInTheDocument();
		expect(screen.getByText(translations.TO)).toBeInTheDocument();
		expect(screen.getByText(recipients[1].address)).toBeInTheDocument();
	});
});
