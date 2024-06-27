/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { UpdateContact } from "./UpdateContact";
import {
	env,
	getDefaultProfileId,
	render,
	renderResponsive,
	screen,
	waitFor,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";

let profile: Contracts.IProfile;
let contact: Contracts.IContact;
let resetProfileNetworksMock: () => void;

const onCancel = vi.fn();
const onClose = vi.fn();
const onDelete = vi.fn();
const onSave = vi.fn();

const nameInput = () => screen.getByTestId("contact-form__name-input");

describe("UpdateContact", () => {
	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		contact = profile.contacts().values()[0];

		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	it.each(["xs", "sm", "md"])("should render responsive", async (breakpoint) => {
		const { asFragment } = renderResponsive(
			<UpdateContact
				onCancel={onCancel}
				onClose={onClose}
				onDelete={onDelete}
				onSave={onSave}
				profile={profile}
				contact={contact}
			/>,
			breakpoint,
		);

		await waitFor(() => {
			expect(nameInput()).toHaveValue(contact.name());
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should cancel contact update", async () => {
		const onCancelFunction = vi.fn();

		render(
			<UpdateContact
				onCancel={onCancelFunction}
				onClose={onClose}
				onDelete={onDelete}
				onSave={onSave}
				profile={profile}
				contact={contact}
			/>,
		);

		await waitFor(() => {
			expect(nameInput()).toHaveValue(contact.name());
		});

		await userEvent.click(screen.getByTestId("contact-form__cancel-btn"));

		expect(onCancelFunction).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it("should update contact name and address", async () => {
		const onSaveFunction = vi.fn();
	
		const newName = "Updated name";
		const newAddress = {
			address: "D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
			coin: "ARK",
			name: "Test Address",
			network: "ark.devnet",
		};
	
		render(
			<UpdateContact
				onCancel={onCancel}
				onClose={onClose}
				onDelete={onDelete}
				onSave={onSaveFunction}
				profile={profile}
				contact={contact}
			/>,
		);
	
		await waitFor(() => {
			expect(nameInput()).toHaveValue(contact.name());
		});
	
		await userEvent.click(screen.getAllByTestId("contact-form__remove-address-btn")[0]);
	
		await waitFor(() => {
			expect(screen.queryByTestId("contact-form__address-list-item")).not.toBeInTheDocument();
		});
	
		(nameInput() as HTMLInputElement).select();
	
		await userEvent.clear(nameInput());
		await userEvent.type(nameInput(), newName);
	
		await waitFor(() => {
			expect(nameInput()).toHaveValue(newName);
		});
	
		const selectNetworkInput = screen.getByTestId("SelectDropdown__input");
	
		await userEvent.clear(selectNetworkInput);
		await userEvent.type(selectNetworkInput, "ARK D");
		await userEvent.tab();
	
		await waitFor(() => {
			expect(selectNetworkInput).toHaveValue("ARK Devnet");
		});
	

		const addressInput = screen.getByTestId("contact-form__address-input");
		await waitFor(() => expect(addressInput).toHaveValue(''));
		await userEvent.clear(addressInput);
		await userEvent.type(addressInput, newAddress.address);
		await waitFor(() => {
			expect(screen.getByTestId("contact-form__address-input")).toHaveValue(newAddress.address);
		});
		
	
		await waitFor(() => {
			expect(screen.getByTestId("contact-form__add-address-btn")).not.toBeDisabled();
		});
	
		await userEvent.click(screen.getByTestId("contact-form__add-address-btn"));
		await waitFor(() => {
			expect(screen.getByTestId("contact-form__save-btn")).not.toBeDisabled();
		});
	
		await userEvent.click(screen.getByTestId("contact-form__save-btn"));
		await waitFor(() => {
			expect(onSaveFunction).toHaveBeenCalledWith(contact.id());
		});
	
		const savedContact = profile.contacts().findById(contact.id());
		expect(savedContact.name()).toBe(newName);
		expect(savedContact.addresses().findByAddress(newAddress.address)).toHaveLength(1);
	});	
});
