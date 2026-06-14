import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { conceptsAPI } from '../api/client';
import ProgressBar from '../components/ProgressBar';
import * as LucideIcons from 'lucide-react';

export default function ConceptList() {
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    conceptsAPI.list().then(res => {
      setConcepts(res.data?.results || res.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>;
  }

  const statusLabel = { mastered: 'Dominado', in_progress: 'Em Progresso', available: 'Disponível', locked: 'Bloqueado' };
  const statusBadge = { mastered: 'badge-success', in_progress: 'badge-primary', available: 'badge-warning', locked: 'badge-danger' };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Conceitos</h1>
        <p className="page-subtitle">Explore os módulos de educação financeira</p>
      </div>

      <div className="grid grid-3">
        {concepts.map((concept, i) => (
          <div
            key={concept.id}
            className={`concept-card animate-fade-in delay-${(i % 4) + 1} ${concept.status === 'locked' ? 'locked' : ''}`}
            style={{ '--card-color': concept.color }}
            onClick={() => concept.status !== 'locked' && navigate(`/concept/${concept.slug}`)}
          >
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '3px',
              background: concept.color
            }} />
            <div className="concept-card-icon">
              {(() => {
                const Icon = LucideIcons[concept.icon] || LucideIcons.BookOpen;
                return <Icon size={32} />;
              })()}
            </div>
            <div className="concept-card-title">{concept.name}</div>
            <div className="concept-card-desc">{concept.description}</div>
            
            <ProgressBar value={concept.mastery_level || 0} variant="auto" />
            
            <div className="concept-card-footer" style={{ marginTop: 'var(--space-3)' }}>
              <span className={`badge ${statusBadge[concept.status] || 'badge-primary'}`}>
                {concept.status === 'locked' ? '🔒 ' : ''}{statusLabel[concept.status] || concept.status}
              </span>
              {concept.prerequisites?.length > 0 && (
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  {concept.prerequisites.length} pré-requisito(s)
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
