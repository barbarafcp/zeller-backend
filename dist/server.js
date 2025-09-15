"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const koa_logger_1 = __importDefault(require("koa-logger"));
const koa_body_1 = __importDefault(require("koa-body"));
const routes_1 = __importDefault(require("./routes/routes"));
const models_1 = __importDefault(require("./models"));
// Create a koa application
const app = new koa_1.default();
const port = 3000;
app.context.orm = models_1.default;
app.use((0, koa_logger_1.default)());
app.use((0, koa_body_1.default)());
app.use(routes_1.default.routes());
app.use((ctx, next) => (ctx.body = "Hello"));
/*
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
*/
module.exports = app;
