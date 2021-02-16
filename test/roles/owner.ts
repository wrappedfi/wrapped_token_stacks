import { Client, Provider, ProviderRegistry, Result } from "@blockstack/clarity"
import { assert } from "chai"
import Accounts from '../accounts'
import TokenHelper from '../../src/TokenHelper'

describe("Tokensoft Token Owner role permissions", () => {
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

  it("should set alice to owner by default", async () => {
    // Alice should be owner
    assert.equal(
      await TokenHelper.Roles.hasRole(
        tokensoftTokenClient, 
        TokenHelper.Roles.ROLE_TYPES.OWNER,
        Accounts.alice), 
      'true')

    // Bob should not be an owner
    assert.equal(
      await TokenHelper.Roles.hasRole(
        tokensoftTokenClient, 
        TokenHelper.Roles.ROLE_TYPES.OWNER,
        Accounts.bob), 
      'false')    
  })

  it("should allow alice to set bob as owner", async () => {
    // Set it
    await TokenHelper.Roles.addToRole(
      tokensoftTokenClient,
      TokenHelper.Roles.ROLE_TYPES.OWNER,
      Accounts.bob,
      Accounts.alice
    )

    // Verify
    assert.equal(
      await TokenHelper.Roles.hasRole(
        tokensoftTokenClient, 
        TokenHelper.Roles.ROLE_TYPES.OWNER,
        Accounts.bob), 
      'true') 
  })

  it("should not allow carol to set dave as owner", async () => {
    // Try to set it
    try {      
      await TokenHelper.Roles.addToRole(
        tokensoftTokenClient,
        TokenHelper.Roles.ROLE_TYPES.OWNER,
        Accounts.dave,
        Accounts.carol
      )
      assert.fail('should not allow owner update')
    }catch{}
    
    // Verify it actually failed
    assert.equal(
      await TokenHelper.Roles.hasRole(
        tokensoftTokenClient, 
        TokenHelper.Roles.ROLE_TYPES.OWNER,
        Accounts.dave), 
      'false') 
  })

  it("should allow alice to remove bob as owner", async () => {
    // Verify he has the role
    assert.equal(
      await TokenHelper.Roles.hasRole(
        tokensoftTokenClient, 
        TokenHelper.Roles.ROLE_TYPES.OWNER,
        Accounts.bob), 
      'true')

    // Remove it
    await TokenHelper.Roles.removeFromRole(
      tokensoftTokenClient,
      TokenHelper.Roles.ROLE_TYPES.OWNER,
      Accounts.bob,
      Accounts.alice
    )

    // Verify it was removed
    assert.equal(
      await TokenHelper.Roles.hasRole(
        tokensoftTokenClient, 
        TokenHelper.Roles.ROLE_TYPES.OWNER,
        Accounts.bob), 
      'false')
  })

  it("should not allow carol to remove alice as owner", async () => {
    // Verify the current state
    assert.equal(
      await TokenHelper.Roles.hasRole(
        tokensoftTokenClient, 
        TokenHelper.Roles.ROLE_TYPES.OWNER,
        Accounts.alice), 
      'true')

    // Try to remove
    try {
      await TokenHelper.Roles.removeFromRole(
        tokensoftTokenClient,
        TokenHelper.Roles.ROLE_TYPES.OWNER,
        Accounts.alice,
        Accounts.carol
      )
      assert.fail('should not allow owner removal')
    }catch{}
    
    // Verify it wasn't
    assert.equal(
      await TokenHelper.Roles.hasRole(
        tokensoftTokenClient, 
        TokenHelper.Roles.ROLE_TYPES.OWNER,
        Accounts.alice), 
      'true')
  })

  after(async () => {
    await provider.close()
  })
})

