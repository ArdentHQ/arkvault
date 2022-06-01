Feature: Single Transfer Multisig

    @singleTransfer-multisig
    Scenario: Successfully create transaction with multisig wallet
        Given Alice is on the transaction form for a multisig wallet
        When she completes the single transfer process with a multisig wallet
        Then the transaction is successfully created
