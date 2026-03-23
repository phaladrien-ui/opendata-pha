'use client';

/**
 * PAGE DE DOMAINE
 * Affiche tous les détails d'un domaine et ses sources
 */

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { domainService } from '@/services/api';
import { DomainDetail, Source } from '@/types';
import { ArrowLeft, Download, Filter } from 'lucide-react';

export default function DomainPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [domain, setDomain] = useState<DomainDetail | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [filteredSources, setFilteredSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // ===== CHARGEMENT DES DONNÉES =====
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [domainData, sourcesData] = await Promise.all([
          domainService.getById(id),
          domainService.getSources(id)
        ]);
        setDomain(domainData);
        setSources(sourcesData);
        setFilteredSources(sourcesData);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchData();
  }, [id]);

  // ===== FILTRAGE =====
  useEffect(() => {
    let filtered = sources;
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(s => s.type_source === typeFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.nom_source.toLowerCase().includes(query) ||
        (s.description_courte || '').toLowerCase().includes(query)
      );
    }
    
    setFilteredSources(filtered);
  }, [typeFilter, searchQuery, sources]);

  // ===== EXPORT CSV =====
  const exportToCsv = () => {
    if (filteredSources.length === 0) return;
    
    const headers = ['ID', 'Nom', 'Type', 'Région', 'Score', 'Fréquence', 'URL', 'Description'];
    const rows = filteredSources.map(s => [
      s.id,
      s.nom_source,
      s.type_source,
      s.pays_region,
      s.fiabilite_score.toString(),
      s.frequence,
      s.url_principale,
      s.description_courte || ''
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${id}_sources.csv`;
    link.click();
  };

  // Types uniques pour le filtre
  const uniqueTypes = [...new Set(sources.map(s => s.type_source))];

  // ===== RENDU =====
  if (loading) {
    return (
      <div className="loading">
        Chargement des sources...
      </div>
    );
  }

  if (!domain) {
    return (
      <div className="empty">
        Domaine non trouvé
      </div>
    );
  }

  return (
    <>
      {/* HEADER AVEC NAVIGATION ÉLÉGANTE */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
        color: 'white',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        {/* Fil d'Ariane */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link 
            href="/" 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              color: 'rgba(255,255,255,0.8)',
              textDecoration: 'none',
              fontSize: '0.95rem',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
          >
            <ArrowLeft size={16} />
            Accueil
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>/</span>
          <span style={{ fontWeight: 500 }}>{domain.name}</span>
        </div>

        {/* Bouton d'export */}
        <button
          onClick={exportToCsv}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            minWidth: 'auto',
            backdropFilter: 'blur(5px)',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
        >
          <Download size={16} />
          Exporter CSV
        </button>
      </div>

      {/* BANNIÈRE DU DOMAINE - TITRE BIEN SÉPARÉ */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
        color: 'white',
        padding: '4rem 2rem 3rem 2rem',
        marginTop: '-1px'
      }}>
        <div className="container" style={{ padding: '0' }}>
          
          {/* 1. TITRE SEUL - TRÈS VISIBLE */}
          <h1 style={{ 
            fontSize: '4rem', 
            fontWeight: 800, 
            marginBottom: '2rem',
            lineHeight: 1.2,
            textShadow: '0 4px 8px rgba(0,0,0,0.3)',
            letterSpacing: '-0.02em'
          }}>
            {domain.name}
          </h1>
          
          {/* 2. LIGNE DE SÉPARATION ÉLÉGANTE */}
          <div style={{
            width: '100px',
            height: '4px',
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '2px',
            marginBottom: '2rem'
          }} />
          
          {/* 3. DESCRIPTION - CLAIREMENT EN DESSOUS */}
          <p style={{ 
            fontSize: '1.3rem', 
            opacity: 0.95, 
            maxWidth: '900px',
            lineHeight: 1.6,
            marginTop: '0.5rem',
            fontStyle: 'normal',
            fontWeight: 400
          }}>
            {domain.description}
          </p>
          
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="container">
        {/* STATISTIQUES RAPIDES */}
        <div className="quick-stats">
          <div className="stat-card">
            <span className="stat-number">{sources.length}</span>
            <span className="stat-label">Sources totales</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{uniqueTypes.length}</span>
            <span className="stat-label">Types de sources</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {sources.filter(s => s.fiabilite_score >= 4).length}
            </span>
            <span className="stat-label">Sources fiables</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {sources.filter(s => s.pays_region === 'Panafricain').length}
            </span>
            <span className="stat-label">Sources panafricaines</span>
          </div>
        </div>

        {/* TAGS DU DOMAINE */}
        {domain.tags && domain.tags.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <div className="domain-tags" style={{ justifyContent: 'center' }}>
              {domain.tags.map(tag => (
                <span key={tag} className="tag" style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* FILTRES */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '1px solid var(--border)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'transparent',
              border: 'none',
              color: 'var(--dark)',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              minWidth: 'auto',
              padding: 0
            }}
          >
            <Filter size={18} color="var(--primary)" />
            Filtres avancés
          </button>
          
          {showFilters && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginTop: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border)'
            }}>
              <div className="filter-group">
                <label>Type de source</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">Tous les types</option>
                  {uniqueTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>Rechercher</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nom, description..."
                />
              </div>
            </div>
          )}
        </div>

        {/* STATISTIQUES D'AFFICHAGE */}
        <div className="domain-stats">
          <div className="stats-card">
            <span className="stats-number">{filteredSources.length}</span>
            <span className="stats-label">
              source{filteredSources.length > 1 ? 's' : ''} affichée{filteredSources.length > 1 ? 's' : ''}
            </span>
            <span className="stats-total">sur {sources.length} total</span>
          </div>
        </div>

        {/* TABLEAU DES SOURCES */}
        {filteredSources.length === 0 ? (
          <div className="empty-state">
            Aucune source trouvée
          </div>
        ) : (
          <table className="source-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom de la source</th>
                <th>Type</th>
                <th>Région</th>
                <th>Score</th>
                <th>Fréquence</th>
                <th>URL</th>
              </tr>
            </thead>
            <tbody>
              {filteredSources.map(source => (
                <tr key={source.id}>
                  <td><code>{source.id}</code></td>
                  <td>
                    <strong>{source.nom_source}</strong>
                    {source.description_courte && (
                      <><br /><small>{source.description_courte}</small></>
                    )}
                  </td>
                  <td>{source.type_source}</td>
                  <td>{source.pays_region}</td>
                  <td className={
                    source.fiabilite_score >= 4 ? 'score-high' :
                    source.fiabilite_score === 3 ? 'score-medium' : 'score-low'
                  }>
                    {source.fiabilite_score}/5
                  </td>
                  <td>{source.frequence}</td>
                  <td className="url">
                    {source.url_principale && (
                      <a href={source.url_principale} target="_blank" rel="noopener">
                        Lien
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* FOOTER */}
        <footer>
          <p>© 2026 Africa Data Sources — Méta-base collaborative</p>
        </footer>
      </div>
    </>
  );
}