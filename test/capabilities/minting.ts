import { Client, Provider, ProviderRegistry, Result } from "@blockstack/clarity"
import { assert } from "chai"
import Accounts from '../accounts'
import TokenHelper from '../../src/TokenHelper'

describe("Tokensoft Token minting capability", () => {
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

  it("should allow bob mint once he has been granted the role", async () => {
    // Alice starts out with 0 tokens
    assert.equal(await TokenHelper.Meta.balanceOf(tokensoftTokenClient, Accounts.alice), 0)    

    try {
      await TokenHelper.Capabilities.mintTokens(
        tokensoftTokenClient,
        1000,
        Accounts.alice,
        Accounts.bob
      )
      assert.fail('should not allow minting')
    }catch{}

    // Set it
    await TokenHelper.Roles.addToRole(
      tokensoftTokenClient,
      TokenHelper.Roles.ROLE_TYPES.MINTER,
      Accounts.bob,
      Accounts.alice
    )

    await TokenHelper.Capabilities.mintTokens(
      tokensoftTokenClient,
      100,
      Accounts.alice,
      Accounts.bob
    )

    // Verify total supply and alice's balance
    assert.equal(await TokenHelper.Meta.supply(tokensoftTokenClient), 100)
    assert.equal(await TokenHelper.Meta.balanceOf(tokensoftTokenClient, Accounts.alice), 100)         
  })

  it("should handle multiple mintings to multiple addresses", async () => {

    await TokenHelper.Capabilities.mintTokens(
      tokensoftTokenClient,
      100,
      Accounts.bob,
      Accounts.bob
    )

    await TokenHelper.Capabilities.mintTokens(
      tokensoftTokenClient,
      100,
      Accounts.bob,
      Accounts.bob
    )

    await TokenHelper.Capabilities.mintTokens(
      tokensoftTokenClient,
      50,
      Accounts.alice,
      Accounts.bob
    )

    await TokenHelper.Capabilities.mintTokens(
      tokensoftTokenClient,
      100,
      Accounts.bob,
      Accounts.bob
    )

    await TokenHelper.Capabilities.mintTokens(
      tokensoftTokenClient,
      100,
      Accounts.bob,
      Accounts.bob
    )

    await TokenHelper.Capabilities.mintTokens(
      tokensoftTokenClient,
      50,
      Accounts.alice,
      Accounts.bob
    )

    // Alice starts with 100
    assert.equal(await TokenHelper.Meta.supply(tokensoftTokenClient), 600)
    assert.equal(await TokenHelper.Meta.balanceOf(tokensoftTokenClient, Accounts.alice), 200)
    assert.equal(await TokenHelper.Meta.balanceOf(tokensoftTokenClient, Accounts.bob), 400)         
  })


  after(async () => {
    await provider.close()
  })
})
