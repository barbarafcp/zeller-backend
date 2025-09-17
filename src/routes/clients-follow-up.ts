import Router from 'koa-router';
import { Context } from 'koa';
import { Client } from '../models/client';
import { Message } from '../models/message';
import { Op } from 'sequelize';

const router = new Router();

// Retorna los clientes cuyo último mensaje fue hace más de 7 días
router.get('/', async (ctx: Context) => {
  try {
    // Fecha de corte: 7 días atrás desde hoy
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Busca todos los clientes junto a sus mensajes
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

    // Filtra clientes cuyo último mensaje es anterior a la fecha de corte
    const clientsToFollowUp = clients.filter(client => {
      const messages = client.Messages || [];
      if (messages.length === 0) return false;
      // Obtiene el mensaje más reciente
      const lastMessage = messages.reduce((prev, curr) =>
        new Date(prev.sentAt) > new Date(curr.sentAt) ? prev : curr
      );
      // Comprueba si ese mensaje tiene más de 7 días
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
