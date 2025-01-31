import { Inject, Injectable } from '@nestjs/common';
import { IBalancesRepository } from '@/domain/balances/balances.repository.interface';
import { IChainsRepository } from '@/domain/chains/chains.repository.interface';
import { ICollectiblesRepository } from '@/domain/collectibles/collectibles.repository.interface';
import { IMessagesRepository } from '@/domain/messages/messages.repository.interface';
import { ISafeAppsRepository } from '@/domain/safe-apps/safe-apps.repository.interface';
import { ISafeRepository } from '@/domain/safe/safe.repository.interface';
import { ChainUpdate } from '@/routes/cache-hooks/entities/chain-update.entity';
import { EventType } from '@/routes/cache-hooks/entities/event-payload.entity';
import { ExecutedTransaction } from '@/routes/cache-hooks/entities/executed-transaction.entity';
import { IncomingEther } from '@/routes/cache-hooks/entities/incoming-ether.entity';
import { IncomingToken } from '@/routes/cache-hooks/entities/incoming-token.entity';
import { MessageCreated } from '@/routes/cache-hooks/entities/message-created.entity';
import { NewConfirmation } from '@/routes/cache-hooks/entities/new-confirmation.entity';
import { NewMessageConfirmation } from '@/routes/cache-hooks/entities/new-message-confirmation.entity';
import { OutgoingEther } from '@/routes/cache-hooks/entities/outgoing-ether.entity';
import { OutgoingToken } from '@/routes/cache-hooks/entities/outgoing-token.entity';
import { PendingTransaction } from '@/routes/cache-hooks/entities/pending-transaction.entity';
import { SafeAppsUpdate } from '@/routes/cache-hooks/entities/safe-apps-update.entity';
import { ModuleTransaction } from '@/routes/cache-hooks/entities/module-transaction.entity';

@Injectable()
export class CacheHooksService {
  constructor(
    @Inject(IBalancesRepository)
    private readonly balancesRepository: IBalancesRepository,
    @Inject(IChainsRepository)
    private readonly chainsRepository: IChainsRepository,
    @Inject(ICollectiblesRepository)
    private readonly collectiblesRepository: ICollectiblesRepository,
    @Inject(IMessagesRepository)
    private readonly messagesRepository: IMessagesRepository,
    @Inject(ISafeAppsRepository)
    private readonly safeAppsRepository: ISafeAppsRepository,
    @Inject(ISafeRepository)
    private readonly safeRepository: ISafeRepository,
  ) {}

