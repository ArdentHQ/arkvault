Feature: Delegate Registration Transaction

    @delegateRegistration
    Scenario: Successfully send delegate registration transaction
        Given Alice has navigated to the delegate registration form for a wallet
        When she enters valid delegate name
        And sends the delegate registration transaction
        Then the transaction is sent successfully

    @delegateRegistration-invalidName
    Scenario: Fail to register delegate due to invalid name
        Given Alice has navigated to the delegate registration form for a wallet
        When she enters an invalid delegate name
        Then an error is displayed on the name field
        And the continue button is disabled

    @delegateRegistration-nameLength
    Scenario: Fail to register delegate due to invalid name length
        Given Alice has navigated to the delegate registration form for a wallet
        When she enters a delegate name that exceeds the character limit
        Then an error is displayed on the name field
        And the continue button is disabled





