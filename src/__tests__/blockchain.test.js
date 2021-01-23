import BlockChain from '../blockchain';

describe('Blockchain', () => {

    let bitcoin;
    beforeEach(() => {
        bitcoin = new BlockChain();
    })

    test('Create Bitcoin blockchain', () => {
        expect(bitcoin.chain.length).toEqual(0);
    })

    test('Create new Block in bitcoin', () => {
        const newBlock = bitcoin.createNewBlock({ nonce: 9802, previousBlockHash: '0xd232DABY5', hash: '0xD4532CDY' })
        expect(bitcoin.chain.length).toEqual(1);
        expect(bitcoin.chain[0].timestamp).not.toBeNull();
        expect(bitcoin.chain[0].previousBlockHash).toEqual(newBlock.previousBlockHash);

    })

    test('Create new Block in bitcoin', () => {
        bitcoin.createNewBlock({ nonce: 9802, previousBlockHash: '0xd232DABY5', hash: '0xD4532CDY' })
        const lastBlock = bitcoin.getLastBlock();
        expect(lastBlock.hash).toEqual('0xD4532CDY');
    })

    test('Create new transactions in bitcoin', () => {
        bitcoin.createNewTransaction({ amount: 100, sender: '0xdgu78ddidfnilo69b000b', receiver: '0xegu259khko69b00x' })
        expect(bitcoin.pendingTransactions.length).toEqual(1);
    })

    test('Create new transaction and mine a block', () => {
        bitcoin.createNewTransaction({ amount: 100, sender: '0xdgu78ddidfnilo69b000b', receiver: '0xegu259khko69b00x' })
        bitcoin.createNewTransaction({ amount: 50, sender: '0xdgu78ddidfnilo69b000b', receiver: '0xegu259khko69b00x' })
        const blockId = bitcoin.createNewTransaction({ amount: 200, sender: '0xdgu78ddidfnilo69b000b', receiver: '0xegu259khko69b00x' })
        bitcoin.createNewBlock({ nonce: 9802, previousBlockHash: '0xd232DABY5', hash: '0xD4532CDY' })

        expect(bitcoin.getLastBlock().index).toEqual(blockId);
        expect(bitcoin.getLastBlock().transactions.length).toEqual(3);
    })

    test('hash block', () => {
        bitcoin.createNewTransaction({ amount: 100, sender: '0xdgu78ddidfnilo69b000b', receiver: '0xegu259khko69b00x' })
        bitcoin.createNewTransaction({ amount: 50, sender: '0xdgu78ddidfnilo69b000b', receiver: '0xegu259khko69b00x' })
        bitcoin.createNewTransaction({ amount: 200, sender: '0xdgu78ddidfnilo69b000b', receiver: '0xegu259khko69b00x' })

        const hash = bitcoin.hashBlock({ nonce: 9802, previousBlockHash: '0xd232DABY5', currentBlockData: bitcoin.pendingTransactions })
        expect(hash).toEqual('cab06f65e386b57a75022544b9c443aec9ed61a3710fbe569ead759fec885dea');
    })

    test('Proof of work', () => {

        bitcoin.createNewTransaction({ amount: 100, sender: '0xdgu78ddidfnilo69b000b', receiver: '0xegu259khko69b00x' })
        bitcoin.createNewBlock({ nonce: 9802, previousBlockHash: '0xd232DABY5', hash: '0x000D4532CDY' })

        bitcoin.createNewTransaction({ amount: 200, sender: '0xdgu78ddidfnilo69b000b', receiver: '0xegu259khko69b00x' })
        bitcoin.createNewTransaction({ amount: 50, sender: '0xdgu78ddidfnilo69b000b', receiver: '0xegu259khko69b00x' })

        const previousBlockHash = bitcoin.getLastBlock().previousBlockHash;
        const proofNonce = bitcoin.proofOfWork({ previousBlockHash, currentBlockData: bitcoin.pendingTransactions });
        const hash = bitcoin.hashBlock({ nonce: proofNonce, previousBlockHash, currentBlockData: bitcoin.pendingTransactions })
        expect(hash.toString().substring(0, 4)).toEqual('0000');
    })
})


