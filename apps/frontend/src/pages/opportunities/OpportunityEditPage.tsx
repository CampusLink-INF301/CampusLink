import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

  if (!opportunity) return <p>Cargando...</p>;

  return (
    <main style={{ maxWidth: 700, margin: '0 auto', padding: '1.5rem' }}>
      <h1>Editar Oportunidad</h1>
      <OpportunityForm
        initial={opportunity}
        onSubmit={handleSubmit}
        submitLabel="Guardar cambios"
      />
    </main>
  );
}
