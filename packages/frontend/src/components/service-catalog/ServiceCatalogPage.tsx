import React, { useEffect, useState } from 'react';

interface Service {
  id: number;
  name: string;
  description: string;
  status: string;
}

const ServiceCatalogPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/services')
      .then((res) => {
        if (!res.ok) {
          throw new Error('サービス一覧の取得に失敗しました');
        }
        return res.json();
      })
      .then((data: Service[]) => {
        setServices(data);
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
      <h1 className="text-2xl font-bold mb-4">サービスカタログ</h1>
      <ul>
        {services.map((service) => (
          <li key={service.id} className="mb-2 p-2 border rounded">
            <h2 className="font-semibold">{service.name}</h2>
            <p>
              ステータス:
              {service.status}
            </p>
            <p>{service.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ServiceCatalogPage;
