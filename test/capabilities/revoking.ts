import { Client, Provider, ProviderRegistry, Result } from "@blockstack/clarity"
import { assert } from "chai"
import Accounts from '../accounts'
import TokenHelper from '../../src/TokenHelper'

describe("Tokensoft Token revoking capability", () => {
  let traitClient: Client
  let tokensoftTokenClient: Client
  let provider: Provider

  before(async () => {
    provider = await ProviderRegistry.createProvider()
    traitClient = new Client(`${Accounts.alice}.ft-trait`, 'ft-trait', provider)    
    tokensoftTokenClient = new Client(`${Accounts.alice}.tokensoft-token`, "tokensoft-token", provider)
  })

  it("should have a valid syntax and deploy", async () => {
    await traitClient.checkContract()
    await traitClient.deployContract()

    await tokensoftTokenClient.checkContract()
    await tokensoftTokenClient.deployContract()
  })

  it("should not be able to revoke tokens without role or no tokens to burn", async () => {

    // Allow Alice to mint
    await TokenHelper.Roles.addToRole(
      tokensoftTokenClient,
      TokenHelper.Roles.ROLE_TYPES.MINTER,
      Accounts.alice,
      Accounts.alice
    )

    // Mint some tokens
    await TokenHelper.Capabilities.mintTokens(
      tokensoftTokenClient,
      100,
      Accounts.alice,
      Accounts.alice
    )

    // Tokens were minted
    assert.equal(await TokenHelper.Meta.supply(tokensoftTokenClient), 100)
    assert.equal(await TokenHelper.Meta.balanceOf(tokensoftTokenClient, Accounts.alice), 100)      

    try {
      await TokenHelper.Capabilities.revokeTokens(
        tokensoftTokenClient,
        100,
        Accounts.alice,
        Accounts.bob,
        Accounts.alice
      )
      assert.fail('should not allow revoking without role')
    }catch{}
    
    // Give alice the capability to burn
    await TokenHelper.Roles.addToRole(
      tokensoftTokenClient,
      TokenHelper.Roles.ROLE_TYPES.REVOKER,
      Accounts.alice,
      Accounts.alice
    )

    // Burn em
    await TokenHelper.Capabilities.revokeTokens(
      tokensoftTokenClient,
      100,
      Accounts.alice,
      Accounts.bob,
      Accounts.alice
    )

    // Verify revoke
    assert.equal(await TokenHelper.Meta.supply(tokensoftTokenClient), 100)
    assert.equal(await TokenHelper.Meta.balanceOf(tokensoftTokenClient, Accounts.alice), 0)     
    assert.equal(await TokenHelper.Meta.balanceOf(tokensoftTokenClient, Accounts.bob), 100)     

    // Should fail since the acct doesn't have any tokens
    try {
      await TokenHelper.Capabilities.revokeTokens(
        tokensoftTokenClient,
        100,
        Accounts.alice,
        Accounts.bob,
        Accounts.alice
      )
      assert.fail('should not allow burning when no balance')
    }catch{}

  })

  it("revoke scenarios", async () => {

    await TokenHelper.Capabilities.mintTokens(
      tokensoftTokenClient,
      100,
      Accounts.alice,
      Accounts.alice
    )
    await TokenHelper.Capabilities.mintTokens(
      tokensoftTokenClient,
      100,
      Accounts.carol,
      Accounts.alice
    )

    // All accounts should have 100
    assert.equal(await TokenHelper.Meta.supply(tokensoftTokenClient), 300)
    assert.equal(await TokenHelper.Meta.balanceOf(tokensoftTokenClient, Accounts.alice), 100)
    assert.equal(await TokenHelper.Meta.balanceOf(tokensoftTokenClient, Accounts.bob), 100)
    assert.equal(await TokenHelper.Meta.balanceOf(tokensoftTokenClient, Accounts.carol), 100)

    // Do a loop and end up back where we started
    await TokenHelper.Capabilities.revokeTokens(
      tokensoftTokenClient,
      20,
      Accounts.alice,
      Accounts.bob,
      Accounts.alice
    )

    await TokenHelper.Capabilities.revokeTokens(
      tokensoftTokenClient,
      20,
      Accounts.bob,
      Accounts.carol,
      Accounts.alice
    )

    await TokenHelper.Capabilities.revokeTokens(
      tokensoftTokenClient,
      20,
      Accounts.carol,
      Accounts.alice,
      Accounts.alice
    )

    assert.equal(await TokenHelper.Meta.supply(tokensoftTokenClient), 300)
    assert.equal(await TokenHelper.Meta.balanceOf(tokensoftTokenClient, Accounts.alice), 100)
    assert.equal(await TokenHelper.Meta.balanceOf(tokensoftTokenClient, Accounts.bob), 100)
    assert.equal(await TokenHelper.Meta.balanceOf(tokensoftTokenClient, Accounts.carol), 100)

    // Do multiple revokes against the same acct
    await TokenHelper.Capabilities.revokeTokens(
      tokensoftTokenClient,
      20,
      Accounts.bob,
      Accounts.carol,
      Accounts.alice
    )

    await TokenHelper.Capabilities.revokeTokens(
      tokensoftTokenClient,
      20,
      Accounts.bob,
      Accounts.carol,
      Accounts.alice
    )

    await TokenHelper.Capabilities.revokeTokens(
      tokensoftTokenClient,
      20,
      Accounts.bob,
      Accounts.carol,
      Accounts.alice
    )

    assert.equal(await TokenHelper.Meta.supply(tokensoftTokenClient), 300)
    assert.equal(await TokenHelper.Meta.balanceOf(tokensoftTokenClient, Accounts.alice), 100)
    assert.equal(await TokenHelper.Meta.balanceOf(tokensoftTokenClient, Accounts.bob), 40)
    assert.equal(await TokenHelper.Meta.balanceOf(tokensoftTokenClient, Accounts.carol), 160)
  })


  after(async () => {
    await provider.close()
  })
})
