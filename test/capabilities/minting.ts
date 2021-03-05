import { Client, Provider, ProviderRegistry } from "@blockstack/clarity"
import { assert } from "chai"
import Accounts from '../accounts'
import TokenHelper from '../../src/TokenHelper'
import { createCheckAndDeploy } from "../setup"

describe("Tokensoft Token minting capability", () => {
  let provider: Provider
  let tokensoftTokenClient: Client

  before(async () => {
    provider = await ProviderRegistry.createProvider()
    await createCheckAndDeploy(`${Accounts.alice}.ft-trait`, 'ft-trait', provider)
    await createCheckAndDeploy(`${Accounts.alice}.restricted-token-trait`, 'restricted-token-trait', provider)
    tokensoftTokenClient = await createCheckAndDeploy(`${Accounts.alice}.tokensoft-token`, "tokensoft-token", provider)
    await TokenHelper.Meta.initialize(
      tokensoftTokenClient,
      "Tokensoft Token",
      "TSFT",
      8,
      Accounts.alice,
      Accounts.alice
    )
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
