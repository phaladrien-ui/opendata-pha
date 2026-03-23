"use client";

import { useDomains } from '@/hooks/useDomains';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';

const iconMap: Record<string, string> = {
  'demographie': '👥',
  'economie': '📊',
  'sante': '🏥',
  'education': '📚',
  'agriculture': '🌾',
  'infrastructures': '🏗️',
  'energie': '⚡',
  'telecom': '📡',
  'gouvernance': '⚖️',
  'transport': '🚢',
  'recherche': '🔬',
  'social': '🤝'
};

export default function Home() {
  const { domains, stats, loading, error } = useDomains();

  if (loading) {
    return <div className="loading">Chargement des sources...</div>;
  }

  if (error) {
    return <div className="empty">{error}</div>;
  }

  return (
    <>
      <header>
        <h1>Africa Data Sources</h1>
        <div className="subtitle">
          La référence centralisée des sources de données africaines — <strong>{stats?.totalSources || 0} sources validées</strong>
        </div>
      </header>

      <main className="controls" style={{ justifyContent: 'center' }}>
        <SearchBar />
      </main>

      <div className="container">
        {stats && (
          <div className="quick-stats">
            <div className="stat-card">
              <span className="stat-number">{stats.totalDomains}</span>
              <span className="stat-label">Domaines</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.totalSources}</span>
              <span className="stat-label">Sources totales</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{Object.keys(stats.byType).length}</span>
              <span className="stat-label">Types de sources</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.byScore['5'] || 0}+</span>
              <span className="stat-label">Sources ⭐ 5/5</span>
            </div>
          </div>
        )}

        <h2 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--dark)' }}>
          Explorez par domaine
        </h2>

        <div className="domains-grid">
          {domains.map((domain) => {
            const sourceCount = stats?.byDomain[domain.name] || 0;
            return (
              <Link href={`/domain/${domain.id}`} key={domain.id} style={{ textDecoration: 'none' }}>
                <div className="domain-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span className="domain-icon">{iconMap[domain.id] || '📁'}</span>
                    <span className="source-count-badge">{sourceCount} sources</span>
                  </div>
                  <h3 className="domain-name">{domain.name}</h3>
                  <p className="domain-description">{domain.description}</p>
                  <div className="domain-tags">
                    {domain.tags?.slice(0, 3).map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  <div className="domain-meta">
                    <span className="view-link">
                      Explorer le domaine
                      <ChevronRight style={{ width: '1rem', height: '1rem' }} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <footer>
          <p>© 2026 Africa Data Sources — Méta-base collaborative</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Données mises à jour le {stats?.lastUpdate ? new Date(stats.lastUpdate).toLocaleDateString('fr-FR') : '...'}
          </p>
        </footer>
      </div>
    </>
  );
}