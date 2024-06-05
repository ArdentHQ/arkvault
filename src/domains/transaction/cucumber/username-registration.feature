Feature: Username Registration Transaction

    @usernameRegistration
    Scenario: Successfully send username registration transaction
        Given Alice has navigated to the username registration form for a wallet
        When she enters valid username
        And sends the username registration transaction
        Then the transaction is sent successfully

    @usernameRegistration-invalidName
    Scenario: Fail to register username due to invalid name
        Given Alice has navigated to the username registration form for a wallet
        When she enters an invalid username
        Then an error is displayed on the name field
        And the continue button is disabled

    @usernameRegistration-occupied
    Scenario: Fail to register username due to occupied username
        Given Alice has navigated to the username registration form for a wallet
        When she enters an occupied username
        Then an error is displayed on the name field
        And the continue button is disabled





