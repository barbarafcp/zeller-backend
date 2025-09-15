const Router = require('koa-router');
import { Context } from 'koa';
import { Client } from '../models/client';

const router = new Router();

router.get('/clients', async (ctx: Context) => {
  try {
    const clients = await Client.findAll({
      attributes: ['id', 'name', 'rut'],
      order: [['id', 'ASC']]
    });
    ctx.body = clients;
  } catch (error) {
    console.error('Error fetching clients:', error);
    ctx.status = 500;
    ctx.body = { error: 'Internal server error' };
  }
});

export default router;