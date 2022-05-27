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
        Then she is on the select crypto asset page

    @transactionRouting-reloadTransfer
    Scenario: Reload transfer page when navbar button is clicked
        Given Alice is on a wallet details page
        When she navigates to the transfer page via the send button
        Then she is on the transfer page
        When she navigates to the transfer page via the navbar
        Then she is on the select crypto asset page

    @transactionRouting-delegateResignation
    Scenario: Navigate to Delegate Resignation page
        Given Alice is on a wallet details page for a delegate wallet
        When she navigates to the delegate resignation page
        Then she is on the delegate resignation page
