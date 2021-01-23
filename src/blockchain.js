import Block from './block';
import sha256 from 'sha256';

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

        if (this.chain.length > 0 && this.pendingTransactions.length == 0) {
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
        const newTransaction = {
            amount,
            sender,
            receiver
        };
        this.pendingTransactions.push(newTransaction);
        return this.chain.length + 1; // to which block the transaction going to belongs to
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
}

export default BlockChain;