// Valide la structure des sources et des domaines
const fs = require('fs');
const path = require('path');

class DomainValidator {
  constructor(domainsPath = '../domains') {
    this.domainsPath = path.join(__dirname, domainsPath);
    this.errors = [];
    this.warnings = [];
  }

  // Valide une source individuelle
  validateSource(sourceId, sourceData) {
    const required = ['nom_source', 'type_source', 'pays_region', 'fiabilite_score', 'url_principale'];
    const validTypes = [
      'Organisations_Internationales',
      'Universites_Recherche',
      'Institutions_Officielles',
      'ONG_Fondations',
      'Secteur_Prive'
    ];

    // Vérifier les champs requis
    for (const field of required) {
      if (!sourceData[field]) {
        this.errors.push(`Source ${sourceId}: champ '${field}' manquant`);
      }
    }

    // Valider le type de source
    if (sourceData.type_source && !validTypes.includes(sourceData.type_source)) {
      this.errors.push(`Source ${sourceId}: type_source invalide (${sourceData.type_source})`);
    }

    // Valider le score de fiabilité (1-5)
    if (sourceData.fiabilite_score) {
      const score = parseInt(sourceData.fiabilite_score);
      if (isNaN(score) || score < 1 || score > 5) {
        this.errors.push(`Source ${sourceId}: fiabilite_score doit être entre 1 et 5`);
      }
    }

    // Valider l'URL
    if (sourceData.url_principale) {
      try {
        new URL(sourceData.url_principale);
      } catch {
        this.warnings.push(`Source ${sourceId}: URL invalide (${sourceData.url_principale})`);
      }
    }

    // Valider l'ID (format: DOMAINE-TYPE-NUMERO)
    if (sourceId) {
      const pattern = /^[A-Z]+-[A-Z]+-[0-9]{3}$/;
      if (!pattern.test(sourceId)) {
        this.warnings.push(`Source ${sourceId}: format d'ID non standard (utiliser: DOMAINE-TYPE-001)`);
      }
    }
  }

  // Valide un domaine complet
  validateDomain(domainName) {
    const domainPath = path.join(this.domainsPath, domainName);
    const sourcesPath = path.join(domainPath, 'sources.json');
    const metaPath = path.join(domainPath, 'meta.json');

    // Vérifier que les fichiers existent
    if (!fs.existsSync(sourcesPath)) {
      this.errors.push(`Domaine ${domainName}: fichier sources.json manquant`);
      return;
    }

    if (!fs.existsSync(metaPath)) {
      this.warnings.push(`Domaine ${domainName}: fichier meta.json manquant (recommandé)`);
    }

    // Charger et valider les sources
    try {
      const sourcesData = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'));
      
      if (!sourcesData.sources || typeof sourcesData.sources !== 'object') {
        this.errors.push(`Domaine ${domainName}: format invalide (doit avoir une propriété 'sources')`);
      } else {
        Object.entries(sourcesData.sources).forEach(([id, source]) => {
          this.validateSource(id, source);
        });
      }
    } catch (e) {
      this.errors.push(`Domaine ${domainName}: erreur de parsing JSON - ${e.message}`);
    }

    // Valider meta.json si présent
    if (fs.existsSync(metaPath)) {
      try {
        const metaData = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
        if (!metaData.nom) {
          this.warnings.push(`Domaine ${domainName}: meta.json devrait avoir un champ 'nom'`);
        }
      } catch (e) {
        this.errors.push(`Domaine ${domainName}: erreur de parsing meta.json - ${e.message}`);
      }
    }
  }

  // Valide tous les domaines
  validateAll() {
    this.errors = [];
    this.warnings = [];

    if (!fs.existsSync(this.domainsPath)) {
      this.errors.push(`Dossier domains/ introuvable: ${this.domainsPath}`);
      return { valid: false, errors: this.errors, warnings: this.warnings };
    }

    const domains = fs.readdirSync(this.domainsPath)
      .filter(file => fs.statSync(path.join(this.domainsPath, file)).isDirectory());

    domains.forEach(domain => this.validateDomain(domain));

    return {
      valid: this.errors.length === 0,
      totalDomains: domains.length,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  // Rapport formaté
  getReport() {
    const result = this.validateAll();
    
    return {
      timestamp: new Date().toISOString(),
      status: result.valid ? '✅ VALIDE' : '❌ INVALIDE',
      domainsChecked: result.totalDomains,
      errors: result.errors,
      warnings: result.warnings,
      summary: {
        errors: result.errors.length,
        warnings: result.warnings.length
      }
    };
  }
}

module.exports = DomainValidator;