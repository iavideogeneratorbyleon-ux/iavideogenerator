import React, { useState } from 'react';

function App() {
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleGenerateAudio = async () => {
    if (!text.trim()) {
      alert('Por favor escribe algún texto.');
      return;
    }

    setLoading(true);
    setStatus('⏳ Generando audio, por favor espera...');
    setAudioUrl(null);

    try {
      const response = await fetch('http://localhost:3030/api/audio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error('Error al conectar con el servidor o procesar el audio');
      }

      // Convertimos la respuesta binaria en un Blob URL reproducible
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      setAudioUrl(url);
      setStatus('✅ ¡Audio generado y listo para reproducir!');
    } catch (error) {
      console.error(error);
      setStatus('❌ Hubo un error al generar el audio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '30px', fontFamily: 'Arial, sans-serif', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2>Generador de Audio IA (React + TypeScript)</h2>
      <p>Escribe un texto para enviarlo a tu API de Express y convertirlo en voz con ElevenLabs:</p>
      
      <textarea 
        value={text} 
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
        placeholder="Ej. ¡Hola! Este es mi sistema modular con React, Express y ElevenLabs."
        style={{ width: '100%', height: '100px', padding: '10px', fontSize: '16px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
      />
      
      <button 
        onClick={handleGenerateAudio} 
        disabled={loading}
        style={{ backgroundColor: loading ? '#ccc' : '#4CAF50', color: 'white', border: 'none', padding: '12px 20px', fontSize: '16px', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', width: '100%' }}
      >
        {loading ? 'Generando...' : 'Generar y Reproducir Audio'}
      </button>
      
      <div style={{ marginTop: '15px', fontWeight: 'bold', textAlign: 'center', color: '#555' }}>
        {status}
      </div>
      
      {audioUrl && (
        <audio controls src={audioUrl} style={{ marginTop: '20px', width: '100%' }} autoPlay />
      )}
    </div>
  );
}

export default App;
