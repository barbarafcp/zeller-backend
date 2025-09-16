import Router from 'koa-router';
import { Context } from 'koa';
import { Client } from '../models/client';
import { Message } from '../models/message';
import { Op } from 'sequelize';

const router = new Router();

router.get('/clients-to-do-follow-up', async (ctx: Context) => {
  try {
    // Calculate the cutoff date: 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Find clients whose last message is older than 7 days
    const clients = await Client.findAll({
      attributes: ['id', 'name', 'rut'],
      include: [
        {
          model: Message,
          attributes: ['sentAt'],
          required: true,
        },
      ],
    });

    // Filter clients whose last message was more than 7 days ago
    const clientsToFollowUp = clients.filter(client => {
      const messages = client.Messages || [];
      if (messages.length === 0) return false;
      const lastMessage = messages.reduce((prev, curr) =>
        new Date(prev.sentAt) > new Date(curr.sentAt) ? prev : curr
      );
      return new Date(lastMessage.sentAt) < sevenDaysAgo;
    });

    ctx.body = clientsToFollowUp.map(client => ({
      id: client.id,
      name: client.name,
      rut: client.rut,
    }));
  } catch (error) {
    console.error('Error fetching clients to follow up:', error);
    ctx.status = 500;
    ctx.body = { error: 'Internal server error' };
  }
});

export default router;
