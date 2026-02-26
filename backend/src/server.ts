import app from './app';

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Cinelandia rodando na porta ${PORT}`);
  console.log(`Swagger rodando em http://localhost:${PORT}/api-docs`);
});