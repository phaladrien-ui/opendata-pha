// backend/routes/domains.js
const express = require('express');
const router = express.Router();
const { getAllDomains, getDomainSources, readDomainFile } = require('../utils/fileReader');

// GET /api/domains - Liste tous les domaines
router.get('/', async (req, res) => {
  try {
    const domains = await getAllDomains();
    res.json({
      success: true,
      count: domains.length,
      data: domains
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/domains/:id - Détail d'un domaine
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const meta = await readDomainFile(id, 'meta.json');
    const sources = await getDomainSources(id);
    
    if (!meta) {
      return res.status(404).json({ success: false, error: 'Domaine non trouvé' });
    }
    
    res.json({
      success: true,
      data: {
        ...meta,
        id,
        sourceCount: Object.keys(sources).length,
        sources
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/domains/:id/sources - Liste des sources d'un domaine
router.get('/:id/sources', async (req, res) => {
  try {
    const { id } = req.params;
    const sources = await getDomainSources(id);
    
    res.json({
      success: true,
      count: Object.keys(sources).length,
      data: sources
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;