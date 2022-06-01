Feature: Delete Wallet

    @deleteWallet
    Scenario: Successfully Delete Wallet from Wallet Details page
        Given Alice is on the wallet details page
        When she attempts to delete the wallet
        And confirms the deletion
        Then the wallet is deleted from her profile

    @deleteWallet-openAndCancel
    Scenario: Open and cancel Delete Wallet modal
        Given Alice is on the wallet details page
        When she attempts to delete the wallet
        But selects cancel on the modal
        Then the modal is no longer displayed

    @deleteWallet-openAndClose
    Scenario: Open and close Delete Wallet modal
        Given Alice is on the wallet details page
        When she attempts to delete the wallet
        But selects close on the modal
        Then the modal is no longer displayed




