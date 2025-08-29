import { useEffect, useState } from "react";

type Incident = {
  id: number;
  title: string;
  status: string;
};

export function IncidentsTable() {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/incidents")
      .then((res) => res.json())
      .then(setIncidents);
  }, []);

  return (
    <table className="w-full border-collapse border border-gray-300">
      <thead className="bg-gray-100">
        <tr>
          <th className="border px-4 py-2">タイトル</th>
          <th className="border px-4 py-2">ステータス</th>
        </tr>
      </thead>
      <tbody>
        {incidents.map((incident) => (
          <tr key={incident.id}>
            <td className="border px-4 py-2">{incident.title}</td>
            <td className="border px-4 py-2">{incident.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
