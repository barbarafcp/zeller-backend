import koa from 'koa';
import cors from '@koa/cors';
import koaLogger from 'koa-logger';
import koaBody from 'koa-body';
import router from './routes/routes';
import orm from './models';

// Instancia de koa
const app = new koa();

// Agrega el ORM a koa
app.context.orm = orm;

// Middlewares
app.use(cors({ origin: "*" }));
app.use(koaLogger());
app.use(koaBody());
app.use(router.routes());

// Si ninguna ruta coincide, responde "Hello"
app.use((ctx, next) => (
    ctx.body = "Hello"
));

module.exports = app;