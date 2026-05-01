import { useNavigate, Link } from 'react-router-dom';
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
    <main className="page">
      <Link to="/opportunities" className="back-link">← Volver</Link>
      <div className="page-header">
        <h1>Nueva Oportunidad</h1>
      </div>
      <div className="detail-card">
        <OpportunityForm onSubmit={handleSubmit} submitLabel="Publicar oportunidad" />
      </div>
    </main>
  );
}
