import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { listQuery, idParam, createRules, updateRules } from '../../validators/vacatures.validators.js';
import * as ctrl from '../../controllers/vacatures.controller.js';

const router = Router();

router.get('/', validate(listQuery), ctrl.list);
router.get('/:id', validate(idParam), ctrl.getById);
router.post('/', validate(createRules), ctrl.create);
router.put('/:id', validate([...idParam, ...updateRules]), ctrl.update);
router.delete('/:id', validate(idParam), ctrl.remove);

export default router;

