'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchService, domainService } from '@/services/api';
import { Source, Domain } from '@/types';
import Link from 'next/link';
import { ArrowLeft, Globe, Calendar, Star, Filter } from 'lucide-react';

// Composant qui utilise useSearchParams
function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<Source[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    domain: 'all',
    minScore: 0
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [searchResults, domainsData] = await Promise.all([
          searchService.search(query),
          domainService.getAll()
        ]);
        setResults(searchResults);
        setDomains(domainsData);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchData();
    }
  }, [query]);

  const filteredResults = results.filter(result => {
    if (filters.type !== 'all' && result.type_source !== filters.type) return false;
    if (filters.domain !== 'all' && result.domainId !== filters.domain) return false;
    if (result.fiabilite_score < filters.minScore) return false;
    return true;
  });

  const types = [...new Set(results.map(r => r.type_source))];

  if (loading) {
    return <div className="loading">Chargement des résultats...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Ton code existant... */}
      <div className="mb-8">
        <Link href="/" className="back-link">← Retour à l'accueil</Link>
        <h1 className="text-3xl font-bold">Résultats pour "{query}"</h1>
        <p>{filteredResults.length} résultat(s)</p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-8 border border-gray-200">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-gray-700 font-medium"
        >
          <Filter className="w-4 h-4" />
          Filtres avancés
        </button>
        
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type de source</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="all">Tous les types</option>
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Domaine</label>
              <select
                value={filters.domain}
                onChange={(e) => setFilters({...filters, domain: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="all">Tous les domaines</option>
                {domains.map(domain => (
                  <option key={domain.id} value={domain.id}>{domain.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Score minimum : {filters.minScore}/5
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={filters.minScore}
                onChange={(e) => setFilters({...filters, minScore: parseInt(e.target.value)})}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Résultats */}
      {filteredResults.length === 0 ? (
        <div className="empty-state">Aucun résultat trouvé</div>
      ) : (
        <div className="space-y-4">
          {filteredResults.map((result) => (
            <Link
              key={result.id}
              href={`/domain/${result.domainId}`}
              className="block bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold">{result.nom_source}</h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {result.domainName}
                  </span>
                </div>
                
                {result.description_courte && (
                  <p className="text-gray-600 mb-4">{result.description_courte}</p>
                )}
                
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                    {result.type_source}
                  </span>
                  
                  <span className="flex items-center text-gray-600">
                    <Globe className="w-4 h-4 mr-1" />
                    {result.pays_region}
                  </span>
                  
                  <span className={`flex items-center px-2 py-1 rounded-full border ${
                    result.fiabilite_score >= 4 ? 'text-green-600 bg-green-50' :
                    result.fiabilite_score === 3 ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50'
                  }`}>
                    <Star className="w-3 h-3 mr-1" />
                    {result.fiabilite_score}/5
                  </span>
                  
                  <span className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-1" />
                    {result.frequence}
                  </span>
                </div>
                
                {result.url_principale && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <a
                      href={result.url_principale}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
                    >
                      Accéder à la source
                      <ArrowLeft className="w-3 h-3 ml-1 rotate-180" />
                    </a>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Page principale avec Suspense
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="loading">Chargement...</div>}>
      <SearchContent />
    </Suspense>
  );
}