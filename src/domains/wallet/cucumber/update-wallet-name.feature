Feature: Update Wallet Name

    @updateWalletName
    Scenario: Successfully Update Wallet Name
        Given Alice is on the wallet details page
        And selects to update wallet name
        When she enters a valid wallet name
        And saves the updated name
        Then the wallet name is updated

    @updateWalletName-openAndCancel
    Scenario: Open and cancel the Update Wallet Name modal
        Given Alice is on the wallet details page
        And selects to update wallet name
        When she selects cancel on the update name modal
        Then the update name modal is no longer displayed

    @updateWalletName-openAndClose
    Scenario: Open and close the Update Wallet Name modal
        Given Alice is on the wallet details page
        And selects to update wallet name
        When she selects close on the update name modal
        Then the update name modal is no longer displayed
    
    @updateWalletName-invalidNameLength
    Scenario: Fail to update Wallet Name due to name exceeding 42 characters
        Given Alice is on the wallet details page
        And selects to update wallet name
        When she enters a name that exceeds 42 characters
        Then an error is displayed on the name field
        And the update name save button is disabled 

     @updateWalletName-whiteSpaceName
     Scenario: Fail to update Wallet Name due to only white space used
        Given Alice is on the wallet details page
        And selects to update wallet name
        When she enters a name that just contains white space
        Then an error is displayed on the name field
        And the update name save button is disabled 




