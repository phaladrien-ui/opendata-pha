#!/usr/bin/env python3
# test_domains.py - Vérifie que tous les domaines sont valides

import json
from pathlib import Path
import sys

def test_all_domains():
    domains_path = Path(__file__).parent.parent / "domains"
    errors = []
    
    print("🔍 Vérification de tous les domaines...\n")
    
    for domain_dir in domains_path.iterdir():
        if not domain_dir.is_dir():
            continue
            
        print(f"📁 {domain_dir.name}/")
        
        # Vérifier sources.json
        sources_file = domain_dir / "sources.json"
        if not sources_file.exists():
            errors.append(f"❌ {domain_dir.name}: sources.json manquant")
            continue
            
        try:
            with open(sources_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            if 'sources' not in data:
                errors.append(f"❌ {domain_dir.name}: pas de clé 'sources'")
            else:
                count = len(data['sources'])
                print(f"   ✅ {count} sources trouvées")
                
        except json.JSONDecodeError:
            errors.append(f"❌ {domain_dir.name}: JSON invalide")
            
        # Vérifier meta.json (optionnel)
        meta_file = domain_dir / "meta.json"
        if meta_file.exists():
            try:
                with open(meta_file, 'r', encoding='utf-8') as f:
                    meta = json.load(f)
                if 'nom' in meta:
                    print(f"   ℹ️  {meta['nom']}")
            except:
                errors.append(f"⚠️  {domain_dir.name}: meta.json invalide")
        
        print()
    
    if errors:
        print("\n".join(errors))
        return False
    
    print("✅ Tous les domaines sont valides !")
    return True

if __name__ == "__main__":
    success = test_all_domains()
    sys.exit(0 if success else 1)