import koa from 'koa';
import koaLogger from 'koa-logger';
import koaBody from 'koa-body';
import router from './routes/routes';

// Create a koa application
const app = new koa();
const port: number = 3000;

app.use(koaLogger());
app.use(koaBody());

app.use(router.routes());

app.use((ctx, next) => (
    ctx.body = "Hello"
));

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});