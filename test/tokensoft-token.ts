import { Client, Provider, ProviderRegistry, Result } from "@blockstack/clarity";
import { assert } from "chai";

describe("Tokensoft Token contract test suite", () => {
  let tokensoftTokenClient: Client;
  let provider: Provider;

  before(async () => {
    provider = await ProviderRegistry.createProvider();
    tokensoftTokenClient = new Client("SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB.tokensoft-token", "tokensoft-token", provider);
  });

  it("should have a valid syntax", async () => {
    await tokensoftTokenClient.checkContract();
  });

  describe("deploying an instance of the contract", () => {
    before(async () => {
      await tokensoftTokenClient.deployContract();
    });

    it("should return name", async () => {
      const query = tokensoftTokenClient.createQuery({ method: { name: "name", args: [] } });
      const receipt = await tokensoftTokenClient.submitQuery(query);
      const result = Result.unwrapString(receipt, "utf8");
      assert.equal(result, "tokensoft-token");
    });
  });

  after(async () => {
    await provider.close();
  });
});
