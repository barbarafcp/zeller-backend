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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require('koa-router');
require("dotenv/config");
const openai_1 = __importDefault(require("openai"));
const client_1 = require("../models/client");
const message_1 = require("../models/message");
const debt_1 = require("../models/debt");
const prompt_1 = require("../ai/prompt");
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
            include: [
                {
                    model: message_1.Message,
                    attributes: ['id', 'text', 'sentAt', 'role'],
                },
                {
                    model: debt_1.Debt,
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
            include: [message_1.Message, debt_1.Debt],
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
router.post('/:id/message', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clientId = Number(ctx.params.id);
        if (isNaN(clientId)) {
            ctx.status = 400;
            ctx.body = { error: 'Invalid client ID' };
            return;
        }
        const client = yield client_1.Client.findByPk(clientId);
        if (!client) {
            ctx.status = 404;
            ctx.body = { error: 'Client not found' };
            return;
        }
        const { text, sentAt, role } = ctx.request.body;
        if (!text || !sentAt || !role) {
            ctx.status = 400;
            ctx.body = { error: 'Text, sentAt, and role are required' };
            return;
        }
        const message = yield message_1.Message.create({
            clientId,
            text,
            sentAt,
            role,
        });
        ctx.status = 201;
        ctx.body = message;
    }
    catch (error) {
        console.error('Error creating message:', error);
        ctx.status = 500;
        ctx.body = { error: 'Internal server error' };
    }
}));
router.get("/:id/generateMessage", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    const clientId = Number(ctx.params.id);
    if (!Number.isFinite(clientId)) {
        ctx.status = 400;
        ctx.body = { error: "Invalid client ID" };
        return;
    }
    const client = yield client_1.Client.findByPk(clientId, {
        include: [message_1.Message],
        order: [[message_1.Message, "sentAt", "ASC"]],
    });
    if (!client) {
        ctx.status = 404;
        ctx.body = { error: "Client not found" };
        return;
    }
    //const name = client?.name || "cliente";
    const history = (0, prompt_1.mapHistoryToOpenAI)((_a = client === null || client === void 0 ? void 0 : client.Messages) !== null && _a !== void 0 ? _a : []).slice(-20);
    const messages = [prompt_1.systemMsg, ...history];
    //const morosa = hasDelinquency(client?.Debts ?? []);
    //const financeFlag = morosa ? "NO_ELEGIBLE_FINANCIAMIENTO" : "ELEGIBLE_FINANCIAMIENTO";
    const apiKey = (_b = process.env.OPENAI_API_KEY) === null || _b === void 0 ? void 0 : _b.trim();
    if (!apiKey) {
        ctx.status = 500;
        ctx.body = { error: "Missing OPENAI_API_KEY" };
        return;
    }
    const openai = new openai_1.default({ apiKey });
    let text = "";
    try {
        const completion = yield openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.6,
            max_tokens: 100,
            messages,
        });
        text = (_g = (_f = (_e = (_d = (_c = completion.choices) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.message) === null || _e === void 0 ? void 0 : _e.content) === null || _f === void 0 ? void 0 : _f.trim()) !== null && _g !== void 0 ? _g : "";
    }
    catch (e) {
        console.error("OpenAI error:", (e === null || e === void 0 ? void 0 : e.status) || (e === null || e === void 0 ? void 0 : e.message) || e);
    }
    if (!text) {
        ctx.status = 204;
        return;
    }
    const now = new Date();
    const created = yield message_1.Message.create({ clientId, role: "agent", text, sentAt: now });
    ctx.body = {
        id: created.id,
        client_id: created.clientId,
        role: created.role,
        text: created.text,
        sent_at: now.toISOString(),
    };
}));
exports.default = router;
