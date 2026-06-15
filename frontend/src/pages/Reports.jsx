import { useState, useEffect } from 'react';
import { studentAPI } from '../api/client';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import * as LucideIcons from 'lucide-react';
import { BarChart3, Target, CheckCircle2, Circle, ScrollText, FileEdit, BookOpen, AlertTriangle, Plus } from 'lucide-react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, LinearProgress, TextField, IconButton, Paper, Chip, Avatar, List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction } from '@mui/material';

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

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <CircularProgress />
    </Box>
  );

  const masteryData = stats?.mastery_data || [];
  const profile = stats?.profile || {};

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out', pb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" gutterBottom sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
          Relatórios
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Análise detalhada do seu desempenho
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ alignItems: 'stretch', mb: 4 }}>
        {[
          { value: profile.total_questions_answered || 0, label: 'Questões Respondidas', color: '#3a81f3', bgcolor: 'rgba(58, 129, 243, 0.1)' },
          { value: profile.total_correct_answers || 0, label: 'Respostas Corretas', color: '#10b981', bgcolor: 'rgba(16, 185, 129, 0.1)' },
          { value: `${profile.accuracy_rate || 0}%`, label: 'Taxa de Acerto', color: '#a855f7', bgcolor: 'rgba(168, 85, 247, 0.1)' },
          { value: profile.streak_days || 0, label: 'Dias de Sequência', color: '#f59e0b', bgcolor: 'rgba(245, 158, 11, 0.1)' }
        ].map((stat, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, borderBottom: `4px solid ${stat.color}`, flexGrow: 1, justifyContent: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5, color: stat.color }}>
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

      <Grid sx={{ alignItems: 'stretch' }} container spacing={4}>
        {/* Mastery Details */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ mb: 4, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BarChart3 size={20} color="#3a81f3" /> Domínio por Conceito
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {masteryData.map(m => {
                  const Icon = LucideIcons[m.concept_icon] || LucideIcons.BookOpen;
                  return (
                    <Box key={m.id}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Icon size={16} /> {m.concept_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {Math.round(m.mastery_level)}%
                          {m.is_mastered && <CheckCircle2 size={16} color="#10b981" />}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={m.mastery_level} 
                        sx={{ 
                          height: 10, 
                          borderRadius: 5,
                          bgcolor: 'rgba(148, 163, 184, 0.15)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: m.is_mastered ? 'success.main' : 'primary.main',
                            borderRadius: 5
                          }
                        }} 
                      />
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Learning Goals */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Target size={20} color="#3a81f3" /> Metas de Aprendizagem
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 4 }}>
                <TextField 
                  fullWidth 
                  size="small"
                  variant="outlined" 
                  placeholder="Nova meta..." 
                  value={newGoal}
                  onChange={e => setNewGoal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddGoal()} 
                />
                <IconButton color="primary" onClick={handleAddGoal} sx={{ bgcolor: 'rgba(58, 129, 243, 0.1)' }}>
                  <Plus />
                </IconButton>
              </Box>

              <List sx={{ p: 0, flexGrow: 1 }}>
                {goals.map(goal => (
                  <ListItem 
                    key={goal.id} 
                    onClick={() => handleToggleGoal(goal)}
                    sx={{ 
                      mb: 1.5, 
                      bgcolor: 'rgba(148, 163, 184, 0.05)', 
                      borderRadius: 2,
                      cursor: 'pointer',
                      opacity: goal.completed ? 0.6 : 1,
                      border: '1px solid rgba(148, 163, 184, 0.15)',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: 'rgba(148, 163, 184, 0.1)', transform: 'translateY(-2px)', borderColor: 'primary.main' }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {goal.completed ? <CheckCircle2 size={22} color="#10b981" /> : <Circle size={22} color="#64748b" />}
                    </ListItemIcon>
                    <ListItemText 
                      primary={goal.description} 
                      slotProps={{ primary: { sx: { textDecoration: goal.completed ? 'line-through' : 'none', fontWeight: 500 } } }} 
                    />
                  </ListItem>
                ))}
              </List>
              {goals.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Adicione metas para acompanhar seu progresso.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Study History */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScrollText size={20} color="#3a81f3" /> Histórico Recente
          </Typography>
          
          {history.length > 0 ? (
            <List sx={{ p: 0 }}>
              {history.slice(0, 10).map((session, i) => (
                <ListItem key={i} sx={{ 
                  mb: 2, 
                  bgcolor: 'rgba(148, 163, 184, 0.05)', 
                  borderRadius: 2, 
                  border: '1px solid rgba(148, 163, 184, 0.15)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2
                }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {session.concept_name || 'Geral'}
                    </Typography>
                    <Chip 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      icon={session.activity_type === 'quiz' ? <FileEdit size={14} /> : <BookOpen size={14} />}
                      label={session.activity_type === 'quiz' ? 'Quiz' : 'Aula'}
                      sx={{ height: 24, fontSize: '0.75rem', fontWeight: 600 }}
                    />
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                      {session.duration_minutes} min
                    </Typography>
                    <Typography variant="caption" color="text.muted">
                      {new Date(session.date).toLocaleDateString('pt-BR')}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">Nenhuma atividade registrada ainda.</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Difficulty Alerts */}
      {stats?.concepts_in_difficulty?.length > 0 && (
        <Card sx={{ mt: 4, borderColor: 'error.main', borderLeftWidth: 4, borderLeftStyle: 'solid' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <AlertTriangle size={20} /> Conceitos com Dificuldade
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {stats.concepts_in_difficulty.map((cd, i) => (
                <Paper key={i} elevation={0} sx={{ p: 2, bgcolor: 'rgba(239, 68, 68, 0.05)', borderRadius: 2 }}>
                  <Typography variant="body2">
                    <strong style={{ fontWeight: 700 }}>{cd.concept_name}</strong> — {cd.mastery_level}% de domínio ({cd.attempts} tentativas)
                  </Typography>
                </Paper>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
