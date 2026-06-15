import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI, tutorAPI } from '../api/client';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { BarChart3, CheckCircle2, Target, Clock, TrendingUp, PieChart, Bot, Trophy, AlertTriangle, BookOpen } from 'lucide-react';
import { Box, Typography, Grid, Card, CardContent, Button, Chip, CircularProgress, Stack, Avatar } from '@mui/material';

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
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
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
        m.mastery_level >= 80 ? 'rgba(16, 185, 129, 0.7)' :
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
      y: { max: 100, grid: { color: 'rgba(148, 163, 184, 0.08)' }, ticks: { color: '#94a3b8' } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
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
      backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(58, 129, 243, 0.8)', 'rgba(100, 116, 139, 0.3)'],
      borderWidth: 0,
    }],
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" gutterBottom sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
          Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Acompanhe seu progresso na educação financeira
        </Typography>
      </Box>

      {/* Tutor Recommendation Banner */}
      <Card sx={{ 
        mb: 4, 
        borderColor: 'primary.main', 
        borderWidth: 2, 
        background: 'linear-gradient(145deg, #1e293b 0%, rgba(58, 129, 243, 0.08) 100%)',
        boxShadow: '0 8px 32px -8px rgba(58, 129, 243, 0.2)'
      }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Bot size={28} color="#3a81f3" />
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Sugestão de Estudo
                </Typography>
              </Box>
              {recommendation?.message && (
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                  {recommendation.message}
                </Typography>
              )}
              {recommendation?.difficulty_concepts?.length > 0 && (
                <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="body2" color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, fontWeight: 600 }}>
                    <AlertTriangle size={18} /> Foco sugerido para revisão:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {recommendation.difficulty_concepts.map((dc, i) => (
                      <Chip
                        key={i}
                        label={`${dc.concept_name} (${dc.mastery_level}%)`}
                        color="warning"
                        variant="outlined"
                        onClick={() => navigate(`/concept/${dc.concept_slug}`)}
                        sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', fontWeight: 600 }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Grid>
            <Grid sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, alignItems: 'center' }} size={{ xs: 12, md: 4 }}>
              {recommendation?.next_concept ? (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => navigate(`/concept/${recommendation.next_concept.concept_slug}`)}
                  startIcon={<BookOpen size={20} />}
                  sx={{ 
                    py: 1.5, px: 3, 
                    fontSize: '1.1rem',
                    animation: 'pulse 2s infinite'
                  }}
                >
                  Continuar: {recommendation.next_concept.concept_name}
                </Button>
              ) : !recommendation?.difficulty_concepts?.length ? (
                <Button variant="outlined" color="primary" size="large" onClick={() => navigate('/concepts')}>
                  Explorar Módulos
                </Button>
              ) : null}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ alignItems: 'stretch', mb: 4 }}>
        {[
          { icon: <BarChart3 size={24} color="#60a5fa" />, value: `${Math.round(profile.overall_progress || 0)}%`, label: 'Progresso Geral', bgcolor: 'rgba(58, 129, 243, 0.1)' },
          { icon: <CheckCircle2 size={24} color="#34d399" />, value: `${stats?.concepts_mastered || 0}/${stats?.concepts_total || 0}`, label: 'Dominados', bgcolor: 'rgba(16, 185, 129, 0.1)' },
          { icon: <Target size={24} color="#c084fc" />, value: `${profile.accuracy_rate || 0}%`, label: 'Taxa de Acerto', bgcolor: 'rgba(168, 85, 247, 0.1)' },
          { icon: <Clock size={24} color="#fbbf24" />, value: `${profile.total_study_minutes || 0}m`, label: 'Tempo de Estudo', bgcolor: 'rgba(245, 158, 11, 0.1)' }
        ].map((stat, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, flexGrow: 1 }}>
                <Avatar sx={{ bgcolor: stat.bgcolor, width: 56, height: 56, mb: 2 }}>
                  {stat.icon}
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Grid (Charts & Achievements) */}
      <Grid container spacing={4} sx={{ alignItems: 'stretch', mb: 4 }}>
        {/* Mastery Chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp size={20} color="#3a81f3" /> Domínio por Conceito
              </Typography>
              <Box sx={{ height: 350 }}>
                <Bar data={masteryChartData} options={masteryChartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={4} sx={{ height: '100%' }}>
            {/* Progress Doughnut */}
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PieChart size={20} color="#3a81f3" /> Visão Geral
                </Typography>
                <Box sx={{ height: 200, display: 'flex', justifyContent: 'center' }}>
                  <Doughnut data={progressDoughnut} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 12 } } } },
                    cutout: '70%',
                  }} />
                </Box>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Trophy size={20} color="#3a81f3" /> Últimas Conquistas
                </Typography>
                {stats?.achievements?.length > 0 ? (
                  <Stack spacing={2}>
                    {stats.achievements.slice(0, 3).map(a => (
                      <Box key={a.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
                        <Typography sx={{ fontSize: '1.5rem' }}>{a.icon}</Typography>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{a.name}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>{a.description}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
                    <Trophy size={40} color="#475569" />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Complete atividades para ganhar!
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
