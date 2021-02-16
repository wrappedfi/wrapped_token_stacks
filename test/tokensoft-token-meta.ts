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

  after(async () => {
    await provider.close()
  })
})
