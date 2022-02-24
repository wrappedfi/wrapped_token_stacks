<p align="center">
  <a href="https://wrapped.com/">
    <img src="wrapped.png" alt="Wrapped.com" width="600" style="border:none;"/>
  </a>
</p>

# Wrapped Token on the Stacks Blockchain

<!-- row 1 - status -->

[![GitHub contributors](https://img.shields.io/github/contributors/wrappedfi/wrapped_token_stacks)](https://github.com/wrappedfi/wrapped_token_stacks/graphs/contributors)
[![GitHub commit activity](https://img.shields.io/github/commit-activity/w/wrappedfi/wrapped_token_stacks)](https://github.com/wrappedfi/wrapped_token_stacks/graphs/contributors)
[![GitHub Stars](https://img.shields.io/github/stars/wrappedfi/wrapped_token_stacks.svg)](https://github.com/wrappedfi/wrapped_token_stacks/stargazers)
![GitHub repo size](https://img.shields.io/github/repo-size/wrappedfi/wrapped_token_stacks)
[![GitHub](https://img.shields.io/github/license/wrappedfi/wrapped_token_stacks?color=blue)](https://github.com/wrappedfi/wrapped_token_stacks/blob/master/LICENSE)

<!-- row 2 - links & profiles -->

[![Website wrapped.com](https://img.shields.io/website-up-down-green-red/https/wrapped.com.svg)](https://wrapped.com)
[![Blog](https://img.shields.io/badge/blog-up-green)](http://medium.com/wrapped)
[![Docs](https://img.shields.io/badge/docs-up-green)](https://docs.wrapped.com/)
[![Twitter WrappedFi](https://img.shields.io/twitter/follow/wrappedfi?style=social)](https://twitter.com/wrappedfi)

<!-- row 3 - detailed status -->

[![GitHub pull requests by-label](https://img.shields.io/github/issues-pr-raw/wrappedfi/wrapped_token_stacks)](https://github.com/wrappedfi/wrapped_token_stacks/pulls)
[![GitHub Issues](https://img.shields.io/github/issues-raw/wrappedfi/wrapped_token_stacks.svg)](https://github.com/wrappedfi/wrapped_token_stacks/issues)

## Mainnet deployments

### xBTC
[SP3DX3H4FEYZJZ586MFBS25ZW3HZDMEW92260R2PR.Wrapped-Bitcoin](https://explorer.stacks.co/txid/SP3DX3H4FEYZJZ586MFBS25ZW3HZDMEW92260R2PR.Wrapped-Bitcoin?chain=mainnet)

### xUSD
[SP2TZK01NKDC89J6TA56SA47SDF7RTHYEQ79AAB9A.Wrapped-USD](https://explorer.stacks.co/txid/0xfe7848716ba423dfaf664a975771f75763720b0be8a0759a56b2d80a45692ca7?chain=mainnet)

## About

The token implements the [SIP 10 standard](https://github.com/stacksgov/sips/pull/5). It has been reviewed and audited by
[NCC Group](https://research.nccgroup.com) and a copy of the report can be found
[here](https://github.com/wrappedfi/wrapped_token_stacks/blob/main/ncc-security-audit.pdf).

This token standard implements the "Standard Trait Definition for Fungible Tokens."  This trait exposes functions for token metadata:

* get-name
* get-symbol
* get-decimals
* get-token-uri

The `get-token-uri` method mimics the functionality found on the ERC721 standard.  The expectation is that a token owner can set this to reference an external URI that contains extra metadata about the token (such as logos, agreements, or other documentation)

In addition to metadata, it exposes functions for querying the current total supply of the token and the balance for a specific account:

* get-balance
* get-total-supply

Finally, it defines the function for transferring tokens:

* transfer

This trait is defined in `ft-trait.clar`.

## Token Restrictions

The following public functions are available similar to ERC1404:
* detect-transfer-restriction
* message-for-transfer-restriction

If any restrictions are put into place that would prevent a transfer from succeeding, the standard `transfer` function would fail with a `u403` error code.  403 was chosen to mimic the `HTTP 403 Forbidden` status.

A wallet should check the `detect-transfer-restriction` function to determine why the transfer was restricted, and then can return a human readable message found by calling `message-for-transfer-restriction` to the user to take corrective actions.

This trait is defined in `restricted-token-trait.clar`.

## Initialization

Each deployed token should have a different name, symbol, etc.  The principal that deploys the contract can call an `initialize` function on the contract to set all initial values.  This function can only be called once and will set the following:

* Token Name
* Token Symbol
* Decimals
* Initial Owner Principal

The reason that these items are set dynamically is that once the contract has been audited, we don't want to accidentally make any changes to the source code that could affect the functionality.  Also, if this contract represents a registered security, it may be necessary that the deployer (e.g. Wrapped) never holds the ownership role of the contract.

## Role Based Access Control

The token has certain roles built into it to allow administrative actions. One or more principals can be granted each of the roles and a principal can be granted multiple roles.  The following roles are available:

* Owner
* Minter
* Burner
* Revoker
* Blacklister

By default, the account specified in the `initialize` call will be granted the `Owner` role.  The `Owner` role is the only role that can add or remove other accounts from roles.

NOTE!!! If all owners are removed then no other role administration can be performed.  Any time an owner removes themselves, great care must be taken to ensure another owner still exists.  Also, this means that all admin functionality can be irrevocably disabled by removing all roles from all principals.

## Administrative Capabilities

### Minting
A principal with the `Minter` role can mint new tokens to any principal.  The total supply of the token will be increased when new tokens are minted.

### Burning
A principal with the `Burner` role can burn new tokens from any principal.  The total supply of the token will be decreased when existing tokens are burned.

### Revoking
A principal with the `Revoker` role can move tokens from any principal to another principal.

### Blacklisting
A principal with the `Blacklister` role can add or remove any principal to a blacklist.  Any transaction sending tokens `to` OR `from` a blacklisted account will be denied and the transaction will fail.

## Dev
Install dependencies:
```
yarn install
```

## Testing
```
yarn test
```

## Questions? Feedback?

Stop by our [Telegram](https://t.me/wrappedfi) or [send us an
email](mailto:help@wrapped.com).
