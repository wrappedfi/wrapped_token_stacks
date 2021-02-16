import { Client, Provider, ProviderRegistry, Result } from "@blockstack/clarity"
import { assert } from "chai"
import Accounts from './accounts'
import TokenHelper from '../src/TokenHelper'

describe("Tokensoft Token contract test suite", () => {
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
