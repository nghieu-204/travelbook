const fs = require('fs');
let code = fs.readFileSync('backend/database/schema.js', 'utf-8');

const topLevelRegex = /\s*try \{\s*await pool\.query\('ALTER TABLE tours ADD CONSTRAINT fk_tours_destination FOREIGN KEY \(destination_id\) REFERENCES Destination\(id\) ON DELETE SET NULL'\);\s*\} catch \(e\) \{\s*if \(!e\.message\.includes\('Duplicate key name'\)\) \{\s*console\.log\('Constraint may already exist or error:', e\.message\);\s*\}\s*\}/;
code = code.replace(topLevelRegex, '');

const insertIndex = code.lastIndexOf('console.log("✅ Khởi tạo các bảng thành công!");');
if (insertIndex !== -1) {
    const alterTable = `
        try {
            await pool.query('ALTER TABLE tours ADD CONSTRAINT fk_tours_destination FOREIGN KEY (destination_id) REFERENCES Destination(id) ON DELETE SET NULL');
        } catch (e) {
            if (!e.message.includes('Duplicate key name')) {
                console.log('Constraint may already exist or error:', e.message);
            }
        }
    `;
    code = code.substring(0, insertIndex) + alterTable + code.substring(insertIndex);
}

fs.writeFileSync('backend/database/schema.js', code);
