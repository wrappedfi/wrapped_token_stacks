import { Client, Result } from '@blockstack/clarity';

const TRANSFER_RESTRICTIONS = {
  SUCCESS: {
    errorCode: 0,
    message: '(ok u"No Restriction Detected")'
  },
  BLACKLIST: {
    errorCode: 1,
    message: '(ok u"Sender or recipient is on the blacklist and prevented from transacting")'
  },
  UNKNOWN: {
    errorCode: null,
    message: '(ok u"Unknown Error Code")'
  }
}


/**
 * Transfers tokens from one account to another
 * @param client 
 * @param amount 
 * @param from 
 * @param to 
 * @param sender 
 */
const transfer = async (
  client: Client,
  amount: number, 
  from: string,
  to: string,
  sender: string
): Promise<boolean> => {
  
  const tx = client.createTransaction({
    method: {
      name: 'transfer',
      args: [`u${amount}`, `'${from}`, `'${to}`],
    },
  });
  await tx.sign(sender);
  const receipt = await client.submitTransaction(tx);
  if (receipt.success) {
    return true
  }
  
  throw new Error(`transfer failed`);
}

/**
 * Mints tokens to the specified account
 * @param client 
 * @param amount - base units
 * @param mintTo 
 * @param sender 
 */
const mintTokens = async (
  client: Client,
  amount: number, 
  mintTo: string,
  sender: string
): Promise<boolean> => {
  
  const tx = client.createTransaction({
    method: {
      name: 'mint-tokens',
      args: [`u${amount}`, `'${mintTo}`],
    },
  });
  await tx.sign(sender);
  const receipt = await client.submitTransaction(tx);
  if (receipt.success) {
    return true
  }
  
  throw new Error(`mint failed`);
}

/**
 * Burns tokens from a principal's account and reduces the total supply
 * @param client 
 * @param amount - amount to burn in base units
 * @param burnFrom - account to burn from
 * @param sender 
 */
const burnTokens = async (
  client: Client,
  amount: number, 
  burnFrom: string,
  sender: string
): Promise<boolean> => {
  
  const tx = client.createTransaction({
    method: {
      name: 'burn-tokens',
      args: [`u${amount}`, `'${burnFrom}`],
    },
  });
  await tx.sign(sender);
  const receipt = await client.submitTransaction(tx);
  if (receipt.success) {
    return true
  }
  
  throw new Error(`burn failed`);
}

/**
 * Revokes tokens from one account to another account
 * @param client 
 * @param amount - amount in base units
 * @param revokeFrom 
 * @param revokeTo 
 * @param sender 
 */
const revokeTokens = async (
  client: Client,
  amount: number, 
  revokeFrom: string,
  revokeTo: string,
  sender: string
): Promise<boolean> => {
  
  const tx = client.createTransaction({
    method: {
      name: 'revoke-tokens',
      args: [`u${amount}`, `'${revokeFrom}`, `'${revokeTo}`],
    },
  });
  await tx.sign(sender);
  const receipt = await client.submitTransaction(tx);
  if (receipt.success) {
    return true
  }
  
  throw new Error(`burn failed`);
}

const isBlacklisted = async (client: Client, principal: string) => {
  const query = client.createQuery({ method: { name: "is-blacklisted", args: [`'${principal}`] } })
  const receipt = await client.submitQuery(query);
  return Result.unwrap(receipt)
}

/**
 * Updates the status of a principal on the blacklist
 * @param client 
 * @param accountToUpdate 
 * @param isBlacklisted 
 * @param sender 
 */
const updateBlacklist = async (
  client: Client,
  accountToUpdate: string,
  isBlacklisted: boolean,
  sender: string
): Promise<boolean> => {
  
  const tx = client.createTransaction({
    method: {
      name: 'update-blacklisted',
      args: [`'${accountToUpdate}`, `${isBlacklisted}`],
    },
  });
  await tx.sign(sender);
  const receipt = await client.submitTransaction(tx);
  if (receipt.success) {
    return true
  }
  
  throw new Error(`update blacklist failed`);
}

/**
 * Checks is there is a restriction on the proposed transfer
 * @param client 
 * @param amount 
 * @param sender 
 * @param recipient 
 */
const detectTransferRestriction = async (client: Client, amount: number, sender: string, recipient: string) => {
  const query = client.createQuery({ 
    method: { 
      name: "detect-transfer-restriction", 
      args: [`u${amount}`, `'${sender}`, `'${recipient}`] 
    } 
  })

  const receipt = await client.submitQuery(query);
  return Result.unwrapUInt(receipt)
}

/**
 * Gets a human readable string for a transfer restriction code returned from 'detect-transfer-restriction'
 * @param client 
 * @param errorCode 
 */
const messageForRestriction = async (client: Client, errorCode: number) => {
  const query = client.createQuery({ 
    method: { 
      name: "message-for-restriction", 
      args: [`u${errorCode}`] 
    } 
  })

  const receipt = await client.submitQuery(query);
  return Result.unwrap(receipt)
}

export default {
  transfer,
  mintTokens,
  burnTokens,
  revokeTokens,
  isBlacklisted,
  updateBlacklist,
  detectTransferRestriction,
  messageForRestriction,
  TRANSFER_RESTRICTIONS
}

