import { body, param, query } from 'express-validator';

export const idParam = [param('id').isInt({ min: 1 }).toInt()];

export const listQuery = [
  query('q').optional().isString().trim().isLength({ min: 1 }).escape(),
  query('dienstverband')
    .optional()
    .isIn(['fulltime', 'parttime', 'zzp', 'stage']),
  query('actief').optional().isInt({ min: 0, max: 1 }).toInt(),
  query('page').optional().isInt({ min: 1 }).toInt().default(1),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt().default(10)
];

export const createRules = [
  body('werkgever_id').isInt({ min: 1 }).withMessage('werkgever_id vereist').toInt(),
  body('titel').isString().trim().isLength({ min: 3, max: 180 }),
  body('beschrijving').isString().trim().isLength({ min: 10 }),
  body('locatie').isString().trim().isLength({ min: 2, max: 120 }),
  body('dienstverband')
    .optional({ nullable: true })
    .isIn(['fulltime', 'parttime', 'zzp', 'stage'])
    .default('fulltime'),
  body('salaris_min').optional({ nullable: true }).isInt({ min: 0 }).toInt(),
  body('salaris_max').optional({ nullable: true }).isInt({ min: 0 }).toInt(),
  body('actief').optional({ nullable: true }).isInt({ min: 0, max: 1 }).toInt().default(1),
  body('tags').optional({ nullable: true }).isArray()
];

// Update allows partial payloads
export const updateRules = [
  body('werkgever_id').optional({ nullable: true }).isInt({ min: 1 }).toInt(),
  body('titel').optional({ nullable: true }).isString().trim().isLength({ min: 3, max: 180 }),
  body('beschrijving').optional({ nullable: true }).isString().trim().isLength({ min: 10 }),
  body('locatie').optional({ nullable: true }).isString().trim().isLength({ min: 2, max: 120 }),
  body('dienstverband')
    .optional({ nullable: true })
    .isIn(['fulltime', 'parttime', 'zzp', 'stage']),
  body('salaris_min').optional({ nullable: true }).isInt({ min: 0 }).toInt(),
  body('salaris_max').optional({ nullable: true }).isInt({ min: 0 }).toInt(),
  body('actief').optional({ nullable: true }).isInt({ min: 0, max: 1 }).toInt(),
  body('tags').optional({ nullable: true }).isArray()
];
