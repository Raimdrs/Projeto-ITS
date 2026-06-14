import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI, tutorAPI } from '../api/client';
import ProgressBar from '../components/ProgressBar';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { BarChart3, CheckCircle2, Target, Clock, TrendingUp, PieChart, Bot, Trophy, AlertTriangle } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      studentAPI.stats().catch(() => ({ data: null })),
      tutorAPI.recommendation().catch(() => ({ data: null })),
    ]).then(([statsRes, recRes]) => {
      setStats(statsRes.data);
      setRecommendation(recRes.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>;
  }

  const profile = stats?.profile || {};
  const masteryData = stats?.mastery_data || [];

  // Chart data
  const masteryChartData = {
    labels: masteryData.map(m => m.concept_name?.substring(0, 15) || ''),
    datasets: [{
      label: 'Domínio (%)',
      data: masteryData.map(m => m.mastery_level),
      backgroundColor: masteryData.map(m =>
        m.mastery_level >= 80 ? 'rgba(0, 209, 119, 0.7)' :
        m.mastery_level >= 40 ? 'rgba(58, 129, 243, 0.7)' :
        m.mastery_level > 0 ? 'rgba(245, 158, 11, 0.7)' :
        'rgba(100, 116, 139, 0.3)'
      ),
      borderRadius: 6,
    }],
  };

  const masteryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(148, 163, 184, 0.12)',
        borderWidth: 1,
      },
    },
    scales: {
      y: { max: 100, grid: { color: 'rgba(148, 163, 184, 0.08)' }, ticks: { color: '#64748b' } },
      x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } },
    },
  };

  const progressDoughnut = {
    labels: ['Dominados', 'Em Progresso', 'Pendentes'],
    datasets: [{
      data: [
        stats?.concepts_mastered || 0,
        stats?.concepts_in_progress || 0,
        (stats?.concepts_total || 0) - (stats?.concepts_mastered || 0) - (stats?.concepts_in_progress || 0),
      ],
      backgroundColor: ['rgba(0, 209, 119, 0.8)', 'rgba(58, 129, 243, 0.8)', 'rgba(100, 116, 139, 0.3)'],
      borderWidth: 0,
    }],
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Acompanhe seu progresso na educação financeira</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-4" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="stat-card blue animate-fade-in delay-1">
          <div className="stat-icon blue"><BarChart3 size={24} /></div>
          <div className="stat-value">{Math.round(profile.overall_progress || 0)}%</div>
          <div className="stat-label">Progresso Geral</div>
        </div>
        <div className="stat-card green animate-fade-in delay-2">
          <div className="stat-icon green"><CheckCircle2 size={24} /></div>
          <div className="stat-value">{stats?.concepts_mastered || 0}/{stats?.concepts_total || 0}</div>
          <div className="stat-label">Conceitos Dominados</div>
        </div>
        <div className="stat-card purple animate-fade-in delay-3">
          <div className="stat-icon purple"><Target size={24} /></div>
          <div className="stat-value">{profile.accuracy_rate || 0}%</div>
          <div className="stat-label">Taxa de Acerto</div>
        </div>
        <div className="stat-card warm animate-fade-in delay-4">
          <div className="stat-icon warm"><Clock size={24} /></div>
          <div className="stat-value">{profile.total_study_minutes || 0}</div>
          <div className="stat-label">Minutos de Estudo</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-2" style={{ marginBottom: 'var(--space-8)' }}>
        {/* Mastery Chart */}
        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-5)', fontWeight: 700, fontSize: 'var(--font-size-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} className="text-accent" /> Domínio por Conceito
          </h3>
          <div style={{ height: '300px' }}>
            <Bar data={masteryChartData} options={masteryChartOptions} />
          </div>
        </div>

        {/* Progress Doughnut */}
        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-5)', fontWeight: 700, fontSize: 'var(--font-size-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={20} className="text-accent" /> Visão Geral
          </h3>
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '250px' }}>
              <Doughnut data={progressDoughnut} options={{
                responsive: true,
                plugins: {
                  legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 16, font: { size: 12 } } },
                },
                cutout: '65%',
              }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        {/* Recommendation */}
        <div className="card" style={{ borderColor: 'rgba(58, 129, 243, 0.3)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)', fontWeight: 700, fontSize: 'var(--font-size-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bot size={20} className="text-accent" /> Recomendação do Tutor
          </h3>
          {recommendation?.message && (
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', lineHeight: 1.7 }}>
              {recommendation.message}
            </p>
          )}
          {recommendation?.next_concept && (
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/concept/${recommendation.next_concept.concept_slug}`)}
            >
              Estudar: {recommendation.next_concept.concept_name}
            </button>
          )}
          {recommendation?.difficulty_concepts?.length > 0 && (
            <div style={{ marginTop: 'var(--space-4)' }}>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--warning-400)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={16} /> Conceitos com dificuldade:
              </p>
              {recommendation.difficulty_concepts.map((dc, i) => (
                <div key={i} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  • {dc.concept_name} ({dc.mastery_level}%)
                </div>
              ))}
            </div>
          )}
          {!recommendation?.next_concept && !recommendation?.difficulty_concepts?.length && (
            <button className="btn btn-accent" onClick={() => navigate('/concepts')}>
              Ver Conceitos
            </button>
          )}
        </div>

        {/* Achievements */}
        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-4)', fontWeight: 700, fontSize: 'var(--font-size-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={20} className="text-accent" /> Conquistas
          </h3>
          {stats?.achievements?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {stats.achievements.slice(0, 5).map(a => (
                <div key={a.id} className="achievement-badge">
                  <div className="achievement-icon">{a.icon}</div>
                  <div className="achievement-info">
                    <h4>{a.name}</h4>
                    <p>{a.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 'var(--space-6)' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}><Trophy size={48} /></div>
              <p style={{ color: 'var(--text-muted)' }}>Complete atividades para ganhar conquistas!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
