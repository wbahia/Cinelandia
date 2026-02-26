import React, { useEffect, useState } from 'react';
import axios from 'axios'

function App() {
  const [filmes, setFilmes] = useState([])

  useEffect(() => {
    axios.get('http://localhost:3000/api/v1/filmes')
      .then(res => setFilmes(res.data))
      .catch(err => console.error("Erro ao buscar filmes", err))
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Cinelandia - Em Cartaz</h1>
      <ul>
        {filmes.map((f: any) => (
          <li key={f.id}><strong>{f.titulo}</strong> - {f.genero}</li>
        ))}
      </ul>
      {filmes.length === 0 && <p>Nenhum filme encontrado. Já rodou o seed?</p>}
    </div>
  )
}

export default App