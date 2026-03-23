// frontend/domain.js - Page d'un domaine spécifique

// Récupérer le domaine depuis l'URL
const urlParams = new URLSearchParams(window.location.search);
const domainId = urlParams.get('domain');

if (!domainId) {
  window.location.href = 'index.html';
}

const CONFIG = {
  domainsPath: window.location.protocol === 'file:' ? 'domains' : '../domains',
  domainId: domainId
};

let domainData = null;
let currentSources = [];
let currentFilters = {
  type: 'all',
  search: ''
};

// Charger les données du domaine
async function loadDomain() {
  showLoading(true);
  
  try {
    // Charger les métadonnées
    const metaResponse = await fetch(`${CONFIG.domainsPath}/${domainId}/meta.json`);
    if (!metaResponse.ok) throw new Error('Domaine non trouvé');
    const meta = await metaResponse.json();
    
    // Charger les sources
    const sourcesResponse = await fetch(`${CONFIG.domainsPath}/${domainId}/sources.json`);
    const sourcesData = await sourcesResponse.json();
    
    domainData = {
      ...meta,
      sources: sourcesData.sources || {}
    };
    
    // Préparer les sources
    currentSources = Object.entries(domainData.sources).map(([id, src]) => ({
      id,
      ...src
    }));
    
    // Mettre à jour l'interface
    updateHeader();
    updateMetadata();
    renderTable();
    
  } catch (error) {
    console.error('Erreur:', error);
    showError('Domaine non trouvé ou erreur de chargement');
  } finally {
    showLoading(false);
  }
}

function updateHeader() {
  document.getElementById('domainTitle').textContent = domainData.nom || domainId;
  document.getElementById('domainSubtitle').textContent = 
    `Sources de données sur ${(domainData.nom || domainId).toLowerCase()}`;
  
  const descEl = document.getElementById('domainDescription');
  descEl.innerHTML = `<p>${domainData.description || 'Aucune description disponible.'}</p>`;
}

function updateMetadata() {
  const metaEl = document.getElementById('domainMetadata');
  if (!metaEl) return;
  
  const total = currentSources.length;
  const types = [...new Set(currentSources.map(s => s.type_source))];
  const regions = [...new Set(currentSources.map(s => s.pays_region).filter(Boolean))];
  
  metaEl.innerHTML = `
    <div class="metadata-grid">
      <div class="metadata-item">
        <span class="metadata-label">Total sources</span>
        <span class="metadata-value">${total}</span>
      </div>
      <div class="metadata-item">
        <span class="metadata-label">Types de sources</span>
        <span class="metadata-value">${types.length}</span>
      </div>
      <div class="metadata-item">
        <span class="metadata-label">Couverture</span>
        <span class="metadata-value">${regions.slice(0, 3).join(', ')}${regions.length > 3 ? '...' : ''}</span>
      </div>
      ${domainData.tags ? `
      <div class="metadata-item tags">
        <span class="metadata-label">Tags</span>
        <div class="tag-list">
          ${domainData.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </div>
      ` : ''}
    </div>
  `;
}

function filterSources() {
  return currentSources.filter(source => {
    if (currentFilters.type !== 'all' && source.type_source !== currentFilters.type) {
      return false;
    }
    
    if (currentFilters.search) {
      const searchLower = currentFilters.search.toLowerCase();
      const matches = 
        (source.nom_source || '').toLowerCase().includes(searchLower) ||
        (source.description_courte || '').toLowerCase().includes(searchLower) ||
        (source.pays_region || '').toLowerCase().includes(searchLower);
      
      if (!matches) return false;
    }
    
    return true;
  });
}

function renderTable() {
  const tbody = document.getElementById('tableBody');
  const noResults = document.getElementById('noResults');
  const statsEl = document.getElementById('domainStats');
  
  const filtered = filterSources();
  
  if (filtered.length === 0) {
    tbody.innerHTML = '';
    noResults.classList.remove('hidden');
  } else {
    noResults.classList.add('hidden');
    tbody.innerHTML = filtered.map(source => createRow(source)).join('');
  }
  
  // Stats
  statsEl.innerHTML = `
    <div class="stats-card">
      <span class="stats-number">${filtered.length}</span>
      <span class="stats-label">source${filtered.length > 1 ? 's' : ''} affichée${filtered.length > 1 ? 's' : ''}</span>
      <span class="stats-total">sur ${currentSources.length} total</span>
    </div>
  `;
}

function createRow(source) {
  const scoreClass = source.fiabilite_score >= 4 ? 'score-high' :
                     source.fiabilite_score === 3 ? 'score-medium' : 'score-low';
  
  return `
    <tr>
      <td><code>${source.id}</code></td>
      <td>
        <strong>${source.nom_source || '-'}</strong>
        ${source.description_courte ? `<br><small>${source.description_courte.substring(0, 100)}${source.description_courte.length > 100 ? '…' : ''}</small>` : ''}
      </td>
      <td>${source.type_source || '-'}</td>
      <td>${source.pays_region || '-'}</td>
      <td class="${scoreClass}">${source.fiabilite_score || '-'}</td>
      <td>${source.frequence || '-'}</td>
      <td class="url">
        ${source.url_principale ? 
          `<a href="${source.url_principale}" target="_blank" rel="noopener">🔗 Accéder</a>` : 
          '-'}
      </td>
    </tr>
  `;
}

function exportToCsv() {
  const filtered = filterSources();
  
  if (filtered.length === 0) {
    alert('Aucune donnée à exporter');
    return;
  }
  
  const headers = ['ID', 'Nom', 'Type', 'Région', 'Score', 'Fréquence', 'URL', 'Description'];
  const rows = filtered.map(s => [
    s.id,
    s.nom_source,
    s.type_source,
    s.pays_region,
    s.fiabilite_score,
    s.frequence,
    s.url_principale,
    s.description_courte
  ]);
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${domainId}_sources_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
}

function showLoading(show) {
  const loading = document.getElementById('loading');
  if (loading) loading.classList.toggle('hidden', !show);
}

function showError(message) {
  const container = document.querySelector('.container');
  if (container) {
    container.innerHTML = `<div class="error-message">❌ ${message}</div>`;
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  loadDomain();
  
  document.getElementById('typeFilter')?.addEventListener('change', (e) => {
    currentFilters.type = e.target.value;
    renderTable();
  });
  
  document.getElementById('searchInput')?.addEventListener('input', (e) => {
    currentFilters.search = e.target.value;
    renderTable();
  });
  
  document.getElementById('exportCsv')?.addEventListener('click', exportToCsv);
});