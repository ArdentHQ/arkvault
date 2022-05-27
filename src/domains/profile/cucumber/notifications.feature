Feature: Notifications

	@notifications-openNotifications
	Scenario: Successfully open notification list
		Given Alice is signed into her profile
		When she opens her notifications
		Then the notification list is displayed

	@notifications-transactionDetail
	Scenario: Successfully open and close transaction details modal from notifications
		Given Alice is signed into her profile
		When she opens her notifications
		And selects a transaction
		Then the transaction details modal is displayed
		When she selects close on the transaction details modal
		Then the modal is no longer displayed

	@notifications-redDotUnread
	Scenario: Notification red dot visible when notifications are unread
		Given Alice signs into a profile with unread notifications
		Then a red dot should be present on the notifications icon

	@notifications-markAsRead
	Scenario: Notification red dot hidden when notifications read
		Given Alice signs into a profile with unread notifications
		Then a red dot should be present on the notifications icon
		When she opens her notifications
		Then the notifications are marked as read
		And the red dot is hidden
