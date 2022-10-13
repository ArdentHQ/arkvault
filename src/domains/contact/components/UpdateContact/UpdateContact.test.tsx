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

		userEvent.click(screen.getByTestId("contact-form__cancel-btn"));

		expect(onCancelFunction).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it("should not update contact if provided name already exists", async () => {
		const onSaveFunction = vi.fn();

		const newContact = profile.contacts().create("New name", [
			{
				address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
				coin: "ARK",
				network: "ark.mainnet",
			},
		]);

		render(
			<UpdateContact
				onCancel={onCancel}
				onClose={onClose}
				onDelete={onDelete}
				onSave={onSaveFunction}
				profile={profile}
				contact={newContact}
			/>,
		);

		await waitFor(() => {
			expect(nameInput()).toHaveValue(newContact.name());
		});

		const selectNetworkInput = screen.getByTestId("SelectDropdown__input");

		userEvent.paste(selectNetworkInput, "ARK D");
		userEvent.tab();

		await waitFor(() => expect(selectNetworkInput).toHaveValue("ARK Devnet"));

		userEvent.paste(screen.getByTestId("contact-form__address-input"), "D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax");

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__address-input")).toHaveValue("D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax");
		});

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__add-address-btn")).not.toBeDisabled();
		});

		userEvent.click(screen.getByTestId("contact-form__add-address-btn"));

		userEvent.clear(nameInput());
		userEvent.paste(nameInput(), contact.name());

		await waitFor(() => {
			expect(nameInput()).toHaveValue(contact.name());
		});

		expect(screen.getByTestId("Input__error")).toBeVisible();

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__save-btn")).toBeDisabled();
		});

		userEvent.click(screen.getByTestId("contact-form__save-btn"));

		expect(onSaveFunction).not.toHaveBeenCalled();
	});

	it("should call onDelete callback", async () => {
		const deleteSpy = vi.spyOn(profile.contacts(), "forget").mockImplementation(vi.fn());

		const onDeleteFunction = vi.fn();

		render(
			<UpdateContact
				onCancel={onCancel}
				onClose={onClose}
				onSave={onSave}
				onDelete={onDeleteFunction}
				profile={profile}
				contact={contact}
			/>,
		);

		await waitFor(() => {
			expect(nameInput()).toHaveValue(contact.name());
		});

		userEvent.click(screen.getByTestId("contact-form__delete-btn"));

		await waitFor(() => {
			expect(onDeleteFunction).toHaveBeenCalledWith(
				expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }),
			);
		});

		deleteSpy.mockRestore();
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

		userEvent.click(screen.getAllByTestId("contact-form__remove-address-btn")[0]);

		await waitFor(() => {
			expect(screen.queryByTestId("contact-form__address-list-item")).not.toBeInTheDocument();
		});

		(nameInput() as HTMLInputElement).select();
		userEvent.paste(nameInput(), newName);

		await waitFor(() => {
			expect(nameInput()).toHaveValue(newName);
		});

		const selectNetworkInput = screen.getByTestId("SelectDropdown__input");

		userEvent.paste(selectNetworkInput, "ARK D");
		userEvent.tab();

		await waitFor(() => expect(selectNetworkInput).toHaveValue("ARK Devnet"));

		userEvent.paste(screen.getByTestId("contact-form__address-input"), newAddress.address);

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__address-input")).toHaveValue(newAddress.address);
		});

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__add-address-btn")).not.toBeDisabled();
		});

		userEvent.click(screen.getByTestId("contact-form__add-address-btn"));

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__save-btn")).not.toBeDisabled();
		});

		userEvent.click(screen.getByTestId("contact-form__save-btn"));

		await waitFor(() => {
			expect(onSaveFunction).toHaveBeenCalledWith(contact.id());
		});

		const savedContact = profile.contacts().findById(contact.id());

		expect(savedContact.name()).toBe(newName);
		expect(savedContact.addresses().findByAddress(newAddress.address)).toHaveLength(1);
	});
});
