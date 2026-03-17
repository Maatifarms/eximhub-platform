const mysql = require('mysql2/promise');
require('dotenv').config();

const industries = ['Manufacturing', 'Food Production', 'Pharmaceuticals', 'Automotive', 'Textiles', 'Electronics', 'Agriculture', 'Logistics', 'Construction', 'Energy'];
const countries = ['UAE', 'India', 'USA', 'Germany', 'Vietnam', 'Brazil', 'China', 'Singapore', 'Canada', 'Australia'];
const procurementTitles = [
    'Procurement Manager', 'Purchasing Manager', 'Head of Procurement', 'Sourcing Manager',
    'Senior Procurement Officer', 'Supply Chain Director', 'Vendor Manager', 'Strategic Sourcing Lead',
    'Category Manager', 'Purchasing Coordinator'
];

async function seed() {
    let connection;
    try {
        console.log('Connecting to database for seeding...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            database: process.env.DB_NAME || 'eximhub_db'
        });

        console.log('Clearing existing sample data (if any)...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        await connection.query('TRUNCATE TABLE contacts');
        await connection.query('TRUNCATE TABLE companies');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('Seeding 10 companies...');
        const companyIds = [];
        for (let i = 1; i <= 10; i++) {
            const [result] = await connection.query(
                `INSERT INTO companies (company_name, industry, website, company_size, country, city, product_keywords) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    `EximCorp ${i}`,
                    industries[i % industries.length],
                    `https://eximcorp${i}.com`,
                    '50-200 employees',
                    countries[i % countries.length],
                    'Industrial City',
                    'raw materials, logistics, manufacturing'
                ]
            );
            companyIds.push(result.insertId);
        }

        console.log('Seeding 50 procurement contacts...');
        for (let i = 1; i <= 50; i++) {
            const companyId = companyIds[i % companyIds.length];
            const firstName = `Contact${i}`;
            const lastName = `Exim`;
            const title = procurementTitles[i % procurementTitles.length];
            
            await connection.query(
                `INSERT INTO contacts (company_id, first_name, last_name, full_name, title, department, email, phone, is_procurement) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    companyId,
                    firstName,
                    lastName,
                    `${firstName} ${lastName}`,
                    title,
                    'Procurement',
                    `contact${i}@eximcorp${companyId}.com`,
                    `+9715000000${i.toString().padStart(2, '0')}`,
                    1 // Still setting it to be sure, though trigger should handle it
                ]
            );
        }

        console.log('Seeding successfully completed!');

    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        if (connection) await connection.end();
    }
}

seed();
