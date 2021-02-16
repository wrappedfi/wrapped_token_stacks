import { Client, Provider, ProviderRegistry } from "@blockstack/clarity"
import { assert } from "chai"
import Accounts from '../accounts'
import TokenHelper from '../../src/TokenHelper'
import { createCheckAndDeploy } from "../setup"

describe("Tokensoft Token URI capability", () => {
  let provider: Provider
  let tokensoftTokenClient: Client

  before(async () => {
    provider = await ProviderRegistry.createProvider()
    await createCheckAndDeploy(`${Accounts.alice}.ft-trait`, 'ft-trait', provider)
    await createCheckAndDeploy(`${Accounts.alice}.restricted-token-trait`, 'restricted-token-trait', provider)
    await createCheckAndDeploy(`${Accounts.alice}.metadata-uri-token-trait`, 'metadata-uri-token-trait', provider)
    tokensoftTokenClient = await createCheckAndDeploy(`${Accounts.alice}.tokensoft-token`, "tokensoft-token", provider)
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
