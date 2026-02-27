import http from 'http';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import router from './routes';
import { initSocketIO } from './websocket/socket';


const app = express();
const httpServer = http.createServer(app);

// Initialize Socket.IO on the same HTTP server
initSocketIO(httpServer);

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: { title: 'Cinelandia API', version: '1.0.0', description: 'Cinelandia - Sistema de Reserva de Cinemas' },
        servers: [{ url: 'http://localhost:3000/api/v1' }]
    },
    apis: [
        './src/app.ts', 
        './src/controllers/*.ts',
        './src/docs/schemas.ts'
    ], 
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use('/api/v1', router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Cinelandia rodando na porta ${PORT}`);
    console.log(`Swagger rodando em http://localhost:${PORT}/api-docs`);
});

export { app, httpServer };