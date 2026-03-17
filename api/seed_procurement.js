const db = require('./db');

async function seed() {
    try {
        console.log('Seeding Companies...');
        const companies = [
            ['Global Tech Solutions', 'Electronics', 'Germany', 'https://globaltech.de', '100-500', 'Berlin', 'Industrial automation sensors'],
            ['AutoParts Direct', 'Automotive', 'Germany', 'https://autoparts.de', '500-1000', 'Munich', 'Brake systems, transmissions'],
            ['BioMed Pharma', 'Pharmaceuticals', 'Germany', 'https://biomed.de', '50-100', 'Hamburg', 'Active ingredients, chemical sourcing'],
            ['EuroTextile Group', 'Textiles', 'Germany', 'https://eurotextile.de', '1000+', 'Cologne', 'Cotton, synthetic fibers'],
            ['Berlin Manufacturing Co', 'Manufacturing', 'Germany', 'https://berlinmfg.de', '100-500', 'Berlin', 'Metal components'],
            ['Mumbai Industrial Corp', 'Manufacturing', 'India', 'https://mumbaiind.in', '500-1000', 'Mumbai', 'Castings, forgings'],
            ['Delhi Logistics Ltd', 'Logistics', 'India', 'https://delhilogistics.in', '100-500', 'Delhi', 'Freight forwarding'],
            ['Bangalore Agri Export', 'Agriculture', 'India', 'https://bangaloreagri.in', '50-100', 'Bangalore', 'Spices, grains'],
            ['Chennai Tech Parks', 'Electronics', 'India', 'https://chennaitech.in', '1000+', 'Chennai', 'PCB manufacturing'],
            ['Gujarat Chemical Hub', 'Manufacturing', 'India', 'https://gujaratchem.in', '500-1000', 'Surat', 'Industrial chemicals']
        ];

        for (const c of companies) {
            await db.execute(
                'INSERT INTO companies (company_name, industry, country, website, company_size, city, product_keywords) VALUES (?, ?, ?, ?, ?, ?, ?)',
                c
            );
        }

        console.log('Seeding Contacts...');
        const [rows] = await db.execute('SELECT id, company_name, country, industry FROM companies');
        
        for (const row of rows) {
            // Add 5 procurement contacts per company
            for (let i = 1; i <= 5; i++) {
                const names = ['John', 'Alice', 'Raj', 'Sarah', 'Hans', 'Priya', 'Marco', 'Elena', 'Wei', 'Amara'];
                const surnames = ['Miller', 'Smith', 'Sharma', 'García', 'Schmidt', 'Patel', 'Rossi', 'Dubois', 'Wang', 'Zwane'];
                const titles = ['Procurement Manager', 'Head of Sourcing', 'Purchasing Director', 'Supply Chain Lead', 'Strategic Sourcing Manager'];
                
                const name = names[Math.floor(Math.random() * names.length)];
                const surname = surnames[Math.floor(Math.random() * surnames.length)];
                const title = titles[i - 1]; // One of each title
                const email = `${name.toLowerCase()}.${surname.toLowerCase()}${Math.floor(Math.random()*1000)}@${row.company_name.toLowerCase().replace(/\s/g, '')}.com`;
                const phone = `+${Math.floor(Math.random() * 90) + 1} ${Math.floor(Math.random() * 899999) + 100000}`;

                await db.execute(
                    'INSERT INTO contacts (company_id, full_name, first_name, last_name, title, email, phone, industry, country, is_procurement) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)',
                    [row.id, `${name} ${surname}`, name, surname, title, email, phone, row.industry, row.country]
                );
            }
        }

        console.log('SEEDING COMPLETE');
        process.exit(0);
    } catch (e) {
        console.error('SEEDING FAIL:', e.message);
        process.exit(1);
    }
}

seed();
