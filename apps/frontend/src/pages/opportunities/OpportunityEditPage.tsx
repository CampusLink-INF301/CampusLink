import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { opportunitiesApi } from '../../api/opportunities';
import { OpportunityForm } from '../../components/OpportunityForm';
import type { Opportunity, CreateOpportunityPayload } from '../../types/opportunity';

export function OpportunityEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);

  useEffect(() => {
    if (!id) return;
    opportunitiesApi.getById(id).then(setOpportunity);
  }, [id]);

  const handleSubmit = async (payload: CreateOpportunityPayload) => {
    if (!id) return;
    await opportunitiesApi.update(id, payload);
    navigate(`/opportunities/${id}`);
  };

  if (!opportunity) return <p className="loading-text">Cargando…</p>;

  return (
    <main className="page">
      <Link to={`/opportunities/${id}`} className="back-link">← Volver al detalle</Link>
      <div className="page-header">
        <h1>Editar Oportunidad</h1>
      </div>
      <div className="detail-card">
        <OpportunityForm
          initial={opportunity}
          onSubmit={handleSubmit}
          submitLabel="Guardar cambios"
        />
      </div>
    </main>
  );
}
