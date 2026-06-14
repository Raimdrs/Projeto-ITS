import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI } from '../api/client';
import { Dumbbell, FileEdit } from 'lucide-react';

export default function Exercises() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    quizAPI.questions(slug).then(res => {
      setQuestions(res.data?.results || res.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/concept/${slug}`)}>
          ← Voltar à Aula
        </button>
      </div>

      <div className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Dumbbell size={32} className="text-accent" /> Exercícios
        </h1>
        <p className="page-subtitle">{questions.length} questões disponíveis</p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <button className="btn btn-primary btn-lg" onClick={() => navigate(`/quiz/${slug}`)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileEdit size={20} /> Iniciar Quiz Adaptativo (5 questões)
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {questions.map((q, i) => (
          <div key={q.id} className="card" style={{ cursor: 'default' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>Questão {i + 1}</span>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <span className={`badge ${q.difficulty === 1 ? 'badge-success' : q.difficulty === 2 ? 'badge-warning' : 'badge-danger'}`}>
                  {q.difficulty === 1 ? 'Fácil' : q.difficulty === 2 ? 'Médio' : 'Difícil'}
                </span>
                <span className="badge badge-primary">
                  {q.question_type === 'multiple_choice' ? 'ME' :
                   q.question_type === 'true_false' ? 'V/F' :
                   q.question_type === 'fill_blank' ? 'Preench.' : 'Cálculo'}
                </span>
              </div>
            </div>
            <p style={{ fontSize: 'var(--font-size-base)', lineHeight: 1.7 }}>{q.statement}</p>
            {q.options?.length > 0 && (
              <div style={{ marginTop: 'var(--space-3)' }}>
                {q.options.map((opt, j) => (
                  <div key={opt.id} style={{
                    padding: 'var(--space-2) var(--space-3)', marginBottom: 'var(--space-1)',
                    fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)',
                    background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)'
                  }}>
                    {String.fromCharCode(65 + j)}) {opt.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
