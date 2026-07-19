import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [entries, setEntries] = useState<{id: number, text: string}[]>([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/entries')
      .then(res => setEntries(res.data));
  }, []);

  return (
    <div>
      <h1>My Diary</h1>
      {entries.map(e => <p key={e.id}>{e.text}</p>)}
    </div>
  );
}

export default App;