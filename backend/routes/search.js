// backend/routes/search.js
const express = require('express');
const router = express.Router();
const { getAllSources } = require('../utils/fileReader');

router.get('/', async (req, res) => {
  try {
    const { q, type, domain } = req.query;
    const sources = await getAllSources();
    
    let results = sources;
    
    // Filtre par recherche textuelle
    if (q) {
      const searchLower = q.toLowerCase();
      results = results.filter(s => 
        (s.nom_source || '').toLowerCase().includes(searchLower) ||
        (s.description_courte || '').toLowerCase().includes(searchLower) ||
        (s.pays_region || '').toLowerCase().includes(searchLower)
      );
    }
    
    // Filtre par type
    if (type && type !== 'all') {
      results = results.filter(s => s.type_source === type);
    }
    
    // Filtre par domaine
    if (domain && domain !== 'all') {
      results = results.filter(s => s.domainId === domain);
    }
    
    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;