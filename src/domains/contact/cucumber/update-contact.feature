Feature: Update Contact

	@updateContact
	Scenario: Successfully update contact name
		Given Alice is on the contacts page
		And she opens the update contact modal
		When updates a contact name and saves
		Then the contact is updated with the new name

	@updateContact-openAndCancelModal
	Scenario: Open and cancel the update contact modal
		Given Alice is on the contacts page
		When she opens the update contact modal
		But selects cancel on the update contact modal
		Then the update contact modal should no longer be displayed

	@updateContact-openAndCloseModal
	Scenario: Open and close the update contact modal
		Given Alice is on the contacts page
		When she opens the update contact modal
		And closes the update contact modal
		Then the update contact modal should no longer be displayed

	@updateContact-invalidAddress
	Scenario: Fail to update a contact due to invalid address
		Given Alice is on the contacts page
		When she opens the update contact modal
		And attempts to add an invalid address
		Then an error is displayed in the address field
		And the save button is disabled

	@updateContact-duplicateName
	Scenario: Fail to update a contact due to duplicate name
		Given Alice is on the contacts page
		When she opens the update contact modal
		And attempts to enter a duplicate name
		Then an error is displayed in the name field
		And the save button is disabled

	@updateContact-invalidName
	Scenario: Fail to update a contact due to invalid name
		Given Alice is on the contacts page
		When she opens the update contact modal
		And removes the name from the name field
		Then an error is displayed in the name field
		And the save button is disabled
