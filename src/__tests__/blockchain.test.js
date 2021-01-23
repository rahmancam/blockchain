import Block from '../block';
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
        const newBlock = bitcoin.createNewBlock({
            nonce: 9802,
            previousBlockHash: '0xd232DABY5',
            hash: '0xD4532CDY'
        })
        expect(bitcoin.chain.length).toEqual(1);
        expect(bitcoin.chain[0].timestamp).not.toBeNull();
        expect(bitcoin.chain[0].previousBlockHash).toEqual(newBlock.previousBlockHash);

    })
})


