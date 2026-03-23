const fs = require('fs').promises;
const path = require('path');

// Fonction pour trouver le dossier domains où qu'il soit
const getDomainsPath = () => {
  // Vercel : le dossier est dans /var/task
  if (process.env.VERCEL) {
    // Essayer plusieurs chemins possibles
    const possiblePaths = [
      path.join(process.cwd(), 'domains'),
      path.join(process.cwd(), '..', 'domains'),
      path.join('/var/task', 'domains'),
      path.join('/var/task', '..', 'domains'),
    ];
    
    for (const p of possiblePaths) {
      try {
        if (fs.existsSync(p)) {
          console.log('✅ Found domains at:', p);
          return p;
        }
      } catch (e) {
        // continue
      }
    }
    console.log('⚠️ Domains path not found, using:', path.join(process.cwd(), 'domains'));
    return path.join(process.cwd(), 'domains');
  }
  
  // En développement local
  return path.join(__dirname, '../../domains');
};

const DOMAINS_PATH = getDomainsPath();
console.log('📁 DOMAINS_PATH:', DOMAINS_PATH);

async function readDomainFile(domainId, filename) {
  try {
    const filePath = path.join(DOMAINS_PATH, domainId, filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

async function getAllDomains() {
  try {
    const items = await fs.readdir(DOMAINS_PATH);
    const domains = [];
    
    for (const item of items) {
      try {
        const stats = await fs.stat(path.join(DOMAINS_PATH, item));
        if (stats.isDirectory()) {
          const meta = await readDomainFile(item, 'meta.json');
          if (meta) {
            domains.push({
              id: item,
              name: meta.nom || item,
              description: meta.description || '',
              tags: meta.tags || []
            });
          }
        }
      } catch (e) {
        console.error(`Error reading domain ${item}:`, e.message);
      }
    }
    return domains;
  } catch (error) {
    console.error('Error reading domains:', error);
    return [];
  }
}

async function getDomainSources(domainId) {
  const data = await readDomainFile(domainId, 'sources.json');
  return data?.sources || {};
}

async function getAllSources() {
  const domains = await getAllDomains();
  let allSources = [];
  
  for (const domain of domains) {
    const sources = await getDomainSources(domain.id);
    Object.entries(sources).forEach(([id, source]) => {
      allSources.push({
        id,
        domainId: domain.id,
        domainName: domain.name,
        ...source
      });
    });
  }
  
  return allSources;
}

module.exports = {
  readDomainFile,
  getAllDomains,
  getDomainSources,
  getAllSources
};