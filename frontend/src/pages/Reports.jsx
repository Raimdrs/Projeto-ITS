import { useState, useEffect } from 'react';
import { studentAPI } from '../api/client';
import ProgressBar from '../components/ProgressBar';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import * as LucideIcons from 'lucide-react';
import { BarChart3, Target, CheckCircle2, Circle, ScrollText, FileEdit, BookOpen, AlertTriangle } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    Promise.all([
      studentAPI.stats().catch(() => ({ data: null })),
      studentAPI.history().catch(() => ({ data: [] })),
      studentAPI.getGoals().catch(() => ({ data: [] })),
    ]).then(([statsRes, historyRes, goalsRes]) => {
      setStats(statsRes.data);
      setHistory(historyRes.data?.results || historyRes.data || []);
      setGoals(goalsRes.data?.results || goalsRes.data || []);
      setLoading(false);
    });
  };

  useEffect(fetchData, []);

  const handleAddGoal = async () => {
    if (!newGoal.trim()) return;
    await studentAPI.createGoal({ description: newGoal });
    setNewGoal('');
    fetchData();
  };

  const handleToggleGoal = async (goal) => {
    await studentAPI.updateGoal({ id: goal.id, completed: !goal.completed });
    fetchData();
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const masteryData = stats?.mastery_data || [];
  const profile = stats?.profile || {};

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Relatórios</h1>
        <p className="page-subtitle">Análise detalhada do seu desempenho</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-4" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="stat-card blue">
          <div className="stat-value">{profile.total_questions_answered || 0}</div>
          <div className="stat-label">Questões Respondidas</div>
        </div>
        <div className="stat-card green">
          <div className="stat-value">{profile.total_correct_answers || 0}</div>
          <div className="stat-label">Respostas Corretas</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-value">{profile.accuracy_rate || 0}%</div>
          <div className="stat-label">Taxa de Acerto</div>
        </div>
        <div className="stat-card warm">
          <div className="stat-value">{profile.streak_days || 0}</div>
          <div className="stat-label">Dias de Sequência</div>
        </div>
      </div>

      <div className="grid grid-2">
        {/* Mastery Details */}
        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-5)', fontWeight: 700, fontSize: 'var(--font-size-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={20} className="text-accent" /> Domínio por Conceito
          </h3>
          {masteryData.map(m => (
            <div key={m.id} style={{ marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {(() => {
                    const Icon = LucideIcons[m.concept_icon] || LucideIcons.BookOpen;
                    return <Icon size={16} />;
                  })()} {m.concept_name}
                </span>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {Math.round(m.mastery_level)}%
                  {m.is_mastered && <CheckCircle2 size={14} className="text-success" />}
                </span>
              </div>
              <ProgressBar value={m.mastery_level} variant="auto" showLabel={false} />
            </div>
          ))}
        </div>

        {/* Learning Goals */}
        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-5)', fontWeight: 700, fontSize: 'var(--font-size-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={20} className="text-accent" /> Metas de Aprendizagem
          </h3>
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <input type="text" className="form-input" placeholder="Nova meta..." value={newGoal}
              onChange={e => setNewGoal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddGoal()} />
            <button className="btn btn-primary" onClick={handleAddGoal}>+</button>
          </div>
          {goals.map(goal => (
            <div key={goal.id} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
              padding: 'var(--space-3)', marginBottom: 'var(--space-2)',
              background: 'var(--bg-input)', borderRadius: 'var(--radius-md)',
              cursor: 'pointer', opacity: goal.completed ? 0.6 : 1
            }} onClick={() => handleToggleGoal(goal)}>
              <span style={{ display: 'flex' }}>{goal.completed ? <CheckCircle2 size={20} className="text-success" /> : <Circle size={20} />}</span>
              <span style={{
                fontSize: 'var(--font-size-sm)',
                textDecoration: goal.completed ? 'line-through' : 'none'
              }}>{goal.description}</span>
            </div>
          ))}
          {goals.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
              Adicione metas para acompanhar seu progresso.
            </p>
          )}
        </div>
      </div>

      {/* Study History */}
      <div className="card" style={{ marginTop: 'var(--space-6)' }}>
        <h3 style={{ marginBottom: 'var(--space-5)', fontWeight: 700, fontSize: 'var(--font-size-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ScrollText size={20} className="text-accent" /> Histórico Recente
        </h3>
        {history.length > 0 ? (
          <div>
            {history.slice(0, 10).map((session, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-2)',
                background: 'var(--bg-input)', borderRadius: 'var(--radius-md)'
              }}>
                <div>
                  <span style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>
                    {session.concept_name || 'Geral'}
                  </span>
                  <span className="badge badge-primary" style={{ marginLeft: 'var(--space-2)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {session.activity_type === 'quiz' ? <><FileEdit size={12} /> Quiz</> : <><BookOpen size={12} /> Aula</>}
                  </span>
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  {session.duration_minutes} min • {new Date(session.date).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: 'var(--space-6)' }}>
            <p>Nenhuma atividade registrada ainda.</p>
          </div>
        )}
      </div>

      {/* Difficulty Alerts */}
      {stats?.concepts_in_difficulty?.length > 0 && (
        <div className="card" style={{ marginTop: 'var(--space-6)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)', fontWeight: 700, color: 'var(--danger-400)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} /> Conceitos com Dificuldade
          </h3>
          {stats.concepts_in_difficulty.map((cd, i) => (
            <div key={i} style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-2)', background: 'rgba(239,68,68,0.05)', borderRadius: 'var(--radius-md)' }}>
              <strong>{cd.concept_name}</strong> — {cd.mastery_level}% de domínio ({cd.attempts} tentativas)
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
