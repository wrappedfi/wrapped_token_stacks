# Tokensoft Token on the Stacks Blockchain. 


The token attempts to implement the (currently in progress) SIP 10 standard.
https://github.com/stacksgov/sips/pull/5

This token standard implements the "Standard Trait Definition for Non-Fungible Tokens."  This trait exposes functions for token metadata:

* name
* symbol
* decimals

In addition to metadata, it exposes functions for querying the current total supply of the token and the balance for a specific account:

* balance-of
* total-supply

Finally, it defines the function for transferring tokens:

* transfer

This trait is defined in `ft-trait.clar`.

# Token URI
In addition to the standard metadata provided, an additional parameter has been added:

* token-uri

This parameter mimics the functionality found on the ERC721 standard.  The expectation is that a token owner can set this to reference an external URI that contains extra metadata about the token (such as logos, agreements, or other documentation)

This trait is defined in `metadata-uri-token-trait.clar`.

# Token Restrictions

The following public functions are available similar to ERC1404:
* detect-transfer-restriction
* message-for-transfer-restriction

If any restrictions are put into place that would prevent a transfer from succeeding, the standard `transfer` function would fail with a `u403` error code.  403 was chosen to mimic the `HTTP 403 Forbidden` status.

A wallet should check the `detect-transfer-restriction` function to determine why the transfer was restricted, and then can return a human readable message found by calling `message-for-transfer-restriction` to the user to take corrective actions.

This trait is defined in `restricted-token-trait.clar`.

# Initialization

Each deployed token should have a different name, symbol, etc.  The principal that deploys the contract can call an `initialize` function on the contract to set all initial values.  This function can only be called once and will set the following:

* Token Name
* Token Symbol
* Decimals
* Initial Owner Principal

The reason that these items are set dynamically is that once the contract has been audited, we don't want to accidentally make any changes to the source code that could affect the functionality.  Also, if this contract represents a registered security, it may be necessary that the deployer (e.g. Tokensoft) never holds the ownership role of the contract.

# Role Based Access Control

The token has certain roles built into it to allow administrative actions. One or more principals can be granted each of the roles and a principal can be granted multiple roles.  The following roles are available:

* Owner
* Minter
* Burner
* Revoker
* Blacklister

By default, the account specified in the `initialize` call will be granted the `Owner` role.  The `Owner` role is the only role that can add or remove other accounts from roles.

NOTE!!! If all owners are removed then no other role administration can be performed.  Any time an owner removes themselves, great care must be taken to ensure another owner still exists.  Also, this means that all admin functionality can be irrevocably disabled by removing all roles from all principals.

# Administrative Capabilities

### Minting
A principal with the `Minter` role can mint new tokens to any principal.  The total supply of the token will be increased when new tokens are minted.

### Burning
A principal with the `Burner` role can burn new tokens from any principal.  The total supply of the token will be decreased when existing tokens are burned.

### Revoking
A principal with the `Revoker` role can move tokens from any principal to another principal.

### Blacklisting
A principal with the `Blacklister` role can add or remove any principal to a blacklist.  Any transaction sending tokens `to` OR `from` a blacklisted account will be denied and the transaction will fail.

# Dev
Install dependencies:
```
yarn install
```

## Testing
```
yarn test
```
