import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, visitWelcomeScreen, scrollToElement } from "../../../utils/e2e-utils";
import { goToContacts } from "../e2e/common";

const translations = buildTranslations();
const nameInput = Selector('[data-testid="contact-form__name-input"]');
const addressInput = Selector('[data-testid="contact-form__address-input"]');
const saveButton = Selector('[data-testid="contact-form__save-btn"]');
const modalOverlay = Selector('[data-testid="Modal__overlay"]');

const preSteps = {
	"Given Alice is on the contacts page": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToContacts(t);
	},
	"And she opens the update contact modal": async (t: TestController) => {
		await t.click(
			Selector('[data-testid="ContactList"] tbody > tr:first-child [data-testid="dropdown__toggle"]').child(0),
		);
		await t.click(
			Selector('[data-testid="dropdown__option--0"]').withText(
				translations.COMMON.EDIT,
			),
		);
		await t
			.expect(
				Selector('[data-testid="Modal__inner"]').withText(translations.CONTACTS.MODAL_UPDATE_CONTACT.TITLE)
					.exists,
			)
			.ok();
	},
};

const updateContactModalNotExists = async (t: TestController) => {
	await t
		.expect(
			Selector('[data-testid="Modal__inner"]').withText(translations.CONTACTS.MODAL_UPDATE_CONTACT.TITLE).exists,
		)
		.notOk();
};

cucumber("@updateContact", {
	...preSteps,
	"When updates a contact name and saves": async (t: TestController) => {
		await t.expect(Selector('[data-testid="ContactList"] tbody > tr:first-child td').withText("Brian").exists).ok();
		await t
			.expect(Selector('[data-testid="ContactList"] tbody > tr:first-child td').withText("Anne Doe").exists)
			.notOk();
		await t.typeText(nameInput, "Anne Doe", { replace: true });
		await scrollToElement(saveButton.parent(), modalOverlay);
		await t.expect(saveButton.hasAttribute("disabled")).notOk();
		await t.click(saveButton);

		await updateContactModalNotExists(t);
	},
	"Then the contact is updated with the new name": async (t: TestController) => {
		await t
			.expect(Selector('[data-testid="ContactList"] tbody > tr:first-child td').withText("Brian").exists)
			.notOk();
		await t
			.expect(Selector('[data-testid="ContactList"] tbody > tr:first-child td').withText("Anne Doe").exists)
			.ok();
	},
});

cucumber("@updateContact-openAndCancelModal", {
	...preSteps,
	"But selects cancel on the update contact modal": async (t: TestController) => {
		const cancelButton = Selector('[data-testid="contact-form__cancel-btn"]');
		await scrollToElement(cancelButton.parent(), modalOverlay);
		await t.hover(cancelButton);
		await t.click(cancelButton);
	},
	"Then the update contact modal should no longer be displayed": async (t: TestController) => {
		await updateContactModalNotExists(t);
	},
});

cucumber("@updateContact-openAndCloseModal", {
	...preSteps,
	"And closes the update contact modal": async (t: TestController) => {
		await t.click(Selector('[data-testid="Modal__close-button"]'));
	},
	"Then the update contact modal should no longer be displayed": async (t: TestController) => {
		await updateContactModalNotExists(t);
	},
});

cucumber("@updateContact-invalidAddress", {
	...preSteps,
	"And attempts to add an invalid address": async (t: TestController) => {
		await t.click(Selector('[data-testid="contact-form__remove-address-btn"]'));
		await t.typeText(Selector('[data-testid="SelectDropdown__input"]'), "ARK D");
		await t.pressKey("tab");
		await t.typeText(addressInput, "invalid address");
		await t.expect(Selector('[data-testid="contact-form__add-address-btn"]').hasAttribute("disabled")).notOk();
		await t.hover(Selector('[data-testid="contact-form__add-address-btn"]'));
		await t.click(Selector('[data-testid="contact-form__add-address-btn"]'));
	},
	"Then an error is displayed in the address field": async (t: TestController) => {
		await t.expect(Selector('[data-testid="Input__error"]').exists).ok();
	},
	"And the save button is disabled": async (t: TestController) => {
		await t.expect(saveButton.hasAttribute("disabled")).ok();
	},
});

cucumber("@updateContact-duplicateName", {
	...preSteps,
	"And attempts to enter a duplicate name": async (t: TestController) => {
		await t.typeText(nameInput, "Rok", { replace: true });
	},
	"Then an error is displayed in the name field": async (t: TestController) => {
		await t.expect(Selector('[data-testid="Input__error"]').exists).ok();
	},
	"And the save button is disabled": async (t: TestController) => {
		await t.expect(saveButton.hasAttribute("disabled")).ok();
	},
});

cucumber("@updateContact-noName", {
	...preSteps,
	"And removes the name from the name field": async (t: TestController) => {
		await t.typeText(nameInput, " ", { replace: true });
	},
	"Then an error is displayed in the name field": async (t: TestController) => {
		await t.expect(Selector('[data-testid="Input__error"]').exists).ok();
	},
	"And the save button is disabled": async (t: TestController) => {
		await t.expect(saveButton.hasAttribute("disabled")).ok();
	},
});
