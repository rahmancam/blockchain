import app from './api';
import logger from './logger';

const PORT = process.argv[2] || 3000;

app.listen(PORT, () => {
    logger.info(`Block chain node listening at: http://localhost:${PORT}`);
    console.log(`API server listening at: http://localhost:${PORT}`);
})