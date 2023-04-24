import fastify from "fastify";
// import { User } from 'common/types';

const app = fastify();

app.get('/', (request) => {
  return {
    message: 'Teste'
  }
});

app.listen({
  host: '0.0.0.0',
  port: process.env.PORT ? Number(process.env.PORT) : 3333
}).then(() => {
  console.log('Coup Server Running');
});

// const user:User = {
  
// }
