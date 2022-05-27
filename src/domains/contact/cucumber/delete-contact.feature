Feature: Delete Contact

	@deleteContact
	Scenario: Successfully delete a contact
		Given Alice is on the contacts page
		When she attempts to delete a contact
		Then the contact is removed from her contact list

	@deleteContact-openAndCancelModal
	Scenario: Open and cancel the delete contact modal
		Given Alice is on the contacts page
		When she opens the delete contact modal
		But selects cancel on the delete contact modal
		Then the delete contact modal should no longer be displayed
		And the contact should still exist

	@deleteContact-openAndCloseModal
	Scenario: Open and close the delete contact modal
		Given Alice is on the contacts page
		When she opens the delete contact modal
		And closes the delete contact modal
		Then the delete contact modal should no longer be displayed
		And the contact should still exist
