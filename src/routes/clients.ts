const Router = require('koa-router');
import 'dotenv/config';
import OpenAI from "openai";
import { Context } from 'koa';
import { Client } from '../models/client';
import { Message } from '../models/message';
import { Debt } from '../models/debt';
import { generateMessageForClient } from '../ai/prompt';

const router = new Router();

router.get('/', async (ctx: Context) => {
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

router.get('/:id', async (ctx: Context) => {
  try {
    const clientId = Number(ctx.params.id);
    if (isNaN(clientId)) {
      ctx.status = 400;
      ctx.body = { error: 'Invalid client ID' };
      return;
    }

    const client = await Client.findByPk(clientId, {
      attributes: ['id', 'name', 'rut'],
      include: [
        {
          model: Message,
          attributes: ['id', 'text', 'sentAt', 'role'],
        },
        {
          model: Debt,
          attributes: ['id', 'amount', 'institution', 'dueDate'],
        },
      ],
    });

    if (!client) {
      ctx.status = 404;
      ctx.body = { error: 'Client not found' };
      return;
    }

    ctx.body = client;
  } catch (error) {
    console.error('Error fetching client by ID:', error);
    ctx.status = 500;
    ctx.body = { error: 'Internal server error' };
  }
});

router.post('/', async (ctx: Context) => {
  try {
    const { name, rut, messages, debts } = ctx.request.body;

    if (!name || !rut) {
      ctx.status = 400;
      ctx.body = { error: 'Name and RUT are required' };
      return;
    }

    const newClient = await Client.create(
      {
        name,
        rut,
        Messages: messages?.map((m: any) => ({
          text: m.text,
          role: m.role,
          sentAt: m.sentAt,
        })),
        Debts: debts?.map((d: any) => ({
          amount: d.amount,
          institution: d.institution,
          dueDate: d.dueDate,
        })),
      },
      {
        include: [Message, Debt],
      }
    );

    ctx.status = 201;
    ctx.body = newClient;
  } catch (error) {
    console.error('Error creating client:', error);
    ctx.status = 500;
    ctx.body = { error: 'Internal server error' };
  }
});

router.post('/:id/message', async (ctx: Context) => {
  try {
    const clientId = Number(ctx.params.id);
    if (isNaN(clientId)) {
      ctx.status = 400;
      ctx.body = { error: 'Invalid client ID' };
      return;
    }

    const client = await Client.findByPk(clientId);
    if (!client) {
      ctx.status = 404;
      ctx.body = { error: 'Client not found' };
      return;
    }

    const { text, sentAt, role } = ctx.request.body;
    if (!text|| !role) {
      ctx.status = 400;
      ctx.body = { error: 'Text, sentAt, and role are required' };
      return;
    }

    const sentAtValue = sentAt ? new Date(sentAt) : new Date();

    const message = await Message.create({
      clientId,
      text,
      sentAt: sentAtValue,
      role,
    });

    ctx.status = 201;
    ctx.body = message;
  } catch (error) {
    console.error('Error creating message:', error);
    ctx.status = 500;
    ctx.body = { error: 'Internal server error' };
  }
});

router.get("/:id/generateMessage", async (ctx: Context) => {
  const clientId = Number(ctx.params.id);
  if (!Number.isFinite(clientId)) {
    ctx.status = 400;
    ctx.body = { error: "Invalid client ID" };
    return;
  }

  const client = await Client.findByPk(clientId, {
    include: [Message],
    order: [[Message, "sentAt", "ASC"]],
  });
  if (!client) {
    ctx.status = 404;
    ctx.body = { error: "Client not found" };
    return;
  }

  try {
    const created = await generateMessageForClient(client);

    ctx.body = {
      id: created.id,
      client_id: created.clientId,
      role: created.role,
      text: created.text,
      sent_at: created.sentAt.toISOString(),
    };
  } catch (err: any) {
    console.error(err);
    ctx.status = 500;
    ctx.body = { error: err.message || "Failed to generate message" };
  }
});

export default router;


