import { Client, Result } from '@blockstack/clarity';

/**
 * Gets the name of the token
 * @param client - token client instance
 */
const name = async (client: Client) => {

  const query = client.createQuery({
    method: {
      name: 'name',
      args: [],
    }
  })

  const receipt = await client.submitQuery(query);
  return Result.unwrapString(receipt, "utf8")
}

/**
 * Gets the symbol of the token
 * @param client 
 */
const symbol = async (client: Client) => {
  const query = client.createQuery({ method: { name: "symbol", args: [] } })
  const receipt = await client.submitQuery(query)
  return Result.unwrapString(receipt, "utf8")
}

/**
 * Gets the number of decimals of the token
 * @param client 
 */
const decimals = async (client: Client) => {
  const query = client.createQuery({ method: { name: "decimals", args: [] } })
  const receipt = await client.submitQuery(query)
  return Result.unwrapUInt(receipt)
}

/**
 * Gets the current supply of tokens in base units
 * @param client 
 */
const supply = async (client: Client) => {
  const query = client.createQuery({ method: { name: "total-supply", args: [] } })
  const receipt = await client.submitQuery(query)
  return Result.unwrapUInt(receipt)
}

/**
 * Queries the balance of a specified acct.
 * @param client 
 * @param principal 
 * @returns - amount in base units
 */
const balanceOf = async (client: Client, principal: string) => {
  const query = client.createQuery({ method: { name: "balance-of", args: [`'${principal}`] } })
  const receipt = await client.submitQuery(query)
  return Result.unwrapUInt(receipt)
}

const tokenUri = async (client: Client) => {
  const query = client.createQuery({ method: { name: "token-uri", args: [] } })
  const receipt = await client.submitQuery(query)
  return receipt.result
}

const initialize = async (client: Client, name: string, symbol: string, decimals: number, owner: string, sender: string) => {
  const tx = client.createTransaction({
    method: {
      name: 'initialize',
      args: [
        `\"${name}\"`,
        `\"${symbol}\"`,
        `u${decimals}`,
        `'${owner}`],
    },
  });
  await tx.sign(sender);
  const receipt = await client.submitTransaction(tx);
  if (receipt.success) {
    return true
  }
  
  throw new Error(`initialize failed ${JSON.stringify(receipt, null, 2)}`);
}

const setTokenUri = async (client: Client, uri: string, sender: string) => {
  const tx = client.createTransaction({
    method: {
      name: 'set-token-uri',
      args: [`u\"${uri}\"`],
    },
  });
  await tx.sign(sender);
  const receipt = await client.submitTransaction(tx);
  if (receipt.success) {
    return true
  }
  
  throw new Error(`set uri failed`);
}

export default {
  initialize,
  name,
  symbol,
  decimals,
  supply,
  balanceOf,
  tokenUri,
  setTokenUri
}

