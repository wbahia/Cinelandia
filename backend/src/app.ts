import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { prisma } from './lib/prisma';
import router from './routes';

const app = express();
app.use(cors());
app.use(express.json());

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: { title: 'Cinelandia API', version: '1.0.0', description: 'Cinelandia - Sistema de Reserva de Cinemas' },
        servers: [{ url: 'http://localhost:3000/api/v1' }]
    },
    apis: ['./src/app.ts', './src/controllers/*.ts'], 
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use('/api/v1', router);

export default app;