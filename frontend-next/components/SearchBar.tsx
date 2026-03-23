'use client';

/**
 * COMPOSANT DE RECHERCHE AVANCÉE
 * 
 * Barre de recherche avec :
 * - Auto-complétion en temps réel
 * - Suggestions des 5 premiers résultats
 * - Bouton d'effacement intégré
 * - Indicateur de chargement
 * - Dropdown stylisé
 */

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { searchService } from '@/services/api';
import { Source } from '@/types';
import Link from 'next/link';

export function SearchBar() {
  // ===== ÉTATS =====
  const [query, setQuery] = useState('');                // Texte saisi
  const [results, setResults] = useState<Source[]>([]);  // Résultats de recherche
  const [showResults, setShowResults] = useState(false); // Affichage du dropdown
  const [loading, setLoading] = useState(false);         // État de chargement
  const router = useRouter();

  // ===== RECHERCHE EN TEMPS RÉEL =====
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          const data = await searchService.search(query);
          setResults(data.slice(0, 5)); // Top 5 résultats
          setShowResults(true);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300); // Délai de 300ms pour éviter trop d'appels

    return () => clearTimeout(searchTimeout);
  }, [query]);

  // ===== RENDU =====
  return (
    <div className="filter-group" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      {/* Label */}
      <label htmlFor="search-input">
        Rechercher une source, un domaine, un pays...
      </label>

      {/* Conteneur de l'input */}
      <div style={{ position: 'relative' }}>
        {/* Champ de recherche */}
        <input
          id="search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher..."
          style={{
            width: '100%',
            padding: '0.8rem 1.2rem',
            paddingRight: '5rem',
            fontSize: '1rem',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            background: 'white',
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--primary)';
            e.target.style.boxShadow = '0 0 0 3px rgba(0,102,204,0.15)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border)';
            e.target.style.boxShadow = 'none';
          }}
        />

        {/* Boutons intégrés à droite */}
        <div style={{
          position: 'absolute',
          right: '0.5rem',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          gap: '0.25rem'
        }}>
          {/* Bouton d'effacement (apparaît seulement si du texte est saisi) */}
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '0.5rem',
                cursor: 'pointer',
                minWidth: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--light)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <X size={18} color="var(--gray)" />
            </button>
          )}

          {/* Bouton de recherche */}
          <button
            onClick={() => query && router.push(`/search?q=${encodeURIComponent(query)}`)}
            style={{
              background: 'var(--primary)',
              border: 'none',
              borderRadius: '4px',
              padding: '0.5rem',
              cursor: 'pointer',
              minWidth: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-dark)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
          >
            <Search size={18} color="white" />
          </button>
        </div>

        {/* Indicateur de chargement */}
        {loading && (
          <div style={{
            position: 'absolute',
            right: query ? '6rem' : '3rem',
            top: '50%',
            transform: 'translateY(-50%)'
          }}>
            <div style={{
              width: '1rem',
              height: '1rem',
              border: '2px solid var(--primary)',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
          </div>
        )}

        {/* Dropdown des résultats */}
        {showResults && results.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            marginTop: '0.25rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 1000,
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {/* Liste des résultats */}
            {results.map((result) => (
              <Link
                key={result.id}
                href={`/domain/${result.domainId}`}
                onClick={() => setShowResults(false)}
                style={{
                  display: 'block',
                  padding: '0.75rem 1rem',
                  textDecoration: 'none',
                  borderBottom: '1px solid var(--border)',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--light)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                {/* Nom de la source */}
                <div style={{ fontWeight: 600, color: 'var(--dark)', marginBottom: '0.25rem' }}>
                  {result.nom_source}
                </div>
                
                {/* Métadonnées */}
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                  <span style={{
                    background: 'var(--primary-light)',
                    color: 'var(--primary-dark)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '12px',
                    fontWeight: 500
                  }}>
                    {result.domainName}
                  </span>
                  <span style={{ color: 'var(--gray)' }}>{result.pays_region}</span>
                  <span style={{
                    color: result.fiabilite_score >= 4 ? 'var(--success)' :
                           result.fiabilite_score === 3 ? 'var(--warning)' : 'var(--danger)',
                    fontWeight: 600
                  }}>
                    ★ {result.fiabilite_score}/5
                  </span>
                </div>
              </Link>
            ))}

            {/* Lien vers tous les résultats */}
            {results.length === 5 && (
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={() => setShowResults(false)}
                style={{
                  display: 'block',
                  padding: '0.75rem',
                  textAlign: 'center',
                  color: 'var(--primary)',
                  textDecoration: 'none',
                  fontWeight: 500,
                  background: 'var(--light)',
                  borderTop: '1px solid var(--border)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-light)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--light)'}
              >
                Voir tous les résultats
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Animation keyframes pour le spinner */}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}