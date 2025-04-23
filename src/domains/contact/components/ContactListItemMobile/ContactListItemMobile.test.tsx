import React from "react";
import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import { ContactListItemMobile } from "./ContactListItemMobile";
import {
	env,
	render,
	screen,
	waitFor,
	mockProfileWithPublicAndTestNetworks,
	getMainsailProfileId,
} from "@/utils/testing-library";

const options = [
	{ label: "Option 1", value: "option_1" },
	{ label: "Option 2", value: "option_2" },
];

describe("ContactListItemMobile", () => {
	let profile: Contracts.IProfile;
	let contact: Contracts.IContact;
	let resetProfileNetworksMock: () => void;

	beforeAll(() => {
		profile = env.profiles().findById(getMainsailProfileId());
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
			<ContactListItemMobile
				profile={profile}
				hasBalance={true}
				contact={contact}
				onSend={vi.fn()}
				options={options}
				onAction={vi.fn()}
			/>,
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render addresses", async () => {
		const { asFragment } = render(
			<ContactListItemMobile
				profile={profile}
				hasBalance={true}
				contact={contact}
				onSend={vi.fn()}
				options={options}
				onAction={vi.fn()}
			/>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("ContactListItemMobile__addresses")).toBeInTheDocument();
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should execute onSend callback", async () => {
		const onSend = vi.fn();

		render(
			<ContactListItemMobile
				profile={profile}
				hasBalance={true}
				contact={contact}
				onSend={onSend}
				options={options}
				onAction={vi.fn()}
			/>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("ContactListItemMobile__addresses")).toBeInTheDocument();
		});

		const sendButton = screen.getByTestId("ContactListItemMobileAddress__send-button");

		expect(sendButton).toBeEnabled();

		await userEvent.click(sendButton);

		expect(onSend).toHaveBeenCalledWith(contact.addresses().first());
	});

	it("should not execute onSend callback if button is disabled", async () => {
		const onSend = vi.fn();

		render(
			<ContactListItemMobile
				profile={profile}
				hasBalance={false}
				contact={contact}
				onSend={onSend}
				options={options}
				onAction={vi.fn()}
			/>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("ContactListItemMobile__addresses")).toBeInTheDocument();
		});

		const sendButton = screen.getByTestId("ContactListItemMobileAddress__send-button");

		expect(sendButton).toBeDisabled();

		await userEvent.click(sendButton);

		expect(onSend).not.toHaveBeenCalled();
	});

	it("should execute onAction callback", async () => {
		const onAction = vi.fn();

		render(
			<ContactListItemMobile
				profile={profile}
				hasBalance={true}
				contact={contact}
				onSend={vi.fn()}
				options={options}
				onAction={onAction}
			/>,
		);

		await userEvent.click(screen.getByTestId("dropdown__toggle"));

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("dropdown__option--0"));

		expect(onAction).toHaveBeenCalledWith(options[0]);
	});
});
