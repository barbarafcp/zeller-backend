import koa from 'koa';
import koaLogger from 'koa-logger';
import koaBody from 'koa-body';
import router from './routes/routes';
import orm from './models';

// Create a koa application
const app = new koa();
const port: number = 3000;

app.context.orm = orm;

app.use(koaLogger());
app.use(koaBody());

app.use(router.routes());

app.use((ctx, next) => (
    ctx.body = "Hello"
));

/*
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
*/

module.exports = app;