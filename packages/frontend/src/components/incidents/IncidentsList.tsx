import React, { useEffect, useState } from 'react';

interface Incident {
  id: number;
  title: string;
  status: string;
  description: string;
}

const IncidentsList: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/incidents')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch incidents');
        }
        return res.json();
      })
      .then((data: Incident[]) => {
        setIncidents(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>読み込み中...</div>;
  if (error) {
    return (
      <div>
        エラー:
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">インシデント一覧</h1>
      <ul>
        {incidents.map((incident) => (
          <li key={incident.id} className="mb-2 p-2 border rounded">
            <h2 className="font-semibold">{incident.title}</h2>
            <p>
              ステータス:
              {incident.status}
            </p>
            <p>{incident.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IncidentsList;
