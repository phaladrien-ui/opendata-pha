# Africa Data Sources

Méta-base centralisée des sources de données africaines, organisée par domaine.

## 📁 Structure du projet
OpenData/
├── domains/ # Sources par domaine
│ ├── demographie/ # Démographie & Population
│ │ ├── sources.json # Les sources
│ │ └── meta.json # Métadonnées du domaine
│ ├── economie/
│ └── ... (autres domaines)
│
├── core/ # Cœur du système
│ ├── loader.js # Charge les domaines
│ └── validator.js # Valide la structure
│
├── scraper/
│ └── enrich.py # Scraper intelligent
│
├── frontend/ # Interface web
│ ├── index.html
│ ├── style.css
│ └── script.js
│
├── docs/ # Documentation
├── tests/ # Tests
└── config.json # Configuration globale

text

## 🚀 Utilisation

### Ajouter un nouveau domaine
1. Créer un dossier dans `domains/`
2. Ajouter `sources.json` et `meta.json`
3. Le domaine est automatiquement détecté

### Enrichir avec le scraper
```bash
# Enrichir tous les domaines
python scraper/enrich.py

# Enrichir un domaine spécifique
python scraper/enrich.py demographie
Valider la structure
bash
node core/validator.js
📊 Domaines disponibles
Démographie & Population

Économie & Finance

Santé (à venir)

Éducation (à venir)

Agriculture & Climat (à venir)

Infrastructures & Urbanisme (à venir)

Énergie (à venir)

Télécom & Numérique (à venir)

Gouvernance & Politique (à venir)

Transport & Logistique (à venir)

Recherche & Innovation (à venir)

Social & Emploi (à venir)

🔧 Format des sources
Chaque source doit respecter ce format :

json
"ID-UNIQUE-001": {
  "nom_source": "Nom complet",
  "type_source": "Organisations_Internationales",
  "pays_region": "Panafricain",
  "fiabilite_score": 5,
  "frequence": "Annuel",
  "url_principale": "https://...",
  "description_courte": "Description concise"
}
✅ Bonnes pratiques
Un fichier par domaine dans domains/

IDs au format DOMAINE-TYPE-001

Scores de fiabilité de 1 à 5

Descriptions claires et data-centric

URLs valides et accessibles

text

**Voilà !** L'architecture est complète, propre et scalable.

Maintenant tu peux :
1. **Lancer le scraper** : `python scraper/enrich.py`
2. **Valider** : `node core/validator.js`
3. **Voir le frontend** : ouvre `frontend/index.html`

Chaque domaine est indépendant, 100 personnes peuvent bosser dessus sans conflit. C'est propre.
