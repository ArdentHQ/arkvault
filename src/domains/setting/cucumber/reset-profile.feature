Feature: Reset Profile

    @resetProfile
    Scenario: Successfully reset profile
        Given Alice is on the Settings page
        And has made changes to her settings
        When she resets her profile
        And confirms the reset
        Then all settings are reset to default