import BlockChain from '../blockchain';

describe('Blockchain', () => {

    let bitcoin;
    beforeEach(() => {
        bitcoin = new BlockChain();
    })

    afterEach(() => {
        bitcoin = null;
    })

    test('Genesis block', () => {
        expect(bitcoin.chain.length).toEqual(1); // with genesis block
        expect(bitcoin.chain[0].previousBlockHash).toEqual('0x0');
        expect(bitcoin.chain[0].nonce).toEqual(100);
        expect(bitcoin.chain[0].hash).toEqual('0x0');
    })

    test('Create new Block in bitcoin', () => {
        const transaction = bitcoin.createNewTransaction({ amount: 100, sender: '0xdgu78ddidfnilo69b000b', receiver: '0xegu259khko69b00x' });
        const blockId = bitcoin.addTransactionToPendingTransactions({ transaction });
        const newBlock = bitcoin.createNewBlock({ nonce: 9802, previousBlockHash: '0xd232DABY5', hash: '0xD4532CDY' })
        expect(bitcoin.chain.length).toEqual(2);
        expect(bitcoin.chain[1].timestamp).not.toBeNull();
        expect(bitcoin.chain[1].previousBlockHash).toEqual(newBlock.previousBlockHash);

    })

    test('Create new transactions in bitcoin', () => {
        const transaction = bitcoin.createNewTransaction({ amount: 100, sender: '0xdgu78ddidfnilo69b000b', receiver: '0xegu259khko69b00x' });
        bitcoin.addTransactionToPendingTransactions({ transaction });
        expect(bitcoin.pendingTransactions.length).toEqual(1);
    })

    test('Create new transaction and mine a block', () => {
        let transaction = bitcoin.createNewTransaction({ amount: 100, sender: '0xdgu78ddidfnilo69b000b', receiver: '0xegu259khko69b00x' })
        bitcoin.addTransactionToPendingTransactions({ transaction });
        transaction = bitcoin.createNewTransaction({ amount: 50, sender: '0xdgu78ddidfnilo69b000b', receiver: '0xegu259khko69b00x' })
        bitcoin.addTransactionToPendingTransactions({ transaction });
        transaction = bitcoin.createNewTransaction({ amount: 200, sender: '0xdgu78ddidfnilo69b000b', receiver: '0xegu259khko69b00x' })
        const blockId = bitcoin.addTransactionToPendingTransactions({ transaction });
        bitcoin.createNewBlock({ nonce: 9802, previousBlockHash: '0xd232DABY5', hash: '0xD4532CDY' })

        expect(bitcoin.getLastBlock().index).toEqual(blockId);
        expect(bitcoin.getLastBlock().transactions.length).toEqual(3);
    })

    test('hash block', () => {
        let transaction = bitcoin.createNewTransaction({ amount: 100, sender: '0xdgu78ddidfnilo69b000b', receiver: '0xegu259khko69b00x' })
        bitcoin.addTransactionToPendingTransactions({ transaction });
        transaction = bitcoin.createNewTransaction({ amount: 50, sender: '0xdgu78ddidfnilo69b000b', receiver: '0xegu259khko69b00x' })
        bitcoin.addTransactionToPendingTransactions({ transaction });
        transaction = bitcoin.createNewTransaction({ amount: 200, sender: '0xdgu78ddidfnilo69b000b', receiver: '0xegu259khko69b00x' })
        bitcoin.addTransactionToPendingTransactions({ transaction });

        const hash = bitcoin.hashBlock({ nonce: 9802, previousBlockHash: '0xd232DABY5', currentBlockData: bitcoin.pendingTransactions })
        expect(hash.length).toBeGreaterThan(0);
    })

    test('Proof of work', () => {

        let transaction = bitcoin.createNewTransaction({ amount: 100, sender: '0xdgu78ddidfnilo69b000b', receiver: '0xegu259khko69b00x' });
        bitcoin.addTransactionToPendingTransactions({ transaction });
        bitcoin.createNewBlock({ nonce: 9802, previousBlockHash: '0xd232DABY5', hash: '0x000D4532CDY' })

        transaction = bitcoin.createNewTransaction({ amount: 200, sender: '0xdgu78ddidfnilo69b000b', receiver: '0xegu259khko69b00x' });
        bitcoin.addTransactionToPendingTransactions({ transaction });
        transaction = bitcoin.createNewTransaction({ amount: 50, sender: '0xdgu78ddidfnilo69b000b', receiver: '0xegu259khko69b00x' })
        bitcoin.addTransactionToPendingTransactions({ transaction });

        const previousBlockHash = bitcoin.getLastBlock().previousBlockHash;
        const proofNonce = bitcoin.proofOfWork({ previousBlockHash, currentBlockData: bitcoin.pendingTransactions });
        const hash = bitcoin.hashBlock({ nonce: proofNonce, previousBlockHash, currentBlockData: bitcoin.pendingTransactions })
        expect(hash.toString().substring(0, 4)).toEqual('0000');
    })
})