  async onEvent(
    event:
      | ChainUpdate
      | ExecutedTransaction
      | IncomingEther
      | IncomingToken
      | MessageCreated
      | ModuleTransaction
      | NewMessageConfirmation
      | NewConfirmation
      | OutgoingToken
      | OutgoingEther
      | PendingTransaction
      | SafeAppsUpdate,
  ): Promise<void[]> {
    const promises: Promise<void>[] = [];
    switch (event.type) {
      // A new pending multisig transaction affects:
      // queued transactions – clear multisig transactions
      // the pending transaction – clear multisig transaction
      case EventType.PENDING_MULTISIG_TRANSACTION:
        promises.push(
          this.safeRepository.clearMultisigTransactions({
            chainId: event.chainId,
            safeAddress: event.address,
          }),
          this.safeRepository.clearMultisigTransaction({
            chainId: event.chainId,
            safeTransactionHash: event.safeTxHash,
          }),
        );
        break;
      // An executed module transaction might affect:
      // - the list of all executed transactions for the safe
      // - the list of module transactions for the safe
      case EventType.MODULE_TRANSACTION:
        promises.push(
          this.safeRepository.clearAllExecutedTransactions({
            chainId: event.chainId,
            safeAddress: event.address,
          }),
          this.safeRepository.clearModuleTransactions({
            chainId: event.chainId,
            safeAddress: event.address,
          }),
        );
        break;
      // A new executed multisig transaction affects:
      // - the collectibles that the safe has
      // - the list of all executed transactions for the safe
      // - the transfers for that safe
      // - queued transactions and history – clear multisig transactions
      // - the transaction executed – clear multisig transaction
      // - the safe configuration - clear safe info
      case EventType.EXECUTED_MULTISIG_TRANSACTION:
        promises.push(
          this.collectiblesRepository.clearCollectibles({
            chainId: event.chainId,
            safeAddress: event.address,
          }),
          this.safeRepository.clearAllExecutedTransactions({
            chainId: event.chainId,
            safeAddress: event.address,
          }),
          this.safeRepository.clearTransfers({
            chainId: event.chainId,
            safeAddress: event.address,
          }),
          this.safeRepository.clearMultisigTransactions({
            chainId: event.chainId,
            safeAddress: event.address,
          }),
          this.safeRepository.clearMultisigTransaction({
            chainId: event.chainId,
            safeTransactionHash: event.safeTxHash,
          }),
          this.safeRepository.clearSafe({
            chainId: event.chainId,
            address: event.address,
          }),
        );
        break;
      // A new confirmation for a pending transaction affects:
      // - queued transactions – clear multisig transactions
      // - the pending transaction – clear multisig transaction
      case EventType.NEW_CONFIRMATION:
        promises.push(
          this.safeRepository.clearMultisigTransactions({
            chainId: event.chainId,
            safeAddress: event.address,
          }),
          this.safeRepository.clearMultisigTransaction({
            chainId: event.chainId,
            safeTransactionHash: event.safeTxHash,
          }),
        );
        break;
      // Incoming ether affects:
      // - the balance of the safe - clear safe balance
      // - the list of all executed transactions (including transfers) for the safe
      // - the incoming transfers for that safe
      case EventType.INCOMING_ETHER:
        promises.push(
          this.balancesRepository.clearLocalBalances({
            chainId: event.chainId,
            safeAddress: event.address,
          }),
          this.safeRepository.clearAllExecutedTransactions({
            chainId: event.chainId,
            safeAddress: event.address,
          }),
          this.safeRepository.clearMultisigTransactions({
            chainId: event.chainId,
            safeAddress: event.address,
          }),
          this.safeRepository.clearTransfers({
            chainId: event.chainId,
            safeAddress: event.address,
          }),
          this.safeRepository.clearIncomingTransfers({
            chainId: event.chainId,
            safeAddress: event.address,
          }),
        );
        break;
      // Outgoing ether affects:
      // - the balance of the safe - clear safe balance
      // - the list of all executed transactions for the safe
      // - queued transactions and history – clear multisig transactions
      // - the transfers for that safe
      case EventType.OUTGOING_ETHER:
        promises.push(
          this.balancesRepository.clearLocalBalances({
            chainId: event.chainId,
            safeAddress: event.address,
          }),
          this.safeRepository.clearAllExecutedTransactions({
            chainId: event.chainId,
            safeAddress: event.address,
          }),
          this.safeRepository.clearMultisigTransactions({
            chainId: event.chainId,
            safeAddress: event.address,
          }),
          this.safeRepository.clearTransfers({
            chainId: event.chainId,
            safeAddress: event.address,
          }),
        );
        break;
      // An incoming token affects:
      // - the balance of the safe - clear safe balance
      // - the collectibles that the safe has
      // - the list of all executed transactions (including transfers) for the safe
      // - queued transactions and history – clear multisig transactions
      // - the transfers for that safe
      // - the incoming transfers for that safe
      case EventType.INCOMING_TOKEN:
        promises.push(
          this.balancesRepository.clearLocalBalances({
            chainId: event.chainId,
            safeAddress: event.address,
          }),
          this.collectiblesRepository.clearCollectibles({
            chainId: event.chainId,
            safeAddress: event.address,
          }),
          this.safeRepository.clearAllExecutedTransactions({
            chainId: event.chainId,
            safeAddress: event.address,
          }),
          this.safeRepository.clearMultisigTransactions({
            chainId: event.chainId,
            safeAddress: event.address,
          }),
          this.safeRepository.clearTransfers({
            chainId: event.chainId,
            safeAddress: event.address,
          }),
          this.safeRepository.clearIncomingTransfers({
            chainId: event.chainId,
            safeAddress: event.address,
          }),
        );
        break;
      // An outgoing token affects:
      // - the balance of the safe - clear safe balance
      // - the collectibles that the safe has
      // - the list of all executed transactions (including transfers) for the safe
      // - queued transactions and history – clear multisig transactions
      // - the transfers for that safe
      case EventType.OUTGOING_TOKEN:
        promises.push(
          this.balancesRepository.clearLocalBalances({
            chainId: event.chainId,
            safeAddress: event.address,
          }),
          this.collectiblesRepository.clearCollectibles({
            chainId: event.chainId,
            safeAddress: event.address,
          }),
          this.safeRepository.clearAllExecutedTransactions({
            chainId: event.chainId,
            safeAddress: event.address,
          }),
          this.safeRepository.clearMultisigTransactions({
            chainId: event.chainId,
            safeAddress: event.address,
          }),
          this.safeRepository.clearTransfers({
            chainId: event.chainId,
            safeAddress: event.address,
          }),
        );
        break;
      // A message created affects:
      // - the messages associated to the Safe
      case EventType.MESSAGE_CREATED:
        promises.push(
          this.messagesRepository.clearMessagesBySafe({
            chainId: event.chainId,
            safeAddress: event.address,
          }),
        );
        break;
      // A new message confirmation affects:
      // - the message itself
      // - the messages associated to the Safe
      case EventType.MESSAGE_CONFIRMATION:
        promises.push(
          this.messagesRepository.clearMessagesByHash({
            chainId: event.chainId,
            messageHash: event.messageHash,
          }),
          this.messagesRepository.clearMessagesBySafe({
            chainId: event.chainId,
            safeAddress: event.address,
          }),
        );
        break;
      case EventType.CHAIN_UPDATE:
        promises.push(this.chainsRepository.clearChain(event.chainId));
        break;
      case EventType.SAFE_APPS_UPDATE:
        promises.push(this.safeAppsRepository.clearSafeApps(event.chainId));
        break;
    }
    return Promise.all(promises);
  }
}
