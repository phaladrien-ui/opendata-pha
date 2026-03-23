const fs = require('fs').promises;
const path = require('path');

// Pour Vercel, les domains sont dans un dossier spécifique
const getDomainsPath = () => {
  // En production sur Vercel
  if (process.env.VERCEL) {
    // Les fichiers sont dans /var/task/domains après le build
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