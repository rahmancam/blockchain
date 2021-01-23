class Block {
    constructor({ index, transactions, nonce, hash, previousBlockHash }) {
        this.index = index;
        this.timestamp = Date.now();
        this.transactions = transactions;
        this.nonce = nonce;
        this.hash = hash;
        this.previousBlockHash = previousBlockHash;
    }
}

export default Block;