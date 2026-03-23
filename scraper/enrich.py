#!/usr/bin/env python3
# enrich.py - Scraper intelligent pour Africa Data Sources
# Usage: python enrich.py [domaine] (optionnel: domaine spécifique)

import requests
from bs4 import BeautifulSoup
import json
import os
import sys
import time
from pathlib import Path
import re

class DomainEnricher:
    def __init__(self, base_path="../domains"):
        self.base_path = Path(__file__).parent / base_path
        self.sources_found = {}
        
        # Configuration par domaine
        self.config = {
            "demographie": {
                "keywords": [
                    "population", "demography", "census", "migration", 
                    "fertility", "mortality", "urbanisation", "unfpa",
                    "world population", "dhs program"
                ],
                "sites": [
                    "https://population.un.org/wpp/",
                    "https://www.unfpa.org/data",
                    "https://dhsprogram.com/",
                    "https://www.worldpop.org/",
                    "https://www.migrationdataportal.org/"
                ],
                "type_default": "Organisations_Internationales"
            },
            "economie": {
                "keywords": [
                    "economic outlook", "gdp", "inflation", "debt", 
                    "trade", "investment", "imf", "world bank",
                    "african development bank", "macroeconomic"
                ],
                "sites": [
                    "https://data.worldbank.org/",
                    "https://www.afdb.org/en/knowledge/publications",
                    "https://www.imf.org/en/Publications/REO",
                    "https://ecastats.uneca.org/data/",
                    "https://opendataforafrica.org/"
                ],
                "type_default": "Organisations_Internationales"
            }
        }

    def get_next_id(self, domain, prefix="INT"):
        """Génère le prochain ID disponible pour un domaine"""
        sources_file = self.base_path / domain / "sources.json"
        
        if not sources_file.exists():
            return f"{domain[:4].upper()}-{prefix}-001"
        
        with open(sources_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        existing_ids = list(data.get('sources', {}).keys())
        
        # Chercher le plus grand numéro
        max_num = 0
        for sid in existing_ids:
            match = re.search(r'(\d{3})$', sid)
            if match:
                num = int(match.group(1))
                max_num = max(max_num, num)
        
        next_num = max_num + 1
        prefix_domain = domain[:4].upper()
        return f"{prefix_domain}-{prefix}-{next_num:03d}"

    def scrape_domain(self, domain):
        """Scrape de nouvelles sources pour un domaine"""
        if domain not in self.config:
            print(f"⚠️  Domaine '{domain}' non configuré pour le scraping")
            return []
        
        cfg = self.config[domain]
        new_sources = []
        
        print(f"🔍 Scraping {domain}...")
        
        for url in cfg['sites']:
            try:
                print(f"  → {url}")
                headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
                r = requests.get(url, timeout=15, headers=headers)
                soup = BeautifulSoup(r.text, 'html.parser')
                
                for link in soup.find_all('a', href=True):
                    text = link.get_text().strip()
                    if len(text) < 15 or len(text) > 150:
                        continue
                    
                    # Vérifier si le texte contient des mots-clés
                    if any(kw.lower() in text.lower() for kw in cfg['keywords']):
                        href = link['href']
                        full_url = href if href.startswith('http') else url.rstrip('/') + '/' + href.lstrip('/')
                        
                        source = {
                            "nom_source": text[:100],
                            "type_source": cfg['type_default'],
                            "pays_region": "Panafricain",
                            "fiabilite_score": 4,
                            "frequence": "Annuel",
                            "url_principale": full_url,
                            "description_courte": f"Source découverte automatiquement"
                        }
                        
                        new_sources.append(source)
                        print(f"    ✅ {text[:60]}...")
                        
                        if len(new_sources) >= 10:  # Max 10 par domaine pour l'instant
                            break
                
                time.sleep(1.5)  # Politesse
                
            except Exception as e:
                print(f"    ❌ Erreur: {str(e)[:50]}")
        
        return new_sources

    def enrich_domain(self, domain, max_sources=10):
        """Enrichit un domaine avec de nouvelles sources"""
        sources_file = self.base_path / domain / "sources.json"
        
        # Charger les sources existantes
        if sources_file.exists():
            with open(sources_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
        else:
            data = {"sources": {}}
        
        # Scraper de nouvelles sources
        new_sources = self.scrape_domain(domain)
        
        # Ajouter les nouvelles sources avec des IDs appropriés
        for source in new_sources[:max_sources]:
            new_id = self.get_next_id(domain)
            data['sources'][new_id] = source
            print(f"  ➕ Ajouté: {new_id}")
        
        # Sauvegarder
        os.makedirs(self.base_path / domain, exist_ok=True)
        with open(sources_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        return len(new_sources)

    def enrich_all(self):
        """Enrichit tous les domaines configurés"""
        results = {}
        for domain in self.config.keys():
            if (self.base_path / domain).exists():
                count = self.enrich_domain(domain)
                results[domain] = count
            else:
                print(f"⚠️  Domaine '{domain}' non trouvé, création...")
                os.makedirs(self.base_path / domain, exist_ok=True)
                count = self.enrich_domain(domain)
                results[domain] = count
        
        return results

def main():
    enricher = DomainEnricher()
    
    if len(sys.argv) > 1:
        # Enrichir un domaine spécifique
        domain = sys.argv[1].lower()
        if domain in enricher.config:
            count = enricher.enrich_domain(domain)
            print(f"\n✅ {count} nouvelles sources ajoutées à {domain}")
        else:
            print(f"❌ Domaine '{domain}' non reconnu")
            print("Domaines disponibles:", ', '.join(enricher.config.keys()))
    else:
        # Enrichir tous les domaines
        results = enricher.enrich_all()
        print("\n📊 Résumé de l'enrichissement:")
        for domain, count in results.items():
            print(f"  • {domain}: {count} nouvelles sources")
        print("\n✅ Enrichissement terminé!")

if __name__ == "__main__":
    main()