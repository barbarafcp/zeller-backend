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
const router = new Router();
router.get('/clients', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.default = router;
