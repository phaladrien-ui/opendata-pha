// backend/utils/fileReader.js
const fs = require('fs').promises;
const path = require('path');

const DOMAINS_PATH = path.join(__dirname, '../../domains');

async function readDomainFile(domainId, filename) {
  try {
    const filePath = path.join(DOMAINS_PATH, domainId, filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
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