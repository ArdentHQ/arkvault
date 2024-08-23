import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { ContactListItem } from "./ContactListItem";
import {
	env,
	getDefaultProfileId,
	render,
	screen,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";
import { translations } from "@/domains/contact/i18n";

const options = [
	{ label: "Option 1", value: "option_1" },
	{ label: "Option 2", value: "option_2" },
];

const devnet = "ark.devnet";

let contact: Contracts.IContact;
let profile: Contracts.IProfile;
let resetProfileNetworksMock: () => void;

describe("ContactListItem", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		contact = profile.contacts().first();
	});

	beforeEach(() => {
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	it("should render", () => {
		const { asFragment } = render(
			<table>
				<tbody>
					<ContactListItem
						profile={profile}
						options={options}
						onAction={vi.fn()}
						onSend={vi.fn()}
						item={contact}
						availableNetworks={[{ hasBalance: true, id: devnet }]}
					/>
				</tbody>
			</table>,
		);

		expect(asFragment()).toMatchSnapshot();
	});

	const renderContactList = ({ options, onAction = vi.fn(), onSend = vi.fn(), item = contact }) =>
		render(
			<table>
				<tbody>
					<ContactListItem
						profile={profile}
						options={options}
						onAction={onAction}
						onSend={onSend}
						item={item}
						availableNetworks={[{ hasBalance: true, id: devnet }]}
					/>
				</tbody>
			</table>,
		);

	it("should render as delegate", () => {
		const delegateContact = {
			addresses: () => ({
				count: () => 1,
				values: () => [
					{
						address: () => "id5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
						coin: () => "ARK",
						hasSyncedWithNetwork: () => true,
						isDelegate: () => true,
						network: () => "ark.devnet",
					},
				],
			}),
			avatar: () => "data:image/png;base64,avatarImage",
			id: () => "id5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
			name: () => "Caio",
		};

		const { asFragment } = renderContactList({
			item: delegateContact as unknown as Contracts.IContact,
			options,
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should show no wallets message", async () => {
		const contactAddresses = contact
			.addresses()
			.values()
			.map((address) => ({
				address: address.address(),
				coin: address.coin(),
				network: address.network(),
			}));

		contact.addresses().create({
			address: "AXtmcoxmKcuKHAivTRc2TJev48WkmnzPuC",
			coin: "INVALID",
			network: "invalid",
		});

		console.log(contact.addresses().all());
		renderContactList({ options });

		await userEvent.hover(screen.getAllByTestId("ContactListItem__send-button")[1]);

		await expect(screen.findByText(translations.VALIDATION.NO_WALLETS)).resolves.toBeVisible();

		profile.contacts().update(contact.id(), { addresses: contactAddresses });
	});

	it("should render with multiple addresses", () => {
		contact.addresses().create({
			address: "D61mfSggzbvQgTUe6JhYKH2doHaqJ3Dyib",
			coin: "ARK",
			network: "ark.devnet",
		});

		contact.addresses().create({
			address: "DKrACQw7ytoU2gjppy3qKeE2dQhZjfXYqu",
			coin: "ARK",
			network: "ark.devnet",
		});

		const { asFragment } = renderContactList({ options });

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render options", () => {
		const { asFragment } = renderContactList({ options });

		expect(asFragment()).toMatchSnapshot();
	});

	it("should call onAction callback", async () => {
		const onAction = vi.fn();

		renderContactList({ onAction, options });

		await userEvent.click(screen.getAllByTestId("dropdown__toggle")[0]);
		await userEvent.click(screen.getByTestId("dropdown__option--0"));

		expect(onAction).toHaveBeenCalledWith(options[0]);
	});

	it("should not call onAction callback", async () => {
		const onAction = vi.fn();

		renderContactList({ options });

		await userEvent.click(screen.getAllByTestId("dropdown__toggle")[0]);
		await userEvent.click(screen.getByTestId("dropdown__option--0"));

		expect(onAction).not.toHaveBeenCalled();
	});

	it("should call send", async () => {
		const onSend = vi.fn();

		renderContactList({ onSend: onSend, options });

		await userEvent.click(screen.getAllByTestId("ContactListItem__send-button")[0]);

		expect(onSend).toHaveBeenCalledWith(contact);
	});
});
