const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/categoryTypeController');
router.get('/public', ctrl.getAllPublic);
router.get('/public/:code', ctrl.getOnePublicByCode);
router.route('/')
  .get(ctrl.getAll)
  .post(ctrl.create);

router.route('/:id')
  .get(ctrl.getById)
  .put(ctrl.update)
  .delete(ctrl.delete);



module.exports = router; 