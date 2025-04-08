import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";

import { CreateContact } from "./CreateContact";
import { translations } from "@/domains/contact/i18n";
import { env, getMainsailProfileId, render, screen, waitFor } from "@/utils/testing-library";
import userEvent from "@testing-library/user-event";

const onSave = vi.fn();
const onCancel = vi.fn();
const onClose = vi.fn();

let profile: Contracts.IProfile;

const nameInput = () => screen.getByTestId("contact-form__name-input");
const addressInput = () => screen.getByTestId("contact-form__address-input");
const saveButton = () => screen.getByTestId("contact-form__save-btn");
const modalInner = () => screen.getByTestId("Modal__inner");

const newContact = {
	address: "0x6F0182a0cc707b055322CcF6d4CB6a5Aff1aEb22",
	name: "Test Contact",
};

describe("CreateContact", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getMainsailProfileId());
	});

	it("should render", async () => {
		const { asFragment } = render(
			<CreateContact profile={profile} onCancel={onCancel} onClose={onClose} onSave={onSave} />,
		);

		await waitFor(() => {
			expect(modalInner()).toHaveTextContent(translations.MODAL_CREATE_CONTACT.TITLE);
		});

		expect(modalInner()).toHaveTextContent(translations.MODAL_CREATE_CONTACT.DESCRIPTION);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should call onSave when form is submitted", async () => {
		render(<CreateContact profile={profile} onCancel={onCancel} onClose={onClose} onSave={onSave} />);

		await waitFor(() => {
			expect(modalInner()).toHaveTextContent(translations.MODAL_CREATE_CONTACT.TITLE);
		});

		await userEvent.type(nameInput(), newContact.name);
		await userEvent.tab();
		await userEvent.type(addressInput(), newContact.address);
		await userEvent.tab();

		await waitFor(() => {
			expect(saveButton()).not.toBeDisabled();
		});

		await userEvent.click(saveButton());

		await waitFor(() => {
			expect(onSave).toHaveBeenCalled();
		});
	});

	it("should update errors when handleChange is called", async () => {
		render(<CreateContact profile={profile} onCancel={onCancel} onClose={onClose} onSave={onSave} />);

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_CREATE_CONTACT.TITLE);
		});

		await userEvent.type(nameInput(), newContact.name);
		await userEvent.tab();

		await userEvent.clear(nameInput());
		await userEvent.tab();

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__name-input")).toHaveAttribute("aria-invalid", "true");
		});
	});
});
