import { Client, Provider, ProviderRegistry } from "@blockstack/clarity"
import { assert } from "chai"
import Accounts from '../accounts'
import TokenHelper from '../../src/TokenHelper'
import { createCheckAndDeploy } from "../setup"

describe("Tokensoft Token Blacklister role permissions", () => {
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

  it("verify no blacklisters by default", async () => {
    assert.equal(
      await TokenHelper.Roles.hasRole(
        tokensoftTokenClient, 
        TokenHelper.Roles.ROLE_TYPES.BLACKLISTER,
        Accounts.alice), 
      'false')
      
    assert.equal(
      await TokenHelper.Roles.hasRole(
        tokensoftTokenClient, 
        TokenHelper.Roles.ROLE_TYPES.BLACKLISTER,
        Accounts.bob), 
      'false')    
  })

  it("should allow alice to set bob as blacklister", async () => {
    // Set it
    await TokenHelper.Roles.addToRole(
      tokensoftTokenClient,
      TokenHelper.Roles.ROLE_TYPES.BLACKLISTER,
      Accounts.bob,
      Accounts.alice
    )

    // Verify
    assert.equal(
      await TokenHelper.Roles.hasRole(
        tokensoftTokenClient, 
        TokenHelper.Roles.ROLE_TYPES.BLACKLISTER,
        Accounts.bob), 
      'true') 
  })

  it("should not allow carol to set dave as blacklister", async () => {
    // Try to set it
    try {      
      await TokenHelper.Roles.addToRole(
        tokensoftTokenClient,
        TokenHelper.Roles.ROLE_TYPES.BLACKLISTER,
        Accounts.dave,
        Accounts.carol
      )
      assert.fail('should not allow blacklister update')
    }catch{}
    
    // Verify it actually failed
    assert.equal(
      await TokenHelper.Roles.hasRole(
        tokensoftTokenClient, 
        TokenHelper.Roles.ROLE_TYPES.BLACKLISTER,
        Accounts.dave), 
      'false') 
  })

  it("should allow alice to remove bob as blacklister", async () => {
    // Verify he has the role
    assert.equal(
      await TokenHelper.Roles.hasRole(
        tokensoftTokenClient, 
        TokenHelper.Roles.ROLE_TYPES.BLACKLISTER,
        Accounts.bob), 
      'true')

    // Remove it
    await TokenHelper.Roles.removeFromRole(
      tokensoftTokenClient,
      TokenHelper.Roles.ROLE_TYPES.BLACKLISTER,
      Accounts.bob,
      Accounts.alice
    )

    // Verify it was removed
    assert.equal(
      await TokenHelper.Roles.hasRole(
        tokensoftTokenClient, 
        TokenHelper.Roles.ROLE_TYPES.BLACKLISTER,
        Accounts.bob), 
      'false')
  })

  it("should not allow carol to remove alice as blacklister", async () => {
    // Set it
    await TokenHelper.Roles.addToRole(
      tokensoftTokenClient,
      TokenHelper.Roles.ROLE_TYPES.BLACKLISTER,
      Accounts.alice,
      Accounts.alice
    )
    
    // Verify the current state
    assert.equal(
      await TokenHelper.Roles.hasRole(
        tokensoftTokenClient, 
        TokenHelper.Roles.ROLE_TYPES.BLACKLISTER,
        Accounts.alice), 
      'true')

    // Try to remove
    try {
      await TokenHelper.Roles.removeFromRole(
        tokensoftTokenClient,
        TokenHelper.Roles.ROLE_TYPES.BLACKLISTER,
        Accounts.alice,
        Accounts.carol
      )
      assert.fail('should not allow blacklister removal')
    }catch{}
    
    // Verify it wasn't
    assert.equal(
      await TokenHelper.Roles.hasRole(
        tokensoftTokenClient, 
        TokenHelper.Roles.ROLE_TYPES.BLACKLISTER,
        Accounts.alice), 
      'true')
  })

  it("should allow carol to set dave as blacklister once she is an owner", async () => {
    await TokenHelper.Roles.addToRole(
      tokensoftTokenClient,
      TokenHelper.Roles.ROLE_TYPES.OWNER,
      Accounts.carol,
      Accounts.alice
    )

    // Try to set it
    await TokenHelper.Roles.addToRole(
      tokensoftTokenClient,
      TokenHelper.Roles.ROLE_TYPES.BLACKLISTER,
      Accounts.dave,
      Accounts.carol
    )

    
    // Verify it 
    assert.equal(
      await TokenHelper.Roles.hasRole(
        tokensoftTokenClient, 
        TokenHelper.Roles.ROLE_TYPES.BLACKLISTER,
        Accounts.dave), 
      'true') 
  })

  after(async () => {
    await provider.close()
  })
})

