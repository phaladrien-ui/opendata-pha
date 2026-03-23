// backend/routes/stats.js
const express = require('express');
const router = express.Router();
const { getAllDomains, getAllSources } = require('../utils/fileReader');

router.get('/', async (req, res) => {
  try {
    const domains = await getAllDomains();
    const sources = await getAllSources();
    
    // Statistiques par type
    const byType = {};
    sources.forEach(s => {
      const type = s.type_source || 'Non spécifié';
      byType[type] = (byType[type] || 0) + 1;
    });
    
    // Statistiques par domaine
    const byDomain = {};
    domains.forEach(d => {
      byDomain[d.name] = sources.filter(s => s.domainId === d.id).length;
    });
    
    // Statistiques de fiabilité
    const byScore = {};
    sources.forEach(s => {
      const score = s.fiabilite_score || 0;
      byScore[score] = (byScore[score] || 0) + 1;
    });
    
    res.json({
      success: true,
      data: {
        totalDomains: domains.length,
        totalSources: sources.length,
        byType,
        byDomain,
        byScore,
        lastUpdate: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;