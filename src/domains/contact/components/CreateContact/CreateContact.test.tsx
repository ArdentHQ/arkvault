/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
// import userEvent from "@testing-library/user-event";
import React from "react";

import userEvent from "@testing-library/user-event";
import { CreateContact } from "./CreateContact";
import { translations } from "@/domains/contact/i18n";
import {
	env,
	getDefaultProfileId,
	render,
	screen,
	waitFor,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";
const onSave = vi.fn();
const onCancel = vi.fn();
const onClose = vi.fn();

let profile: Contracts.IProfile;
// let contact: Contracts.IContact;
let resetProfileNetworksMock: () => void;

describe("CreateContact", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	beforeEach(() => {
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
		// contact = profile.contacts().values()[0];
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	it("should render", async () => {
		const { asFragment } = render(
			<CreateContact profile={profile} onCancel={onCancel} onClose={onClose} onSave={onSave} />,
		);

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_CREATE_CONTACT.TITLE);
		});

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_CREATE_CONTACT.DESCRIPTION);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should save a contact", async () => {
		const onSave = vi.fn();

		render(<CreateContact profile={profile} onCancel={onCancel} onClose={onClose} onSave={onSave} />);

		userEvent.paste(screen.getByTestId("contact-form__name-input"), "Alfonso");

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__name-input")).toHaveValue("Alfonso");
		});

		const selectNetworkInput = screen.getByTestId("SelectDropdown__input");

		userEvent.paste(selectNetworkInput, "ARK Dev");

		userEvent.click(screen.getByTestId("NetworkIcon-ARK-ark.devnet"));

		await waitFor(() => expect(selectNetworkInput).toHaveValue("ARK Devnet"));

		userEvent.type(screen.getByTestId("contact-form__address-input"), "DPAdZ1GqwNSgVDdf8y1gFTqgGq9RWy4SAX");

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__add-address-btn")).not.toBeDisabled();
		});

		userEvent.click(screen.getByTestId("contact-form__add-address-btn"));

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__save-btn")).not.toBeDisabled();
		});

		userEvent.click(screen.getByTestId("contact-form__save-btn"));

		await waitFor(() => {
			expect(onSave).toHaveBeenCalled();
		});
	});

	// it("should not create new contact if contact name exists", async () => {
	// 	render(<CreateContact profile={profile} onCancel={onCancel} onClose={onClose} onSave={onSave} />);
	//
	// 	userEvent.paste(screen.getByTestId("contact-form__name-input"), contact.name());
	//
	// 	await waitFor(() => {
	// 		expect(screen.getByTestId("contact-form__name-input")).toHaveValue(contact.name());
	// 	});
	//
	// 	expect(screen.getByTestId("Input__error")).toBeVisible();
	//
	// 	const selectNetworkInput = screen.getByTestId("SelectDropdown__input");
	//
	// 	userEvent.paste(selectNetworkInput, "ARK D");
	// 	userEvent.keyboard("{enter}");
	//
	// 	await waitFor(() => expect(selectNetworkInput).toHaveValue("ARK Devnet"));
	//
	// 	userEvent.type(screen.getByTestId("contact-form__address-input"), "D61mfSggzbvQgTUe6JhYKH2doHaqJ3Dyib");
	//
	// 	await waitFor(() => {
	// 		expect(screen.getByTestId("contact-form__add-address-btn")).not.toBeDisabled();
	// 	});
	//
	// 	userEvent.click(screen.getByTestId("contact-form__add-address-btn"));
	//
	// 	await waitFor(() => {
	// 		expect(screen.getByTestId("contact-form__save-btn")).toBeDisabled();
	// 	});
	//
	// 	userEvent.click(screen.getByTestId("contact-form__save-btn"));
	//
	// 	expect(onSave).not.toHaveBeenCalled();
	// });
});
