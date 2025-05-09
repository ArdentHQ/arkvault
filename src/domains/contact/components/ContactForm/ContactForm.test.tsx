import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";
import "jest-styled-components";
import { ContactForm } from "./ContactForm";
import {
	env,
	render,
	renderResponsive,
	screen,
	waitFor,
	mockProfileWithPublicAndTestNetworks,
	mockProfileWithOnlyPublicNetworks,
	getMainsailProfileId,
} from "@/utils/testing-library";

const onSave = vi.fn();
const onCancel = vi.fn();
const onChange = vi.fn();

let profile: Contracts.IProfile;
let contact: Contracts.IContact;
let validDevnetAddress: string;
let resetProfileNetworksMock: () => void;

const addressInput = () => screen.getByTestId("contact-form__address-input");
const nameInput = () => screen.getByTestId("contact-form__name-input");
const saveButton = () => screen.getByTestId("contact-form__save-btn");
const contactAddress = "0x811b4bD8133c348a1c9F290F79046d1587AEf30F";

describe("ContactForm", () => {
	beforeAll(() => {
		process.env.MOCK_AVAILABLE_NETWORKS = "false";
	});

	beforeEach(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

		await env.profiles().restore(profile);

		const [wallet] = profile.wallets().values();
		validDevnetAddress = wallet.address();
		contact = profile.contacts().values()[0];

		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	it.each(["xs", "sm"])("should render responsive %s", async (breakpoint) => {
		renderResponsive(
			<ContactForm onChange={onChange} errors={{}} profile={profile} onCancel={onCancel} onSave={onSave} />,
			breakpoint,
		);

		await waitFor(() => {
			expect(saveButton()).toBeDisabled();
		});
	});

	it("should render with errors", async () => {
		render(
			<ContactForm
				profile={profile}
				onCancel={onCancel}
				onSave={onSave}
				onChange={onChange}
				errors={{ name: "Contact name error" }}
			/>,
		);

		await waitFor(() => {
			expect(saveButton()).toBeDisabled();
		});
	});

	it("should handle onChange event", async () => {
		const name = "Sample name";

		const onChangeFunction = vi.fn();

		render(
			<ContactForm
				profile={profile}
				onCancel={onCancel}
				onChange={onChangeFunction}
				onSave={onSave}
				errors={{ name: "Contact name error" }}
			/>,
		);

		await userEvent.type(nameInput(), name);

		await waitFor(() => {
			expect(nameInput()).toHaveValue(name);
		});

		await waitFor(() => {
			expect(onChangeFunction).toHaveBeenCalledWith("name");
		});
	});

	it("should add a valid address successfully", async () => {
		render(<ContactForm onChange={onChange} errors={{}} profile={profile} onCancel={onCancel} onSave={onSave} />);

		await userEvent.type(nameInput(), "name");

		await waitFor(() => {
			expect(nameInput()).toHaveValue("name");
		});

		await userEvent.type(addressInput(), validDevnetAddress);

		await waitFor(() => {
			expect(addressInput()).toHaveValue(validDevnetAddress);
		});

		await waitFor(() => {
			expect(saveButton()).not.toBeDisabled();
		});
	});

	it("should not add invalid address and should display error message", async () => {
		render(<ContactForm onChange={onChange} errors={{}} profile={profile} onCancel={onCancel} onSave={onSave} />);

		await userEvent.type(nameInput(), "name");

		await waitFor(() => {
			expect(nameInput()).toHaveValue("name");
		});

		await userEvent.type(addressInput(), "invalid address");

		await waitFor(() => {
			expect(addressInput()).toHaveValue("invalid address");
		});

		await waitFor(() => {
			expect(screen.getByTestId("Input__error")).toBeVisible();
		});

		await waitFor(() => {
			expect(saveButton()).toBeDisabled();
		});
	});

	it("should not add duplicate address and display error message", async () => {
		render(<ContactForm onChange={onChange} errors={{}} profile={profile} onCancel={onCancel} onSave={onSave} />);

		await userEvent.type(nameInput(), "name");

		await waitFor(() => {
			expect(nameInput()).toHaveValue("name");
		});

		const contactAddress = contact.addresses().first().address();

		await userEvent.type(addressInput(), contactAddress);

		await waitFor(() => {
			expect(addressInput()).toHaveValue(contactAddress);
		});

		await waitFor(() => {
			expect(screen.getByTestId("Input__error")).toBeVisible();
		});

		await waitFor(() => {
			expect(saveButton()).toBeDisabled();
		});
	});

	it("should handle save", async () => {
		const onSave = vi.fn();
		render(<ContactForm onChange={onChange} errors={{}} profile={profile} onCancel={onCancel} onSave={onSave} />);

		await userEvent.type(nameInput(), "name");

		await waitFor(() => {
			expect(nameInput()).toHaveValue("name");
		});

		await userEvent.type(addressInput(), validDevnetAddress);

		await waitFor(() => {
			expect(addressInput()).toHaveValue(validDevnetAddress);
		});

		await waitFor(() => {
			expect(saveButton()).not.toBeDisabled();
		});

		await userEvent.click(saveButton());

		await waitFor(() => {
			expect(onSave).toHaveBeenCalledWith({
				address: {
					address: validDevnetAddress,
					name: validDevnetAddress,
				},
				name: expect.any(String),
			});
		});
	});

	it("should select the network if only one is available", async () => {
		resetProfileNetworksMock();
		resetProfileNetworksMock = mockProfileWithOnlyPublicNetworks(profile);

		render(<ContactForm onChange={onChange} errors={{}} profile={profile} onCancel={onCancel} onSave={onSave} />);

		await userEvent.type(addressInput(), contactAddress);

		await waitFor(() => {
			expect(addressInput()).toHaveValue(contactAddress);
		});
	});

	it("should remove network from options", async () => {
		render(<ContactForm onChange={onChange} errors={{}} profile={profile} onCancel={onCancel} onSave={onSave} />);

		await userEvent.type(nameInput(), "name");

		await waitFor(() => {
			expect(nameInput()).toHaveValue("name");
		});

		await userEvent.type(addressInput(), contactAddress);

		await waitFor(() => {
			expect(addressInput()).toHaveValue(contactAddress);
		});

		await waitFor(() => {
			expect(saveButton()).not.toBeDisabled();
		});
	});
});
