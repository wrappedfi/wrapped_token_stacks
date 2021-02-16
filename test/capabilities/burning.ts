import { Client, Provider, ProviderRegistry, Result } from "@blockstack/clarity"
import { assert } from "chai"
import Accounts from '../accounts'
import TokenHelper from '../../src/TokenHelper'

describe("Tokensoft Token burning capability", () => {
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

  it("should not be able to burn tokens without role or no tokens to burn", async () => {

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
      await TokenHelper.Capabilities.burnTokens(
        tokensoftTokenClient,
        100,
        Accounts.alice,
        Accounts.alice
      )
      assert.fail('should not allow burning without role')
    }catch{}
    
    // Give alice the capability to burn
    await TokenHelper.Roles.addToRole(
      tokensoftTokenClient,
      TokenHelper.Roles.ROLE_TYPES.BURNER,
      Accounts.alice,
      Accounts.alice
    )

    // Burn em
    await TokenHelper.Capabilities.burnTokens(
      tokensoftTokenClient,
      100,
      Accounts.alice,
      Accounts.alice
    )

    // Verify burn
    assert.equal(await TokenHelper.Meta.supply(tokensoftTokenClient), 0)
    assert.equal(await TokenHelper.Meta.balanceOf(tokensoftTokenClient, Accounts.alice), 0)     

    // Should fail since the acct doesn't have any tokens
    try {
      await TokenHelper.Capabilities.burnTokens(
        tokensoftTokenClient,
        100,
        Accounts.alice,
        Accounts.alice
      )
      assert.fail('should not allow burning when no balance')
    }catch{}

  })

  it("should handle multi burns", async () => {

    await TokenHelper.Capabilities.mintTokens(
      tokensoftTokenClient,
      1000,
      Accounts.bob,
      Accounts.alice
    )

    await TokenHelper.Capabilities.mintTokens(
      tokensoftTokenClient,
      200,
      Accounts.carol,
      Accounts.alice
    )

    assert.equal(await TokenHelper.Meta.supply(tokensoftTokenClient), 1200)
    assert.equal(await TokenHelper.Meta.balanceOf(tokensoftTokenClient, Accounts.bob), 1000)   
    assert.equal(await TokenHelper.Meta.balanceOf(tokensoftTokenClient, Accounts.carol), 200)   


    await TokenHelper.Capabilities.burnTokens(
      tokensoftTokenClient,
      100,
      Accounts.bob,
      Accounts.alice
    )

    await TokenHelper.Capabilities.burnTokens(
      tokensoftTokenClient,
      10,
      Accounts.carol,
      Accounts.alice
    )

    await TokenHelper.Capabilities.burnTokens(
      tokensoftTokenClient,
      25,
      Accounts.bob,
      Accounts.alice
    )

    await TokenHelper.Capabilities.burnTokens(
      tokensoftTokenClient,
      100,
      Accounts.carol,
      Accounts.alice
    )

    await TokenHelper.Capabilities.burnTokens(
      tokensoftTokenClient,
      100,
      Accounts.bob,
      Accounts.alice
    )

    assert.equal(await TokenHelper.Meta.supply(tokensoftTokenClient), 865)
    assert.equal(await TokenHelper.Meta.balanceOf(tokensoftTokenClient, Accounts.bob), 775)   
    assert.equal(await TokenHelper.Meta.balanceOf(tokensoftTokenClient, Accounts.carol), 90)   
  })

  after(async () => {
    await provider.close()
  })
})
