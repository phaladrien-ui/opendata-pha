export interface Source {
    id: string;
    nom_source: string;
    type_source: string;
    pays_region: string;
    fiabilite_score: number;
    frequence: string;
    url_principale: string;
    description_courte?: string;
    domainId: string;
    domainName: string;
  }
  
  export interface Domain {
    id: string;
    name: string;
    description: string;
    tags: string[];
    sourceCount?: number;
  }
  
  export interface DomainDetail extends Domain {
    sources: Record<string, Source>;
    sourceCount: number;
  }
  
  export interface Stats {
    totalDomains: number;
    totalSources: number;
    byType: Record<string, number>;
    byDomain: Record<string, number>;
    byScore: Record<string, number>;
    lastUpdate: string;
  }
  
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    count?: number;
    error?: string;
  }