import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { prisma } from './lib/prisma';

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

/**
 * @openapi
 * /filmes:
 *   get:
 *     summary: Lista todos os filmes
 *     description: Retorna a lista de filmes em cartaz.
 *     responses:
 *       200:
 *         description: Sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   titulo:
 *                     type: string
 */
app.get('/api/v1/filmes', async (req, res) => {
    const filmes = await prisma.filme.findMany();
    res.json(filmes);
});

export default app;