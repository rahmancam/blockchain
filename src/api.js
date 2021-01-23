import express from 'express';
import bodyParser from 'body-parser';
import Blockchain from './blockchain';
import { v4 as uuid } from 'uuid';

const nodeAddress = uuid().replace('-', '');

const bitCoin = new Blockchain();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/**
 * Get entire blockchain
 */
app.get('/blockchain', (req, res) => {
    res.send(bitCoin);
})

/**
 * Create a new transaction
 */
app.post('/transaction', (req, res) => {
    const { amount, sender, receiver } = req.body;
    const blockId = bitCoin.createNewTransaction({ amount, sender, receiver });
    res.json({ note: `Transaction will be added in block: ${blockId}` });
});

/**
 * Mine a block
 */
app.get('/mine', (req, res) => {
    const { hash: previousBlockHash, index: lastBlockId } = bitCoin.getLastBlock();
    const currentBlockData = {
        transactions: bitCoin.pendingTransactions,
        index: lastBlockId
    };
    const nonce = bitCoin.proofOfWork({ previousBlockHash, currentBlockData });
    const hash = bitCoin.hashBlock({ previousBlockHash, nonce, currentBlockData });
    const newBlock = bitCoin.createNewBlock({ previousBlockHash, nonce, hash });
    // reward miner
    // 00 - to track reward transaction
    bitCoin.createNewTransaction({ amount: 12.5, sender: '00', receiver: nodeAddress });
    res.json({ note: `New block mined successfully`, block: newBlock });
});

app.use((err, req, res, next) => {
    res.status(500).json({
        code: 500,
        message: 'Error occurreed while processing your request!'
    })
});

export default app;