import { Router } from 'express';
import { CategoryController } from './category.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
const controller = new CategoryController();

router.use(authenticateToken);

router.get('/', controller.getCategories);
router.post('/', controller.createCategory);
router.delete('/:id', controller.deleteCategory);

export default router;
