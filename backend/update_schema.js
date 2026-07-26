const fs = require('fs');
let code = fs.readFileSync('backend/database/schema.js', 'utf-8');

// Add destination_id to tours table if not exists
if (!code.includes('destination_id INT NULL,')) {
    code = code.replace(/location VARCHAR\(100\),/g, 'location VARCHAR(100),\n                destination_id INT NULL,');
}

// Add ALTER TABLE at the end of initSchema
if (!code.includes('ALTER TABLE tours ADD CONSTRAINT fk_tours_destination')) {
    const endOfInit = code.lastIndexOf('console.log(\'✅ Database Schema đã được khởi tạo thành công\');');
    const alterTable = `
        try {
            await pool.query('ALTER TABLE tours ADD CONSTRAINT fk_tours_destination FOREIGN KEY (destination_id) REFERENCES Destination(id) ON DELETE SET NULL');
        } catch (e) {
            if (!e.message.includes('Duplicate key name')) {
                console.log('Constraint may already exist or error:', e.message);
            }
        }
    `;
    code = code.substring(0, endOfInit) + alterTable + code.substring(endOfInit);
}

fs.writeFileSync('backend/database/schema.js', code);
