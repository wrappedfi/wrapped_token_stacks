import { Client, Provider, ProviderRegistry, Result } from "@blockstack/clarity"
import { assert } from "chai"
import Accounts from './accounts'
import TokenHelper from '../src/TokenHelper'
import { createCheckAndDeploy } from "./setup"

describe("Tokensoft Token contract test suite", () => {
  let provider: Provider
  let tokensoftTokenClient: Client

  before(async () => {
    provider = await ProviderRegistry.createProvider()
    await createCheckAndDeploy(`${Accounts.alice}.ft-trait`, 'ft-trait', provider)
    await createCheckAndDeploy(`${Accounts.alice}.restricted-token-trait`, 'restricted-token-trait', provider)
    await createCheckAndDeploy(`${Accounts.alice}.metadata-uri-token-trait`, 'metadata-uri-token-trait', provider)
    tokensoftTokenClient = await createCheckAndDeploy(`${Accounts.alice}.tokensoft-token`, "tokensoft-token", provider)    
  })

  it("should initialize", async () => {

    // Non deployer should not be able to call
    try{
      await TokenHelper.Meta.initialize(
        tokensoftTokenClient,
        "Tokensoft Token1",
        "TSFT1",
        8,
        Accounts.alice,
        Accounts.bob
      )
      assert.fail("Non deployer should fail")
    }catch{}

    await TokenHelper.Meta.initialize(
      tokensoftTokenClient,
      "Tokensoft Token",
      "TSFT",
      8,
      Accounts.bob,
      Accounts.alice
    )

    // A second call should fail
    try{
      await TokenHelper.Meta.initialize(
        tokensoftTokenClient,
        "Tokensoft Token2",
        "TSFT2",
        8,
        Accounts.alice,
        Accounts.alice
      )
      assert.fail("Second call should fail")
    }catch{}
  })

  it("should return name", async () => {
    assert.equal(await TokenHelper.Meta.name(tokensoftTokenClient), "Tokensoft Token")
  })

  it("should return symbol", async () => {    
    assert.equal(await TokenHelper.Meta.symbol(tokensoftTokenClient), "TSFT")
  })

  it("should return decimals", async () => {
    assert.equal(await TokenHelper.Meta.decimals(tokensoftTokenClient), 8)
  })

  it("should return 0 supply by default", async () => {
    assert.equal(await TokenHelper.Meta.supply(tokensoftTokenClient), 0)
  })

  it("should have a blank token URI by default", async () => {
    // assert.equal(await TokenHelper.Meta.tokenUri(tokensoftTokenClient), "")
    // Hack as unwrap library is not working correctly
    assert.equal((await TokenHelper.Meta.tokenUri(tokensoftTokenClient)), "(ok u\"\")")
  })

  it("should have set bob as owner", async () => {    
    assert.equal(
      await TokenHelper.Roles.hasRole(
        tokensoftTokenClient, 
        TokenHelper.Roles.ROLE_TYPES.OWNER,
        Accounts.bob), 
      'true')
  })

  after(async () => {
    await provider.close()
  })
})
