import React, { useEffect, useState } from 'react';

interface Problem {
  id: number;
  title: string;
  status: string;
  description: string;
}

const ProblemsList: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/problems')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch problems');
        }
        return res.json();
      })
      .then((data: Problem[]) => {
        setProblems(data);
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
      <h1 className="text-xl font-bold mb-4">問題一覧</h1>
      <ul>
        {problems.map((problem) => (
          <li key={problem.id} className="mb-2 p-2 border rounded">
            <h2 className="font-semibold">{problem.title}</h2>
            <p>
              ステータス:
              {problem.status}
            </p>
            <p>{problem.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProblemsList;
