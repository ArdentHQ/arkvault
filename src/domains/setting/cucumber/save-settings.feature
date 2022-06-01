Feature: Save Settings

    @saveSettings-general
    Scenario: Save General Profile Settings
        Given Alice is on the general settings page
        When she changes her general settings
        And saves her settings
        Then a success toast message is displayed

    @saveSettings-appearance
    Scenario: Save Appearance Profile Settings
        Given Alice is on the appearance settings page
        When she changes her appearance settings
        And saves her settings
        Then a success toast message is displayed

    @saveSettings-unsavedChanges
    Scenario: Display a confirmation modal when changing route with unsaved changes
        Given Alice is on the general settings page
        When she changes her general settings
        And navigates to a different page before saving
        Then a confirmation modal is displayed
        When she reverts her changes
        And navigates to a different page before saving
        Then the confirmation modal is not displayed

    @saveSettings-updateCurrency
    Scenario: Update balance when currency setting is changed
        Given Alice signs into a profile with a wallet
        And she is on the settings page
        When she saves a new currency setting
        Then the balance in the navbar is updated