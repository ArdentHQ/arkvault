import React from "react";
import { Contracts } from "@/app/lib/profiles";
import { env, getDefaultProfileId, screen, renderResponsive, render } from "@/utils/testing-library";
import { TransactionAddresses } from "./TransactionAddresses";
import { ContractLabel, TransactionRecipient } from "./TransactionRecipient";
import { translations } from "@/app/i18n/common/i18n";
import { expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { RecipientItem } from "@/domains/transaction/components/RecipientsModal/RecipientsModal.contracts";

describe("TransactionAddresses", () => {
	let profile: Contracts.IProfile;
	let recipients: RecipientItem[];
	let wallet: Contracts.IReadWriteWallet;

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		const wallets: Contracts.IReadWriteWallet[] = profile.wallets().values();

		wallet = wallets[0];

		recipients = wallets.map((wallet) => ({
			address: wallet.address(),
			alias: wallet.alias(),
			amount: 100,
			isValidator: false,
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

	it("should render `View recipients list` if is multi payment", () => {
		render(
			<TransactionAddresses
				senderAddress={wallet.address()}
				network={wallet.network()}
				profile={profile}
				recipients={recipients}
				isMultiPayment={recipients.length > 1}
			/>,
		);

		expect(screen.getByTestId("TransactionRecipientsModal--ShowList")).toBeInTheDocument();
		expect(screen.getByTestId("TransactionRecipientsModal--RecipientsCount")).toHaveTextContent(recipients.length);
	});

	it("should show recipients modal", async () => {
		render(
			<TransactionAddresses
				senderAddress={wallet.address()}
				network={wallet.network()}
				profile={profile}
				recipients={recipients}
				isMultiPayment={recipients.length > 1}
			/>,
		);

		await userEvent.click(screen.getByTestId("TransactionRecipientsModal--ShowList"));
		expect(screen.getByTestId("RecipientsModal")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("Modal__close-button"));
		expect(screen.queryByTestId("RecipientsModal")).not.toBeInTheDocument();
	});

	it("should show contract address when interactedWith is provided", () => {
		render(
			<TransactionAddresses
				senderAddress={wallet.address()}
				network={wallet.network()}
				profile={profile}
				interactedWith="0xcontract123"
			/>,
		);

		expect(screen.getByText("0xcontract123")).toBeInTheDocument();
	});
});

describe("ContractLabel", () => {
	it("should render contract label", () => {
		render(<ContractLabel />);

		expect(screen.getByTestId("TransactionRow__type")).toBeInTheDocument();
		expect(screen.getByText("Contract")).toBeInTheDocument();
	});
});

describe("TransactionRecipient", () => {
	it("should render with contract label when recipient is a contract", () => {
		const recipient: RecipientItem = {
			address: "0x1234567890123456789012345678901234567890",
			alias: "TestContract",
			amount: 100,
			isContract: true,
			isValidator: false,
		};

		render(<TransactionRecipient recipient={recipient} showLabel />);

		expect(screen.getByTestId("TransactionRow__type")).toBeInTheDocument();
		expect(screen.getByText("Contract")).toBeInTheDocument();
	});

	it("should render without contract label when recipient is not a contract", () => {
		const recipient: RecipientItem = {
			address: "0x1234567890123456789012345678901234567890",
			alias: "TestUser",
			amount: 100,
			isContract: false,
			isValidator: false,
		};

		render(<TransactionRecipient recipient={recipient} showLabel />);

		expect(screen.queryByTestId("TransactionRow__type")).not.toBeInTheDocument();
	});

	it("should hide label when showLabel is false", () => {
		const recipient: RecipientItem = {
			address: "0x1234567890123456789012345678901234567890",
			alias: "TestUser",
			amount: 100,
			isContract: false,
			isValidator: false,
		};

		render(<TransactionRecipient recipient={recipient} showLabel={false} />);

		expect(screen.queryByText("To")).toHaveClass("invisible");
	});
});
