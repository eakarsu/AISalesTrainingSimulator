const express = require('express');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const models = require('../models');

// Validate that body is not empty and has at least one field
const validateBody = [
  body().custom((value) => {
    if (!value || Object.keys(value).length === 0) {
      throw new Error('Request body cannot be empty');
    }
    return true;
  })
];

function createCrudRouter(modelName) {
  const router = express.Router();
  const Model = models[modelName];

  // GET all with pagination
  router.get('/', auth, async (req, res) => {
    try {
      const { page = 1, limit = 20, search } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const options = {
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset,
      };

      const { count, rows } = await Model.findAndCountAll(options);

      res.json({
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit)),
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET by id
  router.get('/:id', auth, async (req, res) => {
    try {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST create - with validation
  router.post('/', auth, validateBody, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const item = await Model.create(req.body);
      res.status(201).json(item);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // PUT update - with validation
  router.put('/:id', auth, validateBody, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      await item.update(req.body);
      res.json(item);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // DELETE
  router.delete('/:id', auth, async (req, res) => {
    try {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      await item.destroy();
      res.json({ message: 'Deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}

module.exports = createCrudRouter;
