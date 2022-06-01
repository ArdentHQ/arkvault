Feature: Settings Routing

@settingsRouting
Scenario: Navigate to the Settings page
Given Alice is signed into a profile
When she selects settings via navbar menu
Then she is navigated to the Settings page
