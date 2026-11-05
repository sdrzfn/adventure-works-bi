// server.js
import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 4000;

if (!process.env.PORT) {
    console.warn("⚠️ Warning: PORT is not defined in .env file. Using default port 3001.");
}

console.log("ℹ️ Info: Running in:", process.env.NODE_ENV || 'development');

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
