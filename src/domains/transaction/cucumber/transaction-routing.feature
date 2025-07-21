Feature: Transaction Routing

    @transactionRouting-transferPage
    Scenario: Navigate to Transfer page via wallet details
        Given Alice is on a wallet details page
        When she navigates to the transfer page via the send button
        Then she is on the transfer page

    @transactionRouting-transferPageNavbar
    Scenario: Navigate to Transfer page via navbar
        Given Alice is on a wallet details page
        When she navigates to the transfer page via the navbar

    @transactionRouting-reloadTransfer
    Scenario: Reload transfer page when navbar button is clicked
        Given Alice is on a wallet details page
        When she navigates to the transfer page via the send button
        Then she is on the transfer page
        When she navigates to the transfer page via the navbar

    @transactionRouting-validatorResignation
    Scenario: Navigate to Validator Resignation page
        Given Alice is on a wallet details page for a validator wallet
        When she navigates to the validator resignation page
        Then she is on the validator resignation page
