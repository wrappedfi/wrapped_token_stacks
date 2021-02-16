import { Client, Provider } from "@blockstack/clarity"

export const createCheckAndDeploy = async (name: string, filePath: string, provider: Provider): Promise<Client> => {
  const client = new Client(name, filePath, provider)    
  await client.checkContract()
  await client.deployContract()
  return client
}