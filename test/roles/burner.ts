import { Client, Provider, ProviderRegistry } from "@blockstack/clarity"
import { assert } from "chai"
import Accounts from '../accounts'
import TokenHelper from '../../src/TokenHelper'
import { createCheckAndDeploy } from "../setup"

describe("Tokensoft Token Burner role permissions", () => {
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

  it("verify no burners by default", async () => {
    assert.equal(
      await TokenHelper.Roles.hasRole(
        tokensoftTokenClient, 
        TokenHelper.Roles.ROLE_TYPES.BURNER,
        Accounts.alice), 
      'false')
      
    assert.equal(
      await TokenHelper.Roles.hasRole(
        tokensoftTokenClient, 
        TokenHelper.Roles.ROLE_TYPES.BURNER,
        Accounts.bob), 
      'false')    
  })

  it("should allow alice to set bob as burner", async () => {
    // Set it
    await TokenHelper.Roles.addToRole(
      tokensoftTokenClient,
      TokenHelper.Roles.ROLE_TYPES.BURNER,
      Accounts.bob,
      Accounts.alice
    )

    // Verify
    assert.equal(
      await TokenHelper.Roles.hasRole(
        tokensoftTokenClient, 
        TokenHelper.Roles.ROLE_TYPES.BURNER,
        Accounts.bob), 
      'true') 
  })

  it("should not allow carol to set dave as burner", async () => {
    // Try to set it
    try {      
      await TokenHelper.Roles.addToRole(
        tokensoftTokenClient,
        TokenHelper.Roles.ROLE_TYPES.BURNER,
        Accounts.dave,
        Accounts.carol
      )
      assert.fail('should not allow burner update')
    }catch{}
    
    // Verify it actually failed
    assert.equal(
      await TokenHelper.Roles.hasRole(
        tokensoftTokenClient, 
        TokenHelper.Roles.ROLE_TYPES.BURNER,
        Accounts.dave), 
      'false') 
  })

  it("should allow alice to remove bob as burner", async () => {
    // Verify he has the role
    assert.equal(
      await TokenHelper.Roles.hasRole(
        tokensoftTokenClient, 
        TokenHelper.Roles.ROLE_TYPES.BURNER,
        Accounts.bob), 
      'true')

    // Remove it
    await TokenHelper.Roles.removeFromRole(
      tokensoftTokenClient,
      TokenHelper.Roles.ROLE_TYPES.BURNER,
      Accounts.bob,
      Accounts.alice
    )

    // Verify it was removed
    assert.equal(
      await TokenHelper.Roles.hasRole(
        tokensoftTokenClient, 
        TokenHelper.Roles.ROLE_TYPES.BURNER,
        Accounts.bob), 
      'false')
  })

  it("should not allow carol to remove alice as burner", async () => {
    // Set it
    await TokenHelper.Roles.addToRole(
      tokensoftTokenClient,
      TokenHelper.Roles.ROLE_TYPES.BURNER,
      Accounts.alice,
      Accounts.alice
    )
    
    // Verify the current state
    assert.equal(
      await TokenHelper.Roles.hasRole(
        tokensoftTokenClient, 
        TokenHelper.Roles.ROLE_TYPES.BURNER,
        Accounts.alice), 
      'true')

    // Try to remove
    try {
      await TokenHelper.Roles.removeFromRole(
        tokensoftTokenClient,
        TokenHelper.Roles.ROLE_TYPES.BURNER,
        Accounts.alice,
        Accounts.carol
      )
      assert.fail('should not allow burner removal')
    }catch{}
    
    // Verify it wasn't
    assert.equal(
      await TokenHelper.Roles.hasRole(
        tokensoftTokenClient, 
        TokenHelper.Roles.ROLE_TYPES.BURNER,
        Accounts.alice), 
      'true')
  })
  
  it("should allow carol to set dave as burner once she is an owner", async () => {
    await TokenHelper.Roles.addToRole(
      tokensoftTokenClient,
      TokenHelper.Roles.ROLE_TYPES.OWNER,
      Accounts.carol,
      Accounts.alice
    )

    // Try to set it
    await TokenHelper.Roles.addToRole(
      tokensoftTokenClient,
      TokenHelper.Roles.ROLE_TYPES.BURNER,
      Accounts.dave,
      Accounts.carol
    )

    
    // Verify it 
    assert.equal(
      await TokenHelper.Roles.hasRole(
        tokensoftTokenClient, 
        TokenHelper.Roles.ROLE_TYPES.BURNER,
        Accounts.dave), 
      'true') 
  })

  after(async () => {
    await provider.close()
  })
})

