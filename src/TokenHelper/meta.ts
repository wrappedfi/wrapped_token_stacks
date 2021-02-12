import { Client, Provider, Result, Receipt } from '@blockstack/clarity';

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

export default {
  name,
  symbol,
  decimals,
  supply
}

