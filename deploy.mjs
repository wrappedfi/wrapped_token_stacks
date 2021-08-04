import { makeContractDeploy, broadcastTransaction, AnchorMode } from '@stacks/transactions';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import BigNum from 'bignum';
import fs from 'fs'


const txOptions = {
  contractName: 'xbtc_testnet',
  codeBody: fs.readFileSync('./contracts/tokensoft-token.clar').toString(),
  senderKey: '0f952a2fa6e11376a29df3d00de5658a1f53633614da60ab14c7f87dfe40b3fb01',
  network: new StacksTestnet(), // for mainnet, use `StacksMainnet()`
};

const transaction = await makeContractDeploy(txOptions);
broadcastTransaction(transaction, txOptions.network);
console.log(transaction)