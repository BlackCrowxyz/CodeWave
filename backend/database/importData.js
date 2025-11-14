import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to data directory
const dataDir = path.join(__dirname, 'data');
const schemaPath = path.join(__dirname, 'schema.sql');

// Import order respecting foreign key dependencies
const importOrder = [
  'agency',
  'stops',
  'routes',
  'calendar',
  'calendar_dates',
  'shapes',
  'trips',
  'stop_times',
  'feed_info'
];

async function runSchema() {
  console.log('📋 Running schema.sql...');
  try {
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schemaSQL);
    console.log('✅ Schema created successfully!\n');
  } catch (error) {
    console.error('❌ Error running schema:', error.message);
    throw error;
  }
}

async function importCSV(tableName) {
  const filePath = path.join(dataDir, `${tableName}.txt`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}, skipping...`);
    return;
  }

  console.log(`📥 Importing ${tableName}...`);
  
  const client = await pool.connect();
  
  try {
    // Try COPY FROM file path first (fastest, but requires file access)
    const absolutePath = path.resolve(filePath).replace(/\\/g, '/');
    
    try {
      await client.query(`
        COPY gtfs.${tableName} 
        FROM '${absolutePath}' 
        WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"')
      `);
      const result = await client.query(`SELECT COUNT(*) FROM gtfs.${tableName}`);
      console.log(`✅ Imported data into ${tableName} (${result.rows[0].count} total rows)\n`);
    } catch (copyError) {
      // Fallback to manual INSERT if COPY FROM file doesn't work
      console.log(`   Using INSERT method (COPY FROM file not accessible)...`);
      await importCSVManual(client, tableName, filePath);
    }
  } catch (error) {
    console.error(`❌ Error importing ${tableName}:`, error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function importCSVManual(client, tableName, filePath) {
  const csvContent = fs.readFileSync(filePath, 'utf8');
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length <= 1) {
    return;
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const dataLines = lines.slice(1);

  // Simple CSV parser
  function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    return values.map(val => {
      if (val === '' || val === '""') return null;
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      return val;
    });
  }

  const columns = headers.join(', ');
  const placeholders = headers.map((_, i) => `$${i + 1}`).join(', ');
  const insertSQL = `INSERT INTO gtfs.${tableName} (${columns}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;

  let imported = 0;
  const batchSize = 500;

  for (let i = 0; i < dataLines.length; i += batchSize) {
    const batch = dataLines.slice(i, i + batchSize);
    
    for (const line of batch) {
      if (!line.trim()) continue;
      
      try {
        const values = parseCSVLine(line);
        await client.query(insertSQL, values);
        imported++;
      } catch (error) {
        if (error.code !== '23505' && error.code !== '23503') {
          // Only log non-constraint errors
          if (imported % 1000 === 0) {
            console.log(`   Processed ${imported} rows...`);
          }
        }
      }
    }
  }

  console.log(`✅ Imported ${imported} rows into ${tableName}\n`);
}

async function main() {
  console.log('🚀 Starting GTFS data import...\n');
  
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!\n');

    // Run schema
    await runSchema();

    // Import data files in order
    for (const tableName of importOrder) {
      await importCSV(tableName);
    }

    console.log('🎉 All data imported successfully!');
    
    // Show summary
    console.log('\n📊 Data Summary:');
    for (const tableName of importOrder) {
      try {
        const result = await pool.query(`SELECT COUNT(*) FROM gtfs.${tableName}`);
        console.log(`  ${tableName}: ${result.rows[0].count} rows`);
      } catch (error) {
        // Table might not exist or have no data
      }
    }
    
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

