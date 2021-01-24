import Block from './block';
import sha256 from 'sha256';
import { v4 as uuid } from 'uuid';
import logger from './logger';

const currentNodeUrl = `http://localhost:${process.argv[2]}`;

class BlockChain {
    constructor() {
        this.chain = [];
        this.pendingTransactions = [];

        this.currentNodeUrl = currentNodeUrl;
        this.networkNodes = [];

        // Create a genesis block
        this.createNewBlock({ nonce: 100, previousBlockHash: '0x0', hash: '0x0' });
    }

    createNewBlock({ nonce, previousBlockHash, hash }) {

        if (this.chain.length > 0 && this.pendingTransactions.length === 0) {
            throw new Error("Cannot create a block with no transactions");
        }

        const newBlock = new Block({
            index: this.chain.length + 1,
            nonce,
            previousBlockHash,
            hash,
            transactions: this.pendingTransactions
        })

        this.chain.push(newBlock);

        this.pendingTransactions = []; // clear for new transactions

        return newBlock;
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }

    createNewTransaction({ amount, sender, receiver }) {
        const TxId = uuid().replace(/-/g, '');
        const newTransaction = {
            amount,
            sender,
            receiver,
            transactionId: TxId
        };
        return newTransaction;
    }

    addTransactionToPendingTransactions({ transaction }) {
        this.pendingTransactions.push(transaction);
        return this.getLastBlock().index + 1;
    }

    hashBlock({ previousBlockHash, currentBlockData, nonce }) {
        const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
        const hash = sha256(dataAsString);
        return hash;
    }

    proofOfWork({ previousBlockHash, currentBlockData }) {
        // -> repeatedly hash block until it finds correct hash => '0000------------'
        // -> uses current block data for the hash + previous block hash
        // -> continuously change the nonce until it find the correct hash
        // -> returns to us the nonce value that creates the correct hash
        let nonce = 0;
        let hash = this.hashBlock({ previousBlockHash, currentBlockData, nonce });
        while (hash.substring(0, 4) !== '0000') {
            nonce++;
            hash = this.hashBlock({ previousBlockHash, currentBlockData, nonce });
        }
        return nonce;
    }

    /**
     * Check if block chain is valid
     * @param {*} blockchain 
     */
    chainIsValid(blockchain) {
        let validChain = true;

        for (let blockIdx = 1; blockIdx < blockchain.length; blockIdx++) {
            const currentBlock = blockchain[blockIdx];
            const prevBlock = blockchain[blockIdx - 1];
            const currentBlockData = {
                transactions: currentBlock.transactions,
                index: prevBlock.index
            };
            const blockHash = this.hashBlock({ previousBlockHash: prevBlock.hash, currentBlockData, nonce: currentBlock.nonce });
            if (blockHash.substring(0, 4) !== '0000') validChain = false;
            if (currentBlock.previousBlockHash !== prevBlock.hash) validChain = false;
        }

        const [genesisBlock] = blockchain;
        const correctNonce = genesisBlock.nonce === 100;
        const correctPrevBlockHash = genesisBlock.previousBlockHash === '0x0';
        const correctHash = genesisBlock.hash === '0x0';
        const correctTransactions = genesisBlock.transactions.length === 0;

        if (!correctNonce || !correctPrevBlockHash || !correctHash || !correctTransactions) validChain = false;

        return validChain;
    }

    /**
     * Get Block by hash
     * @param {*} blockHash 
     */
    getBlock(blockHash) {
        return this.chain.find(x => x.hash === blockHash);
    }

    /**
     * Get Transaction
     * @param {*} transactionId 
     */
    getTransaction(transactionId) {
        let transaction = null;
        let block = null;
        this.chain.forEach(blk => {
            const tx = blk.transactions.find(x => x.transactionId === transactionId);
            if (tx) {
                transaction = tx;
                block = blk;
            }
        });
        return { transaction, block };
    }

    getAddressData(address) {
        let addressTransactions = [];
        this.chain.forEach(blk => {
            const transactions = blk.transactions.filter(x => x.sender === address || x.receiver === address);
            addressTransactions = [...addressTransactions, ...transactions];
        });

        let balance = 0;
        addressTransactions.forEach(tx => {
            if (tx.receiver === address) balance += tx.amount;
            else if (tx.sender === address) balance -= tx.amount;
        });

        return {
            addressTransactions,
            addressBalance: balance
        }
    }

}

export default BlockChain;