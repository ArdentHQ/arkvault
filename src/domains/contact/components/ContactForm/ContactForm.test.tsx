/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { ContactForm } from "./ContactForm";
import {
	env,
	getDefaultProfileId,
	render,
	renderResponsive,
	screen,
	waitFor,
	mockProfileWithPublicAndTestNetworks,
	mockProfileWithOnlyPublicNetworks,
} from "@/utils/testing-library";

const onSave = jest.fn();
const onCancel = jest.fn();
const onChange = jest.fn();

let profile: Contracts.IProfile;
let contact: Contracts.IContact;
let validArkDevnetAddress: string;
let resetProfileNetworksMock: () => void;

const addressInput = () => screen.getByTestId("contact-form__address-input");
const nameInput = () => screen.getByTestId("contact-form__name-input");
const saveButton = () => screen.getByTestId("contact-form__save-btn");

const addressListID = "contact-form__address-list-item";
const addAddressID = "contact-form__add-address-btn";
const ARKDevnet = "ARK Devnet";

describe("ContactForm", () => {
	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);

		const [wallet] = profile.wallets().values();
		validArkDevnetAddress = wallet.address();
		contact = profile.contacts().values()[0];

		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	it.each(["xs", "sm"])("should render responsive", async (breakpoint) => {
		const { asFragment } = renderResponsive(
			<ContactForm onChange={onChange} errors={{}} profile={profile} onCancel={onCancel} onSave={onSave} />,
			breakpoint,
		);

		await waitFor(() => {
			expect(saveButton()).toBeDisabled();
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with errors", async () => {
		const { asFragment } = render(
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

		expect(asFragment()).toMatchSnapshot();
	});

	it("should clear errors when changing network", async () => {
		render(
			<ContactForm
				profile={profile}
				onCancel={onCancel}
				onSave={onSave}
				onChange={onChange}
				errors={{ address: "Contact address error" }}
			/>,
		);

		await waitFor(() => {
			expect(saveButton()).toBeDisabled();
		});

		await waitFor(() => {
			expect(screen.getByTestId("Input__error")).toBeInTheDocument();
		});

		userEvent.paste(nameInput(), "name");

		const selectNetworkInput = screen.getByTestId("SelectDropdown__input");

		userEvent.paste(selectNetworkInput, "ARK D");
		userEvent.keyboard("{enter}");

		await waitFor(() => expect(selectNetworkInput).toHaveValue(ARKDevnet));

		userEvent.paste(addressInput(), validArkDevnetAddress);

		await waitFor(() => {
			expect(addressInput()).toHaveValue(validArkDevnetAddress);
		});

		await waitFor(() => {
			expect(screen.getByTestId(addAddressID)).not.toBeDisabled();
		});

		userEvent.click(screen.getByTestId(addAddressID));

		await waitFor(() => {
			expect(screen.getByTestId(addressListID)).toBeVisible();
		});

		await waitFor(() => {
			expect(screen.queryByTestId("Input__error")).not.toBeInTheDocument();
		});

		await waitFor(() => {
			expect(saveButton()).not.toBeDisabled();
		});
	});

	it("should handle onChange event", async () => {
		const name = "Sample name";

		const onChangeFunction = jest.fn();

		render(
			<ContactForm
				profile={profile}
				onCancel={onCancel}
				onChange={onChangeFunction}
				onSave={onSave}
				errors={{ name: "Contact name error" }}
			/>,
		);

		userEvent.paste(nameInput(), name);

		await waitFor(() => {
			expect(nameInput()).toHaveValue(name);
		});

		await waitFor(() => {
			expect(onChangeFunction).toHaveBeenCalledWith("name");
		});
	});

	it("should select cryptoasset", async () => {
		render(<ContactForm profile={profile} onCancel={onCancel} onChange={onChange} errors={{}} onSave={onSave} />);

		const selectNetworkInput = screen.getByTestId("SelectDropdown__input");

		userEvent.paste(selectNetworkInput, "ARK D");
		userEvent.keyboard("{enter}");

		await waitFor(() => expect(selectNetworkInput).toHaveValue(ARKDevnet));
	});

	it("should add a valid address successfully", async () => {
		render(<ContactForm onChange={onChange} errors={{}} profile={profile} onCancel={onCancel} onSave={onSave} />);

		expect(screen.queryByTestId(addressListID)).not.toBeInTheDocument();

		userEvent.paste(nameInput(), "name");

		await waitFor(() => {
			expect(nameInput()).toHaveValue("name");
		});

		const selectNetworkInput = screen.getByTestId("SelectDropdown__input");

		userEvent.paste(selectNetworkInput, "ARK D");
		userEvent.keyboard("{enter}");

		await waitFor(() => expect(selectNetworkInput).toHaveValue(ARKDevnet));

		userEvent.paste(addressInput(), validArkDevnetAddress);

		await waitFor(() => {
			expect(addressInput()).toHaveValue(validArkDevnetAddress);
		});

		await waitFor(() => {
			expect(screen.getByTestId(addAddressID)).not.toBeDisabled();
		});

		userEvent.click(screen.getByTestId(addAddressID));

		await waitFor(() => {
			expect(screen.getByTestId(addressListID)).toBeVisible();
		});
	});

	it("should not add invalid address and should display error message", async () => {
		render(<ContactForm onChange={onChange} errors={{}} profile={profile} onCancel={onCancel} onSave={onSave} />);

		expect(screen.queryByTestId(addressListID)).not.toBeInTheDocument();

		userEvent.paste(nameInput(), "name");

		await waitFor(() => {
			expect(nameInput()).toHaveValue("name");
		});

		const selectNetworkInput = screen.getByTestId("SelectDropdown__input");

		userEvent.paste(selectNetworkInput, "ARK D");
		userEvent.keyboard("{enter}");

		await waitFor(() => expect(selectNetworkInput).toHaveValue(ARKDevnet));

		userEvent.paste(addressInput(), "invalid address");

		await waitFor(() => {
			expect(addressInput()).toHaveValue("invalid address");
		});

		await waitFor(() => {
			expect(screen.getByTestId(addAddressID)).not.toBeDisabled();
		});

		userEvent.click(screen.getByTestId(addAddressID));

		await waitFor(() => {
			expect(screen.getByTestId("Input__error")).toBeVisible();
		});

		expect(screen.queryByTestId(addressListID)).not.toBeInTheDocument();
	});

	it("should not add duplicate address and display error message", async () => {
		render(<ContactForm onChange={onChange} errors={{}} profile={profile} onCancel={onCancel} onSave={onSave} />);

		expect(screen.queryByTestId(addressListID)).not.toBeInTheDocument();

		userEvent.paste(nameInput(), "name");

		await waitFor(() => {
			expect(nameInput()).toHaveValue("name");
		});

		const selectNetworkInput = screen.getByTestId("SelectDropdown__input");

		userEvent.paste(selectNetworkInput, "ARK D");
		userEvent.keyboard("{enter}");

		await waitFor(() => expect(selectNetworkInput).toHaveValue(ARKDevnet));

		const contactAddress = contact.addresses().first().address();

		userEvent.paste(addressInput(), contactAddress);

		await waitFor(() => {
			expect(addressInput()).toHaveValue(contactAddress);
		});

		await waitFor(() => {
			expect(screen.getByTestId(addAddressID)).not.toBeDisabled();
		});

		userEvent.click(screen.getByTestId(addAddressID));

		await waitFor(() => {
			expect(screen.getByTestId("Input__error")).toBeVisible();
		});

		expect(screen.queryByTestId(addressListID)).not.toBeInTheDocument();
	});

	it("should handle save", async () => {
		const onSave = jest.fn();

		render(<ContactForm onChange={onChange} errors={{}} profile={profile} onCancel={onCancel} onSave={onSave} />);

		userEvent.paste(nameInput(), "name");

		await waitFor(() => {
			expect(nameInput()).toHaveValue("name");
		});

		const selectNetworkInput = screen.getByTestId("SelectDropdown__input");

		userEvent.paste(selectNetworkInput, "ARK D");
		userEvent.keyboard("{enter}");

		await waitFor(() => expect(selectNetworkInput).toHaveValue(ARKDevnet));

		userEvent.paste(addressInput(), validArkDevnetAddress);

		await waitFor(() => {
			expect(addressInput()).toHaveValue(validArkDevnetAddress);
		});

		await waitFor(() => {
			expect(screen.queryByTestId(addAddressID)).not.toBeDisabled();
		});

		userEvent.click(screen.getByTestId(addAddressID));

		await waitFor(() => {
			expect(screen.getByTestId(addressListID)).toBeVisible();
		});

		await waitFor(() => {
			expect(saveButton()).not.toBeDisabled();
		});

		userEvent.click(saveButton());

		await waitFor(() => {
			expect(onSave).toHaveBeenCalledWith({
				addresses: [
					{
						address: validArkDevnetAddress,
						coin: "ARK",
						name: validArkDevnetAddress,
						network: "ark.devnet",
					},
				],
				name: expect.any(String),
			});
		});
	});

	it("should select the network if only one is available", async () => {
		resetProfileNetworksMock();
		resetProfileNetworksMock = mockProfileWithOnlyPublicNetworks(profile);

		render(<ContactForm onChange={onChange} errors={{}} profile={profile} onCancel={onCancel} onSave={onSave} />);

		expect(screen.queryByTestId(addressListID)).not.toBeInTheDocument();

		const selectNetworkInput = screen.getByTestId("SelectDropdown__input");

		await waitFor(() => expect(selectNetworkInput).toHaveValue("ARK"));

		userEvent.type(addressInput(), "AYuYnr7WwwLUc9rLpALwVFn85NFGGmsNK7");

		await waitFor(() => {
			expect(addressInput()).toHaveValue("AYuYnr7WwwLUc9rLpALwVFn85NFGGmsNK7");
		});
	});

	it("should remove network from options", async () => {
		render(<ContactForm onChange={onChange} errors={{}} profile={profile} onCancel={onCancel} onSave={onSave} />);

		expect(screen.queryByTestId(addressListID)).not.toBeInTheDocument();

		userEvent.paste(nameInput(), "name");

		await waitFor(() => {
			expect(nameInput()).toHaveValue("name");
		});

		const selectNetworkInput = screen.getByTestId("SelectDropdown__input");

		userEvent.paste(selectNetworkInput, "ARK");
		userEvent.keyboard("{enter}");

		await waitFor(() => expect(selectNetworkInput).toHaveValue("ARK"));

		userEvent.type(addressInput(), "AYuYnr7WwwLUc9rLpALwVFn85NFGGmsNK7");

		await waitFor(() => {
			expect(addressInput()).toHaveValue("AYuYnr7WwwLUc9rLpALwVFn85NFGGmsNK7");
		});

		await waitFor(() => {
			expect(screen.getByTestId(addAddressID)).not.toBeDisabled();
		});

		userEvent.click(screen.getByTestId(addAddressID));

		await waitFor(() => {
			expect(screen.getByTestId(addressListID)).toBeVisible();
		});

		// Second addition

		userEvent.paste(selectNetworkInput, "ARK");
		userEvent.keyboard("{enter}");

		await waitFor(() => expect(selectNetworkInput).toHaveValue(ARKDevnet));
	});

	it("should remove an address", async () => {
		render(
			<ContactForm
				onChange={onChange}
				errors={{}}
				profile={profile}
				contact={contact}
				onCancel={onCancel}
				onSave={onSave}
			/>,
		);

		expect(screen.getAllByTestId(addressListID)).toHaveLength(contact.addresses().count());

		userEvent.click(screen.getAllByTestId("contact-form__remove-address-btn")[0]);

		await waitFor(() => {
			expect(screen.queryByTestId(addressListID)).not.toBeInTheDocument();
		});
	});
});
