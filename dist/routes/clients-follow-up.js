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
const koa_router_1 = __importDefault(require("koa-router"));
const client_1 = require("../models/client");
const message_1 = require("../models/message");
const router = new koa_router_1.default();
router.get('/clients-to-do-follow-up', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Calculate the cutoff date: 7 days ago
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        // Find clients whose last message is older than 7 days
        const clients = yield client_1.Client.findAll({
            attributes: ['id', 'name', 'rut'],
            include: [
                {
                    model: message_1.Message,
                    attributes: ['sentAt'],
                    required: true,
                },
            ],
        });
        // Filter clients whose last message was more than 7 days ago
        const clientsToFollowUp = clients.filter(client => {
            const messages = client.Messages || [];
            if (messages.length === 0)
                return false;
            const lastMessage = messages.reduce((prev, curr) => new Date(prev.sentAt) > new Date(curr.sentAt) ? prev : curr);
            return new Date(lastMessage.sentAt) < sevenDaysAgo;
        });
        ctx.body = clientsToFollowUp.map(client => ({
            id: client.id,
            name: client.name,
            rut: client.rut,
        }));
    }
    catch (error) {
        console.error('Error fetching clients to follow up:', error);
        ctx.status = 500;
        ctx.body = { error: 'Internal server error' };
    }
}));
exports.default = router;
