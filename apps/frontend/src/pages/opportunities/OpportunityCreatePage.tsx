import { useNavigate } from 'react-router-dom';
import { opportunitiesApi } from '../../api/opportunities';
import { OpportunityForm } from '../../components/OpportunityForm';
import type { CreateOpportunityPayload } from '../../types/opportunity';

export function OpportunityCreatePage() {
  const navigate = useNavigate();

  const handleSubmit = async (payload: CreateOpportunityPayload) => {
    const created = await opportunitiesApi.create(payload);
    navigate(`/opportunities/${created.id}`);
  };

  return (
    <main style={{ maxWidth: 700, margin: '0 auto', padding: '1.5rem' }}>
      <h1>Nueva Oportunidad</h1>
      <OpportunityForm onSubmit={handleSubmit} submitLabel="Publicar" />
    </main>
  );
}
