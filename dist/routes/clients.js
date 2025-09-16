"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require('koa-router');
const client_1 = require("../models/client");
const message_1 = require("../models/message");
const debt_1 = require("../models/debt");
const router = new Router();
router.get('/', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clients = yield client_1.Client.findAll({
            attributes: ['id', 'name', 'rut'],
            order: [['id', 'ASC']]
        });
        ctx.body = clients;
    }
    catch (error) {
        console.error('Error fetching clients:', error);
        ctx.status = 500;
        ctx.body = { error: 'Internal server error' };
    }
}));
router.get('/:id', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clientId = Number(ctx.params.id);
        if (isNaN(clientId)) {
            ctx.status = 400;
            ctx.body = { error: 'Invalid client ID' };
            return;
        }
        const client = yield client_1.Client.findByPk(clientId, {
            attributes: ['id', 'name', 'rut'],
        });
        if (!client) {
            ctx.status = 404;
            ctx.body = { error: 'Client not found' };
            return;
        }
        ctx.body = client;
    }
    catch (error) {
        console.error('Error fetching client by ID:', error);
        ctx.status = 500;
        ctx.body = { error: 'Internal server error' };
    }
}));
router.post('/', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, rut, messages, debts } = ctx.request.body;
        if (!name || !rut) {
            ctx.status = 400;
            ctx.body = { error: 'Name and RUT are required' };
            return;
        }
        const newClient = yield client_1.Client.create({
            name,
            rut,
            Messages: messages === null || messages === void 0 ? void 0 : messages.map((m) => ({
                text: m.text,
                role: m.role,
                sentAt: m.sentAt,
            })),
            Debts: debts === null || debts === void 0 ? void 0 : debts.map((d) => ({
                amount: d.amount,
                institution: d.institution,
                dueDate: d.dueDate,
            })),
        }, {
            include: [message_1.Message, debt_1.Debt], // This ensures nested creation
        });
        ctx.status = 201;
        ctx.body = newClient;
    }
    catch (error) {
        console.error('Error creating client:', error);
        ctx.status = 500;
        ctx.body = { error: 'Internal server error' };
    }
}));
exports.default = router;
