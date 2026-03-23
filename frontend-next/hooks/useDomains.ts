import { useState, useEffect } from 'react';
import { domainService, statsService } from '@/services/api';
import { Domain, Stats, Source } from '@/types';

export function useDomains() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [domainsData, statsData] = await Promise.all([
          domainService.getAll(),
          statsService.getStats()
        ]);
        setDomains(domainsData);
        setStats(statsData);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { domains, stats, loading, error };
}

export function useDomain(id: string) {
  const [domain, setDomain] = useState<Domain | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDomain = async () => {
      try {
        setLoading(true);
        const [domainData, sourcesData] = await Promise.all([
          domainService.getById(id),
          domainService.getSources(id)
        ]);
        setDomain(domainData);
        setSources(sourcesData);
      } catch (err) {
        setError('Erreur lors du chargement du domaine');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDomain();
    }
  }, [id]);

  return { domain, sources, loading, error };
}