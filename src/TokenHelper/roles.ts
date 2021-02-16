import { Client, Result } from '@blockstack/clarity';

const ROLE_TYPES = {
  OWNER : 0,
  MINTER : 1,
  BURNER: 2,
  REVOKER: 3,
  BLACKLISTER: 4
}

/**
 * Gets the status of the address - true if they are an owner
 * @param client - token client instance
 */
const hasRole = async (
  client: Client, 
  role: number, 
  address: string) => {

  const query = client.createQuery({
    method: {
      name: 'has-role',
      args: [`u${role}`, `'${address}`],
    }
  })

  const receipt = await client.submitQuery(query);
  return Result.unwrap(receipt)
}

/**
 * Adds a principal to a role
 * @param client 
 * @param role 
 * @param accountToAdd 
 * @param sender 
 */
const addToRole = async (
  client: Client,
  role: number, 
  accountToAdd: string,
  sender: string
): Promise<boolean> => {
  
  const tx = client.createTransaction({
    method: {
      name: 'add-principal-to-role',
      args: [`u${role}`, `'${accountToAdd}`],
    },
  });
  await tx.sign(sender);
  const receipt = await client.submitTransaction(tx);
  if (receipt.success) {
    return true
  }
  
  throw new Error(`add-role failed`);
}

/**
 * Removes a principal from a role
 * @param client 
 * @param role 
 * @param accountToRemove 
 * @param sender 
 */
const removeFromRole = async (
  client: Client,
  role: number, 
  accountToRemove: string,
  sender: string
): Promise<boolean> => {
  
  const tx = client.createTransaction({
    method: {
      name: 'remove-principal-from-role',
      args: [`u${role}`, `'${accountToRemove}`],
    },
  });
  await tx.sign(sender);
  const receipt = await client.submitTransaction(tx);
  if (receipt.success) {
    return true
  }
  
  throw new Error(`remove-role failed`);
}

export default {
  ROLE_TYPES,
  hasRole,
  addToRole,
  removeFromRole
}

