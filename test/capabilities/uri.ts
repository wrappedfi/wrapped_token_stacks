import { Client, Provider, ProviderRegistry, Result } from "@blockstack/clarity"
import { assert } from "chai"
import Accounts from '../accounts'
import TokenHelper from '../../src/TokenHelper'

describe("Tokensoft Token URI capability", () => {
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

  it("should allow bob to update the uri one he has been granted the role", async () => {
    assert.equal((await TokenHelper.Meta.tokenUri(tokensoftTokenClient)), "(ok u\"\")")
    
    try {
      await TokenHelper.Meta.setTokenUri(
        tokensoftTokenClient,
        "TOKENSOFT_TOKEN",
        Accounts.bob
      )
      assert.fail('should not allow updating uri')
    }catch{}

    // Set it
    await TokenHelper.Roles.addToRole(
      tokensoftTokenClient,
      TokenHelper.Roles.ROLE_TYPES.OWNER,
      Accounts.bob,
      Accounts.alice
    )

    await TokenHelper.Meta.setTokenUri(
      tokensoftTokenClient,
      "TOKENSOFT_TOKEN",
      Accounts.bob
    )

    // Verify
    assert.equal((await TokenHelper.Meta.tokenUri(tokensoftTokenClient)), "(ok u\"TOKENSOFT_TOKEN\")")

    // Update it again with Alice
    await TokenHelper.Meta.setTokenUri(
      tokensoftTokenClient,
      "POOLE_PARTY_TOKEN",
      Accounts.alice
    )

    assert.equal((await TokenHelper.Meta.tokenUri(tokensoftTokenClient)), "(ok u\"POOLE_PARTY_TOKEN\")")

    // Update it again with Alice
    await TokenHelper.Meta.setTokenUri(
      tokensoftTokenClient,
      "https://www.tokensoft.io/test?param=asdfasdf&param2=1235",
      Accounts.alice
    )

    assert.equal((await TokenHelper.Meta.tokenUri(tokensoftTokenClient)), "(ok u\"https://www.tokensoft.io/test?param=asdfasdf&param2=1235\")")
  })


  after(async () => {
    await provider.close()
  })
})
