import app from './api';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`API server listening at: http://localhost:${PORT}`);
})