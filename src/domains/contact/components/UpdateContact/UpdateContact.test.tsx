/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { UpdateContact } from "./UpdateContact";
import {
	env,
	render,
	renderResponsive,
	screen,
	waitFor,
	mockProfileWithPublicAndTestNetworks,
	getMainsailProfileId,
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
		profile = env.profiles().findById(getMainsailProfileId());
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
			address: "0x811b4bD8133c348a1c9F290F79046d1587AEf30F",
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

		await userEvent.clear(nameInput());
		await userEvent.type(nameInput(), newName);
		await new Promise((resolve) => setTimeout(resolve, 1000));

		await waitFor(() => {
			expect(nameInput()).toHaveValue(newName);
		});

		const addressInput = screen.getByTestId("contact-form__address-input");
		await waitFor(() => expect(addressInput).toHaveValue(contact.addresses().first().address()));
		await userEvent.clear(addressInput);
		await userEvent.type(addressInput, newAddress.address);
		await waitFor(() => {
			expect(screen.getByTestId("contact-form__address-input")).toHaveValue(newAddress.address);
		});

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
