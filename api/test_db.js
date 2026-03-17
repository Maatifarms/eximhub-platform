const mysql = require('mysql2/promise');
require('dotenv').config();

async function test() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
        });
        console.log('SUCCESS: Connected to MySQL.');
        await connection.end();
    } catch (err) {
        console.error('FAILURE: Could not connect to MySQL.');
        console.error(err);
    }
}
test();
