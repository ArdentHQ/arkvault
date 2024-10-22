import React from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import {env, getDefaultProfileId, screen, renderResponsive, render} from "@/utils/testing-library";
import { TransactionAddresses } from "./TransactionAddresses";
import { translations } from "@/app/i18n/common/i18n";
import {RecipientProperties} from "../../SearchRecipient/SearchRecipient.contracts";
import {expect} from "vitest";
import userEvent from "@testing-library/user-event";

describe("TransactionAddresses", () => {
	let profile: Contracts.IProfile;
	let recipients: RecipientProperties[];
	let wallet: Contracts.IReadWriteWallet;

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		const wallets: Contracts.IReadWriteWallet[] = profile.wallets().values();

		wallet = wallets[0];

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

	it("should default to empty array if recipients is undefined", () => {
		render(<TransactionAddresses senderAddress={wallet.address()} network={wallet.network()} profile={profile} />);

		expect(screen.getByTestId("DetailWrapper")).toBeInTheDocument();
		expect(screen.queryByTestId(recipients[0].address)).not.toBeInTheDocument();
	});

	it("should render `View recipients list` if there are more than 1 recipient", () => {
		render(<TransactionAddresses
			senderAddress={wallet.address()}
			network={wallet.network()}
			profile={profile}
			recipients={recipients}
		/>);

		expect(screen.getByTestId("TransactionRecipientsModal--ShowList")).toBeInTheDocument();
		expect(screen.getByTestId("TransactionRecipientsModal--RecipientsCount")).toHaveTextContent(recipients.length)
	});

	it("should show recipients modal", async () => {
		render(<TransactionAddresses
			senderAddress={wallet.address()}
			network={wallet.network()}
			profile={profile}
			recipients={recipients}
		/>);

		await userEvent.click(screen.getByTestId("TransactionRecipientsModal--ShowList"));
		expect(screen.getByTestId("RecipientsModal")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("Modal__close-button"));
		expect(screen.queryByTestId("RecipientsModal")).not.toBeInTheDocument();
	});
});
