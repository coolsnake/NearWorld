import { NearActionEntity, NearBlockEntity, NearTxEntity } from "../types";
import {
  NearTransaction,
  NearBlock,
  NearAction,
  Transfer,
} from "@subql/types-near";


const decode = (str: string):string => Buffer.from(str, 'base64').toString('binary');
const encode = (str: string):string => Buffer.from(str, 'binary').toString('base64');

export async function handleBlock(block: NearBlock): Promise<void> {
  logger.info(`Handling block ${block.header.height}`);

  const blockRecord = NearBlockEntity.create({
    id: block.header.height.toString(),
    hash: block.header.hash,
    author: block.author,
    timestamp: BigInt(block.header.timestamp),
  });

  await blockRecord.save();
}

export async function handleTransaction(
  transaction: NearTransaction
): Promise<void> {
  logger.info(`Handling transaction at ${transaction.block_height}`);

  const transactionRecord = NearTxEntity.create({
    id: `${transaction.block_hash}-${transaction.result.id}`,
    signer: transaction.signer_id,
    receiver: transaction.receiver_id,
  });

  await transactionRecord.save();
}

export async function handleAction(
  //action: NearAction<Transfer>
  action: NearAction
): Promise<void> {
  logger.info(`Handling action at ${action.transaction.block_height}`);
  const strJson = decode(action.action.args);
  logger.info(
      `Handling new handleAction ${action.action.args} ==> ${strJson} at ${action.transaction.block_height}`
    );


  const actionRecord = NearActionEntity.create({
    id: `${action.transaction.result.id}-${action.id}`,
    sender: action.transaction.signer_id,
    receiver: action.transaction.receiver_id,
    amount: BigInt((action.action as Transfer).deposit.toString()),
  });

  await actionRecord.save();
}
