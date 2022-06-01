Feature: Navigate to profile settings from Welcome Screen

    @navigateProfileSettings-noPassword
    Scenario: Navigate to profile settings from welcome screen
        Given Alice is on the welcome screen
        When she selects Settings on a profile card
        Then she is navigated to the settings page for that profile
