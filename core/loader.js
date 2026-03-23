// Charge tous les domaines et leurs sources
const fs = require('fs');
const path = require('path');

class DomainLoader {
  constructor(domainsPath = '../domains') {
    this.domainsPath = path.join(__dirname, domainsPath);
    this.domains = [];
    this.allSources = {};
  }

  // Liste tous les dossiers de domaines
  listDomains() {
    return fs.readdirSync(this.domainsPath)
      .filter(file => fs.statSync(path.join(this.domainsPath, file)).isDirectory());
  }

  // Charge un domaine spécifique
  loadDomain(domainName) {
    const domainPath = path.join(this.domainsPath, domainName);
    const sourcesPath = path.join(domainPath, 'sources.json');
    const metaPath = path.join(domainPath, 'meta.json');

    if (!fs.existsSync(sourcesPath)) return null;

    const sources = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'));
    const meta = fs.existsSync(metaPath) 
      ? JSON.parse(fs.readFileSync(metaPath, 'utf8')) 
      : { nom: domainName, description: '' };

    return {
      id: domainName,
      meta: meta,
      sources: sources.sources || {}
    };
  }

  // Charge tous les domaines
  loadAllDomains() {
    const domains = this.listDomains();
    this.domains = domains.map(domain => this.loadDomain(domain)).filter(d => d !== null);
    
    // Construire l'index de toutes les sources
    this.allSources = {};
    this.domains.forEach(domain => {
      Object.assign(this.allSources, domain.sources);
    });

    return this.domains;
  }

  // Obtenir un domaine par ID
  getDomain(domainId) {
    return this.domains.find(d => d.id === domainId);
  }

  // Obtenir toutes les sources (pour l'interface)
  getAllSources() {
    return this.allSources;
  }

  // Statistiques
  getStats() {
    return {
      totalDomains: this.domains.length,
      totalSources: Object.keys(this.allSources).length,
      domains: this.domains.map(d => ({
        id: d.id,
        nom: d.meta.nom,
        total: Object.keys(d.sources).length
      }))
    };
  }
}

module.exports = DomainLoader;