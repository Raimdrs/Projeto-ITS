import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI } from '../api/client';

export default function QuizResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    quizAPI.result(id).then(res => {
      setResult(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!result) return <div className="empty-state"><h3>Resultado não encontrado</h3></div>;

  const scoreClass = result.score >= 80 ? 'excellent' : result.score >= 60 ? 'good' : result.score >= 40 ? 'average' : 'poor';
  const emoji = result.score >= 80 ? '🏆' : result.score >= 60 ? '📈' : result.score >= 40 ? '📚' : '💪';

  const getMessage = () => {
    if (result.score === 100) return 'PERFEITO! Você dominou este conceito!';
    if (result.score >= 80) return 'Excelente! Você está quase dominando!';
    if (result.score >= 60) return 'Bom trabalho! Continue praticando.';
    if (result.score >= 40) return 'Recomendo revisar a aula teórica.';
    return 'Não desanime! Revise o conteúdo e tente novamente.';
  };

  return (
    <div className="quiz-container animate-fade-in">
      <div className="card result-card">
        <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>{emoji}</div>
        <div className={`result-score ${scoreClass}`}>{Math.round(result.score)}%</div>
        <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-2)' }}>
          {result.concept_name}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)', fontSize: 'var(--font-size-lg)' }}>
          {getMessage()}
        </p>

        <div style={{
          display: 'flex', justifyContent: 'center', gap: 'var(--space-8)',
          marginBottom: 'var(--space-8)', flexWrap: 'wrap'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--accent-400)' }}>
              {result.correct_answers}
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>Corretas</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--danger-400)' }}>
              {result.total_questions - result.correct_answers}
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>Incorretas</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>
              {result.total_questions}
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>Total</div>
          </div>
        </div>

        {/* Individual question results */}
        {result.question_attempts?.length > 0 && (
          <div style={{ textAlign: 'left', marginBottom: 'var(--space-6)' }}>
            <h3 style={{ marginBottom: 'var(--space-4)', fontWeight: 600 }}>Detalhes</h3>
            {result.question_attempts.map((attempt, i) => (
              <div key={i} style={{
                padding: 'var(--space-4)', marginBottom: 'var(--space-3)',
                background: 'var(--bg-input)', borderRadius: 'var(--radius-md)',
                borderLeft: `3px solid ${attempt.result === 'correct' ? 'var(--accent-500)' : attempt.result === 'partial' ? 'var(--warning-500)' : 'var(--danger-500)'}`
              }}>
                <div style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-2)' }}>
                  <strong>Q{i + 1}:</strong> {attempt.question_data?.statement?.substring(0, 100)}...
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                  <span className={`badge ${attempt.result === 'correct' ? 'badge-success' : attempt.result === 'partial' ? 'badge-warning' : 'badge-danger'}`}>
                    {attempt.result === 'correct' ? '✅ Correta' : attempt.result === 'partial' ? '🟡 Parcial' : '❌ Incorreta'}
                  </span>
                  {attempt.hint_used && <span className="badge badge-warning">💡 Usou dica</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate(`/quiz/${result.concept_name ? result.concept_name.toLowerCase().replace(/ /g, '-').replace(/ã/g,'a').replace(/ç/g,'c').replace(/é/g,'e').replace(/ê/g,'e').replace(/ó/g,'o').replace(/ú/g,'u') : 'receita-e-despesa'}`)}>
            🔄 Tentar Novamente
          </button>
          <button className="btn btn-outline btn-lg" onClick={() => navigate('/concepts')}>
            📚 Ver Conceitos
          </button>
          <button className="btn btn-accent btn-lg" onClick={() => navigate('/dashboard')}>
            📊 Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
