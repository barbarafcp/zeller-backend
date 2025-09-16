import Router from 'koa-router';

import clientsRouter from './clients';

const router = new Router();

router.use('/clients', clientsRouter.routes(), clientsRouter.allowedMethods());

export default router;
