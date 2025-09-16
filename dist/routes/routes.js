"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_router_1 = __importDefault(require("koa-router"));
const clients_1 = __importDefault(require("./clients"));
const router = new koa_router_1.default();
router.use('/clients', clients_1.default.routes(), clients_1.default.allowedMethods());
exports.default = router;
