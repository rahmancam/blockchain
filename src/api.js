import express from 'express';
import bodyParser from 'body-parser';
import Blockchain from './blockchain';
import { v4 as uuid } from 'uuid';
import rp from 'request-promise';
import logger from './logger';
import morgan from 'morgan';
import path from 'path';

const nodeAddress = uuid().replace('-', '');
const bitCoin = new Blockchain();

const app = express();
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

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
    const transaction = req.body;
    const blockId = bitCoin.addTransactionToPendingTransactions({ transaction });
    res.json({ note: `Transaction will be added in block: ${blockId}` });
});

/**
 * Create and broadcast transaction
 */
app.post('/transaction/broadcast', async (req, res) => {
    const { amount, sender, receiver } = req.body;
    const transaction = bitCoin.createNewTransaction({ amount, sender, receiver });
    bitCoin.addTransactionToPendingTransactions({ transaction });

    const reqPromises = bitCoin.networkNodes.map(nodeUrl => {
        const options = {
            uri: nodeUrl + '/transaction',
            method: 'POST',
            body: transaction,
            json: true
        }
        return rp(options);
    });

    await Promise.all(reqPromises)
    res.json({ note: 'Transaction created and broadcasted successfully.' });
});

/**
 * Mine a block
 */
app.get('/mine', async (req, res) => {
    const { hash: previousBlockHash, index: lastBlockId } = bitCoin.getLastBlock();
    const currentBlockData = {
        transactions: bitCoin.pendingTransactions,
        index: lastBlockId
    };
    const nonce = bitCoin.proofOfWork({ previousBlockHash, currentBlockData });
    const hash = bitCoin.hashBlock({ previousBlockHash, nonce, currentBlockData });
    const newBlock = bitCoin.createNewBlock({ previousBlockHash, nonce, hash });

    const reqPromises = bitCoin.networkNodes.map(nodeUrl => {
        const options = {
            uri: nodeUrl + '/receive-new-block',
            method: 'POST',
            body: { newBlock: newBlock },
            json: true
        }
        return rp(options);
    });

    await Promise.all(reqPromises)
    // reward miner
    // 00 - to track reward transaction
    const options = {
        uri: bitCoin.currentNodeUrl + '/transaction/broadcast',
        method: 'POST',
        body: {
            amount: 12.5,
            sender: '00',
            receiver: nodeAddress
        },
        json: true
    }
    await rp(options);
    res.json({ note: 'New block mined and broadcasted successfully.' });

});

app.post('/receive-new-block', (req, res) => {
    const { newBlock } = req.body;
    const lastBlock = bitCoin.getLastBlock();
    const isValidBlockhash = (lastBlock.hash === newBlock.previousBlockHash);
    const isValidBlockIndex = (lastBlock.index + 1 === newBlock.index);

    if (isValidBlockhash && isValidBlockIndex) {
        bitCoin.chain.push(newBlock);
        bitCoin.pendingTransactions = [];
        res.json({
            note: 'New block received and accepted',
            newBlock: newBlock
        });
    } else {
        res.json({
            note: 'New block rejected',
            newBlock: newBlock
        })
    }
})

/**
 * Register a node and broadcase it to the network
 */
app.post('/register-and-broadcast-node', async (req, res) => {
    const { newNodeUrl } = req.body;
    logger.info(newNodeUrl);
    if (newNodeUrl && !bitCoin.networkNodes.includes(newNodeUrl)) {
        bitCoin.networkNodes.push(newNodeUrl);
    }


    const reqPromises = bitCoin.networkNodes.filter(x => x && x !== bitCoin.currentNodeUrl).map(nodeUrl => {
        // Register node end point
        const options = {
            uri: `${nodeUrl}/register-node`,
            method: 'POST',
            body: { newNodeUrl: newNodeUrl },
            json: true
        }
        return rp(options);
    });

    await Promise.all(reqPromises)
    const options = {
        uri: `${newNodeUrl}/register-nodes-bulk`,
        method: 'POST',
        body: { allNetworkNodes: [...bitCoin.networkNodes, bitCoin.currentNodeUrl] },
        json: true
    };
    await rp(options);
    res.json({ note: 'New node registered with network successfully!' });
});

/**
 * Register a node with the network
 */
app.post('/register-node', (req, res) => {
    const { newNodeUrl } = req.body;
    logger.info(newNodeUrl);
    if (newNodeUrl && !bitCoin.networkNodes.includes(newNodeUrl) && newNodeUrl !== bitCoin.currentNodeUrl) {
        bitCoin.networkNodes.push(newNodeUrl);
    }
    res.json({ note: 'New node registered sucessfully with the node.' });
});

/**
* Register multiple node at once
*/
app.post('/register-nodes-bulk', (req, res) => {
    const { allNetworkNodes } = req.body;
    logger.info(allNetworkNodes);
    allNetworkNodes.filter(x => x && x !== bitCoin.currentNodeUrl).forEach((url) => {
        if (!bitCoin.networkNodes.includes(url)) {
            bitCoin.networkNodes.push(url);
        }
    });
    res.json({ note: 'Nodes updated sucessfully!' });
});

app.get('/consensus', async (req, res) => {
    const reqPromises = bitCoin.networkNodes.map(nodeUrl => {
        const options = {
            uri: `${nodeUrl}/blockchain`,
            method: 'GET',
            json: true
        }
        return rp(options);
    });

    const blockchains = await Promise.all(reqPromises);
    const currentChainLength = bitCoin.chain.length;
    let maxChainLength = currentChainLength;
    let newLongestChain = null;
    let newPendingTransactions = null;

    blockchains.forEach(blockchain => {
        if (blockchain.chain.length > maxChainLength) {
            maxChainLength = blockchain.chain.length;
            newLongestChain = blockchain.chain;
            newPendingTransactions = blockchain.pendingTransactions;
        }
    });

    if (!newLongestChain || (newLongestChain && !bitCoin.chainIsValid(newLongestChain))) {
        res.json({
            note: 'Current chain has not been replaced',
            chain: bitCoin.chain
        });
    } else {
        bitCoin.chain = newLongestChain;
        bitcoin.pendingTransactions = newPendingTransactions;
        res.json({
            note: 'This chain has been replaced.',
            chain: bitcoin.chain

        });
    }
});

app.get('/block/:blockHash', (req, res) => {
    const { blockHash } = req.params;
    const block = bitCoin.getBlock(blockHash);
    res.json({
        block
    });
});

app.get('/transaction/:transactionId', (req, res) => {
    const { transactionId } = req.params;
    const transaction = bitCoin.getTransaction(transactionId);
    res.json(transaction);
});

app.get('/address/:address', (req, res) => {
    const { address } = req.params;
    const addressData = bitCoin.getAddressData(address);
    res.json({
        addressData
    });
});

app.use((err, req, res, next) => {
    logger.error(err);
    res.status(500).json({
        code: 500,
        message: 'Error occurreed while processing your request!'
    })
});

export default app;