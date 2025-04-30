import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Capsule -> modèle Sketchfab par code
const sketchfabModels = {
  'capsule-lune': 'https://sketchfab.com/models/1234567890abcdef/embed',
  'capsule-soleil': 'https://sketchfab.com/models/abcdef1234567890/embed'
};

export default function Capsule() {
  const router = useRouter();
  const { code } = router.query;
  const [messages, setMessages] = useState([]);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');

  const modelUrl = sketchfabModels[code];

  useEffect(() => {
    if (code) {
      fetchMessages();
    }
  }, [code]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('capsule_code', code)
      .order('created_at', { ascending: false });

    if (!error) setMessages(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content) return;

    await supabase.from('messages').insert([
      {
        capsule_code: code,
        author,
        content
      }
    ]);

    setAuthor('');
    setContent('');
    fetchMessages();
  };

  return (
    <div style={{ padding: '2rem', background: '#fff', color: '#111' }}>
      <h1>Capsule : {code}</h1>

      {modelUrl ? (
        <iframe
          title="Sketchfab model"
          width="100%"
          height="400"
          src={modelUrl}
          frameBorder="0"
          allow="autoplay; fullscreen; vr"
        ></iframe>
      ) : (
        <p>Modèle 3D non trouvé pour cette capsule.</p>
      )}

      <h2>Messages</h2>
      <ul>
        {messages.map((msg) => (
          <li key={msg.id}>
            <strong>{msg.author || 'Anonyme'}:</strong> {msg.content}
          </li>
        ))}
      </ul>

      <h3>Ajouter un message</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Votre nom"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <br />
        <textarea
          placeholder="Votre message"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <br />
        <button type="submit">Envoyer</button>
      </form>
    </div>
  );
}
// Forcer rebuild sur Vercel
