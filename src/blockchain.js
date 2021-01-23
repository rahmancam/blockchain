import Block from './block';

class BlockChain {
    constructor() {
        this.chain = [];
        this.newTransactions = [];
    }

    createNewBlock({ nonce, previousBlockHash, hash }) {
        const newBlock = new Block({
            index: this.chain.length + 1,
            nonce,
            previousBlockHash,
            hash,
            transactions: this.newTransactions
        })

        this.chain.push(newBlock);

        this.newTransactions = []; // clear for new transactions

        return newBlock;
    }
}

export default BlockChain;