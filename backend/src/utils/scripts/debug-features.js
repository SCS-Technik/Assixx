const db = require('./database');

async function debugFeatures() {
  try {
    console.info('=== DEBUG FEATURES ===');

    // Check features table
    const [features] = await db.query('SELECT * FROM features');
    console.info(`\nFeatures count: ${features.length}`);
    if (features.length > 0) {
      console.info('\nFirst 3 features:');
      features.slice(0, 3).forEach((f) => {
        console.info(`- ${f.code}: ${f.name} (${f.category})`);
      });
    } else {
      console.info('NO FEATURES FOUND IN DATABASE!');
      console.info('\nInserting default features...');

      // Insert default features
      const defaultFeatures = [
        {
          code: 'user_management',
          name: 'Benutzerverwaltung',
          category: 'core',
          description: 'Verwaltung von Benutzern und Rollen',
          base_price: 0,
          is_active: true,
        },
        {
          code: 'documents',
          name: 'Dokumentenverwaltung',
          category: 'core',
          description: 'Upload und Verwaltung von Dokumenten',
          base_price: 0,
          is_active: true,
        },
        {
          code: 'blackboard',
          name: 'Schwarzes Brett',
          category: 'premium',
          description: 'Digitales schwarzes Brett für Ankündigungen',
          base_price: 10,
          is_active: true,
        },
        {
          code: 'calendar',
          name: 'Firmenkalender',
          category: 'premium',
          description: 'Gemeinsamer Kalender für alle Mitarbeiter',
          base_price: 15,
          is_active: true,
        },
        {
          code: 'kvp',
          name: 'KVP System',
          category: 'premium',
          description: 'Kontinuierlicher Verbesserungsprozess',
          base_price: 20,
          is_active: true,
        },
        {
          code: 'shifts',
          name: 'Schichtplanung',
          category: 'premium',
          description: 'Verwaltung von Schichtplänen',
          base_price: 25,
          is_active: true,
        },
        {
          code: 'chat',
          name: 'Chat System',
          category: 'premium',
          description: 'Interne Kommunikation via Chat',
          base_price: 20,
          is_active: true,
        },
        {
          code: 'surveys',
          name: 'Umfragen',
          category: 'enterprise',
          description: 'Erstellen und Auswerten von Umfragen',
          base_price: 30,
          is_active: true,
        },
      ];

      for (const feature of defaultFeatures) {
        await db.query(
          'INSERT INTO features (code, name, category, description, base_price, is_active) VALUES (?, ?, ?, ?, ?, ?)',
          [
            feature.code,
            feature.name,
            feature.category,
            feature.description,
            feature.base_price,
            feature.is_active,
          ],
        );
        console.info(`Inserted: ${feature.code}`);
      }
    }

    // Check tenants
    const [tenants] = await db.query('SELECT id, subdomain, company_name FROM tenants');
    console.info(`\n\nTenants count: ${tenants.length}`);
    if (tenants.length > 0) {
      console.info('\nTenants:');
      tenants.forEach((t) => {
        console.info(`- ID ${t.id}: ${t.company_name} (${t.subdomain})`);
      });
    }

    // Check tenant_features
    const [tenantFeatures] = await db.query(`
      SELECT tf.*, t.company_name, f.name as feature_name, f.code as feature_code
      FROM tenant_features tf
      JOIN tenants t ON tf.tenant_id = t.id
      JOIN features f ON tf.feature_id = f.id
      LIMIT 10
    `);
    console.info(`\n\nTenant features count: ${tenantFeatures.length}`);
    if (tenantFeatures.length > 0) {
      console.info('\nActive features by tenant:');
      tenantFeatures.forEach((tf) => {
        console.info(`- ${tf.company_name}: ${tf.feature_name} (${tf.status})`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

debugFeatures();
