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
	waitFor,
} from "@/utils/testing-library";

import * as TooltipMock from "@/app/components/Tooltip";
import { translations as contactTranslations } from "@/domains/contact/i18n";
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

	it("should render compact", () => {
		render(
			<table>
				<tbody>
					<ContactListItem
						profile={profile}
						options={options}
						onAction={vi.fn()}
						onSend={vi.fn()}
						item={contact}
						availableNetworks={[{ hasBalance: true, id: devnet }]}
						isCompact
					/>
				</tbody>
			</table>,
		);

		expect(screen.getByTestId("ContactListItem__name")).toBeInTheDocument();
		expect(screen.queryByTestId("ContactListItem__user--avatar")).not.toBeInTheDocument();
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

	it("should render with multiple addresses", () => {
		const newAddress1 = contact.addresses().create({
			address: "D61mfSggzbvQgTUe6JhYKH2doHaqJ3Dyib",
			coin: "ARK",
			network: "ark.devnet",
		});

		const newAddress2 = contact.addresses().create({
			address: "DKrACQw7ytoU2gjppy3qKeE2dQhZjfXYqu",
			coin: "ARK",
			network: "ark.devnet",
		});

		const { asFragment } = renderContactList({ options });

		expect(asFragment()).toMatchSnapshot();

		contact.addresses().forget(newAddress1.id());
		contact.addresses().forget(newAddress2.id());
	});

	it("should render options", () => {
		const { asFragment } = renderContactList({ options });

		expect(asFragment()).toMatchSnapshot();
	});

	it("should call onAction callback", () => {
		const onAction = vi.fn();

		renderContactList({ onAction, options });

		userEvent.click(screen.getAllByTestId("dropdown__toggle")[0]);
		userEvent.click(screen.getByTestId("dropdown__option--0"));

		expect(onAction).toHaveBeenCalledWith(options[0]);
	});

	it("should not call onAction callback", () => {
		const onAction = vi.fn();

		renderContactList({ options });

		userEvent.click(screen.getAllByTestId("dropdown__toggle")[0]);
		userEvent.click(screen.getByTestId("dropdown__option--0"));

		expect(onAction).not.toHaveBeenCalled();
	});

	it("should call send", () => {
		const onSend = vi.fn();

		renderContactList({ onSend: onSend, options });

		userEvent.click(screen.getAllByTestId("ContactListItem__send-button")[0]);

		expect(onSend).toHaveBeenCalledWith(contact);
	});

	it("should show no wallets tooltip if no network available", () => {
		const tooltipMock = vi.spyOn(TooltipMock, "Tooltip");

		render(
			<table>
				<tbody>
					<ContactListItem
						profile={profile}
						options={options}
						onAction={vi.fn()}
						onSend={vi.fn()}
						item={contact}
						availableNetworks={[]}
					/>
				</tbody>
			</table>,
		);

		expect(tooltipMock).toHaveBeenCalledWith(
			expect.objectContaining({
				content: contactTranslations.VALIDATION.NO_WALLETS,
			}),
			expect.anything(),
		);

		tooltipMock.mockRestore();
	});

	it("should show no balance tooltip and disable send button", async () => {
		const tooltipMock = vi.spyOn(TooltipMock, "Tooltip");

		render(
			<table>
				<tbody>
					<ContactListItem
						profile={profile}
						options={options}
						onAction={vi.fn()}
						onSend={vi.fn()}
						item={contact}
						availableNetworks={[{ hasBalance: false, id: devnet }]}
					/>
				</tbody>
			</table>,
		);

		await waitFor(() => expect(screen.getByTestId("ContactListItem__send-button")).toBeDisabled());

		expect(tooltipMock).toHaveBeenCalledWith(
			expect.objectContaining({
				content: contactTranslations.VALIDATION.NO_BALANCE,
			}),
			expect.anything(),
		);

		tooltipMock.mockRestore();
	});
});
