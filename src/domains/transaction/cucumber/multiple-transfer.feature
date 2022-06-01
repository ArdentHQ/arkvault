Feature: Multipay Transaction

    @multipayTransaction
    Scenario: Successfully send Multipay transaction
        Given Alice is signed into a profile with an imported wallet
        And has navigated to the transfer page
        When she attempts to send a multipay transaction with a valid mnemonic
        Then the transaction is sent successfully

    @multipayTransaction-invalidMnemonic
    Scenario: Fail to send multipay due to invalid mnemonic
        Given Alice is signed into a profile with an imported wallet
        And has navigated to the transfer page
        When she attempts to send a multipay transaction with an invalid mnemonic
        Then an error is displayed on the mnemonic field
        And the send button is disabled

    @multipayTransaction-notClearValues
    Scenario: Do not clear multipay transaction details when returning a step
        Given Alice is signed into a profile with an imported wallet
        And has navigated to the transfer page
        When she enters multipay details in the transaction form
        And navigates to page 2
        And navigates back to page 1
        Then all added transaction details should remain

    @multipayTransaction-singleField
    Scenario: Should not able go to next step without recipient after fill single fields
        Given Alice is signed into a profile with an imported wallet
        And has navigated to the transfer page
        When she enters details into the single transaction form
        And selects the multiple toggle
        Then the add recipient button needs be selected to advance to the next page