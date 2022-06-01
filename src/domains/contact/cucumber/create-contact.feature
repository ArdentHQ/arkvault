Feature: Create Contact

	@createContact
	Scenario: Successfully create a contact
		Given Alice is on the contacts page
		When she opens the add contact modal
		And submits valid contact details
		Then the contact is displayed in her contact list

	@createContact-openAndCancelModal
	Scenario: Open and close create contact modal
		Given Alice is on the contacts page
		When she opens the add contact modal
		And selects the cancel button
		Then the modal is closed

	@createContact-invalidNameLength
	Scenario: Fail to create contact due to invalid name length
		Given Alice is on the contacts page
		When she opens the add contact modal
		And enters an invalid username that exceeds 42 characters
		Then the name field provides an error
		And the save button is disabled

	@createContact-duplicateName
	Scenario: Fail to create contact due to duplicate name
		Given Alice is on the contacts page
		When she opens the add contact modal
		And attempts to create a contact with a duplicate name
		Then the name field provides an error
		And the save button is disabled

	@createContact-invalidAddress
	Scenario: Fail to create contact due to invalid address
		Given Alice is on the contacts page
		When she opens the add contact modal
		And attempts to create a contact with an invalid address
		Then the address field provides an error
		And the save button is disabled

	@createContact-noName
	Scenario: Fail to create contact due to no name provided
		Given Alice is on the contacts page
		When she opens the add contact modal
		And attempts to create a contact without entering a name
		Then the save button is disabled
