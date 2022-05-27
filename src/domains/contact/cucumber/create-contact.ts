import { Selector } from "testcafe";

import { cucumber, translate, visitWelcomeScreen, scrollToElement } from "../../../utils/e2e-utils";
import { goToContacts } from "../e2e/common";

const contactName = "Test contact";
const nameInput = Selector('[data-testid="contact-form__name-input"]');
const addressInput = Selector('[data-testid="contact-form__address-input"]');
const addAddressButton = Selector('[data-testid="contact-form__add-address-btn"]');
const cancelButton = Selector('[data-testid="contact-form__cancel-btn"]');
const saveButton = Selector('[data-testid="contact-form__save-btn"]');
const error = Selector('[data-testid="Input__error"]');
const modalOverlay = Selector('[data-testid="Modal__overlay"]');

const preSteps = {
	"Given Alice is on the contacts page": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToContacts(t);
	},
	"When she opens the add contact modal": async (t: TestController) => {
		await t.click(Selector('[data-testid="contacts__add-contact-btn"]'));
		await t
			.expect(
				Selector('[data-testid="Modal__inner"]').withText(translate("CONTACTS.MODAL_CREATE_CONTACT.TITLE"))
					.exists,
			)
			.ok();
	},
};

cucumber("@createContact", {
	...preSteps,
	"And submits valid contact details": async (t: TestController) => {
		await t.typeText(nameInput, contactName);
		await t.typeText(Selector('[data-testid="SelectDropdown__input"]'), "ARK D");
		await t.pressKey("tab");
		const addressInput = Selector('[data-testid="contact-form__address-input"]');
		await t.typeText(addressInput, "D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax");
		await t.expect(addAddressButton.hasAttribute("disabled")).notOk();
		await t.click(addAddressButton);
		await scrollToElement(saveButton.parent(), modalOverlay);
		await t.click(saveButton);
		await t
			.expect(
				Selector('[data-testid="Modal__inner"]').withText(translate("CONTACTS.MODAL_CREATE_CONTACT.TITLE"))
					.exists,
			)
			.notOk();
	},
	"Then the contact is displayed in her contact list": async (t: TestController) => {
		await t
			.expect(
				Selector('[data-testid="ContactList"] [data-testid="ContactListItem__name"]').withText(contactName)
					.exists,
			)
			.ok();
	},
});

cucumber("@createContact-openAndCancelModal", {
	...preSteps,
	"And selects the cancel button": async (t: TestController) => {
		await scrollToElement(cancelButton.parent(), modalOverlay);
		await t.click(cancelButton);
	},
	"Then the modal is closed": async (t: TestController) => {
		await t
			.expect(
				Selector('[data-testid="Modal__inner"]').withText(translate("CONTACTS.MODAL_CREATE_CONTACT.TITLE"))
					.exists,
			)
			.notOk();
	},
});

cucumber("@createContact-invalidNameLength", {
	...preSteps,
	"And enters an invalid username that exceeds 42 characters": async (t: TestController) => {
		await t.typeText(nameInput, "1234567890123456789012345678901234567890123");
	},
	"Then the name field provides an error": async (t: TestController) => {
		await t.expect(error.exists).ok();
	},
	"And the save button is disabled": async (t: TestController) => {
		await t.expect(saveButton.hasAttribute("disabled")).ok();
	},
});

cucumber("@createContact-duplicateName", {
	...preSteps,
	"And attempts to create a contact with a duplicate name": async (t: TestController) => {
		await t.typeText(nameInput, "Brian");
		await t.typeText(Selector('[data-testid="SelectDropdown__input"]'), "ARK D");
		await t.pressKey("tab");
		await t.typeText(addressInput, "D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax");
		await t.expect(addAddressButton.hasAttribute("disabled")).notOk();
		await t.click(addAddressButton);
	},
	"Then the name field provides an error": async (t: TestController) => {
		await t.expect(error.exists).ok();
		// @ts-ignore
		await t.expect(Object.hasOwn(error.dataset, "errortext")).ok();
		// @ts-ignore
		await t.expect(error.dataset.errortext).eql(translate("CONTACTS.VALIDATION.NAME_EXISTS", { name: "Sam" }));
	},
	"And the save button is disabled": async (t: TestController) => {
		await t.expect(saveButton.hasAttribute("disabled")).ok();
	},
});

cucumber("@createContact-invalidAddress", {
	...preSteps,
	"And attempts to create a contact with an invalid address": async (t: TestController) => {
		await t.typeText(nameInput, contactName);
		await t.typeText(Selector('[data-testid="SelectDropdown__input"]'), "ARK D");
		await t.pressKey("tab");
		await t.typeText(addressInput, "AZzmCRP3Us7q4Pbyu3qCr2Dwq8vvuseLKa");
		await t.expect(addAddressButton.hasAttribute("disabled")).notOk();
		await t.click(addAddressButton);
	},
	"Then the address field provides an error": async (t: TestController) => {
		await t.expect(error.exists).ok();
	},
	"And the save button is disabled": async (t: TestController) => {
		await t.expect(saveButton.hasAttribute("disabled")).ok();
	},
});

cucumber("@createContact-noName", {
	...preSteps,
	"And attempts to create a contact without entering a name": async (t: TestController) => {
		await t.typeText(Selector('[data-testid="SelectDropdown__input"]'), "ARK D");
		await t.pressKey("tab");
		await t.typeText(addressInput, "D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax");
		await t.expect(addAddressButton.hasAttribute("disabled")).notOk();
		await t.click(addAddressButton);
	},
	"Then the save button is disabled": async (t: TestController) => {
		await t.expect(saveButton.hasAttribute("disabled")).ok();
		await t
			.expect(
				Selector('[data-testid="Modal__inner"]').withText(translate("CONTACTS.MODAL_CREATE_CONTACT.TITLE"))
					.exists,
			)
			.ok();
	},
});
