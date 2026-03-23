// frontend/script.js - Page d'accueil

const CONFIG = {
    domainsPath: window.location.protocol === 'file:' ? 'domains' : '../domains',
    domainsList: [
      { id: 'demographie', icon: '👥', color: '#0066cc' },
      { id: 'economie', icon: '📊', color: '#28a745' },
      { id: 'sante', icon: '🏥', color: '#dc3545' },
      { id: 'education', icon: '📚', color: '#fd7e14' },
      { id: 'agriculture', icon: '🌾', color: '#20c997' },
      { id: 'infrastructures', icon: '🏗️', color: '#6f42c1' },
      { id: 'energie', icon: '⚡', color: '#ffc107' },
      { id: 'telecom', icon: '📡', color: '#17a2b8' },
      { id: 'gouvernance', icon: '⚖️', color: '#6610f2' },
      { id: 'transport', icon: '🚢', color: '#e83e8c' },
      { id: 'recherche', icon: '🔬', color: '#7952b3' },
      { id: 'social', icon: '🤝', color: '#6c757d' }
    ]
  };
  
  let domainsData = [];
  
  // Charger tous les domaines
  async function loadDomains() {
    showLoading(true);
    
    try {
      const promises = CONFIG.domainsList.map(async (domainInfo) => {
        try {
          // Charger les métadonnées
          const metaResponse = await fetch(`${CONFIG.domainsPath}/${domainInfo.id}/meta.json`);
          const meta = metaResponse.ok ? await metaResponse.json() : { 
            nom: domainInfo.id.charAt(0).toUpperCase() + domainInfo.id.slice(1),
            description: '',
            tags: []
          };
          
          // Charger les sources pour compter
          const sourcesResponse = await fetch(`${CONFIG.domainsPath}/${domainInfo.id}/sources.json`);
          const sourcesData = await sourcesResponse.json();
          const sourceCount = Object.keys(sourcesData.sources || {}).length;
          
          return {
            id: domainInfo.id,
            icon: domainInfo.icon,
            color: domainInfo.color,
            name: meta.nom,
            description: meta.description || `Sources de données sur ${meta.nom.toLowerCase()}`,
            sourceCount,
            tags: meta.tags || []
          };
        } catch (error) {
          console.error(`Erreur chargement ${domainInfo.id}:`, error);
          return null;
        }
      });
  
      domainsData = (await Promise.all(promises)).filter(d => d !== null);
      
      // Afficher la grille
      renderDomainsGrid();
      
      // Mettre à jour les stats
      updateStats();
      
    } catch (error) {
      console.error('Erreur:', error);
      showError('Impossible de charger les données');
    } finally {
      showLoading(false);
    }
  }
  
  // Afficher la grille des domaines
  function renderDomainsGrid() {
    const grid = document.getElementById('domainsGrid');
    if (!grid) return;
    
    let html = '';
    
    domainsData.forEach(domain => {
      html += `
        <a href="domain.html?domain=${domain.id}" class="domain-card" style="border-top-color: ${domain.color}">
          <div class="domain-icon">${domain.icon}</div>
          <h3 class="domain-name">${domain.name}</h3>
          <p class="domain-description">${domain.description}</p>
          <div class="domain-meta">
            <span class="source-count">${domain.sourceCount} sources</span>
            <span class="view-link">Explorer →</span>
          </div>
          <div class="domain-tags">
            ${domain.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </a>
      `;
    });
    
    grid.innerHTML = html;
  }
  
  // Mettre à jour les statistiques
  async function updateStats() {
    const totalDomains = domainsData.length;
    const totalSources = domainsData.reduce((sum, d) => sum + d.sourceCount, 0);
    
    // Compter les organisations uniques (simplifié)
    const totalOrgs = 25; // À améliorer plus tard
    
    document.getElementById('totalDomains').textContent = totalDomains;
    document.getElementById('totalSources').textContent = totalSources;
    document.getElementById('totalOrganizations').textContent = totalOrgs + '+';
  }
  
  function showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) loading.classList.toggle('hidden', !show);
  }
  
  function showError(message) {
    const grid = document.getElementById('domainsGrid');
    if (grid) grid.innerHTML = `<div class="error-message">❌ ${message}</div>`;
  }
  
  // Initialisation
  document.addEventListener('DOMContentLoaded', loadDomains);