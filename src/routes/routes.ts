import Router from 'koa-router';
import clientsRouter from './clients';
import clientsFollowUpRouter from './clients-follow-up'

const router = new Router();

router.use('/clients', clientsRouter.routes(), clientsRouter.allowedMethods());
router.use('/clients-to-do-follow-up', clientsFollowUpRouter.routes(), clientsFollowUpRouter.allowedMethods());

export default router;
