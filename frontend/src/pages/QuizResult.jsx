import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI } from '../api/client';
import { Box, Typography, Button, Card, CardContent, CircularProgress, Grid, Chip, Paper } from '@mui/material';
import { RefreshCw, BookOpen, LayoutDashboard, CheckCircle2, AlertTriangle, XCircle, Lightbulb } from 'lucide-react';

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

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <CircularProgress />
    </Box>
  );

  if (!result) return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h5" color="text.secondary">Resultado não encontrado</Typography>
    </Box>
  );

  const getThemeVars = (score) => {
    if (score >= 80) return { color: 'success.main', emoji: '🏆' };
    if (score >= 60) return { color: 'primary.main', emoji: '📈' };
    if (score >= 40) return { color: 'warning.main', emoji: '📚' };
    return { color: 'error.main', emoji: '💪' };
  };

  const getMessage = (score) => {
    if (score === 100) return 'PERFEITO! Você dominou este conceito!';
    if (score >= 80) return 'Excelente! Você está quase dominando!';
    if (score >= 60) return 'Bom trabalho! Continue praticando.';
    if (score >= 40) return 'Recomendo revisar a aula teórica.';
    return 'Não desanime! Revise o conteúdo e tente novamente.';
  };

  const themeVars = getThemeVars(result.score);

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out', maxWidth: 800, mx: 'auto', pb: 8 }}>
      <Card sx={{ textAlign: 'center', p: { xs: 2, md: 4 } }}>
        <CardContent>
          <Typography sx={{ fontSize: '4rem', mb: 2 }}>{themeVars.emoji}</Typography>
          
          <Typography variant="h2" sx={{ fontWeight: 800, color: themeVars.color, mb: 1, fontSize: { xs: '3rem', md: '4rem' } }}>
            {Math.round(result.score)}%
          </Typography>
          
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            {result.concept_name}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.2rem', mb: 6 }}>
            {getMessage(result.score)}
          </Typography>

          {/* Stats */}
          <Grid container spacing={3} justifyContent="center" sx={{ mb: 6 }}>
            <Grid size={{ xs: 4, sm: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 800, color: 'success.main' }}>
                {result.correct_answers}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                Corretas
              </Typography>
            </Grid>
            <Grid size={{ xs: 4, sm: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 800, color: 'error.main' }}>
                {result.total_questions - result.correct_answers}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                Incorretas
              </Typography>
            </Grid>
            <Grid size={{ xs: 4, sm: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 800 }}>
                {result.total_questions}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                Total
              </Typography>
            </Grid>
          </Grid>

          {/* Individual question results */}
          {result.question_attempts?.length > 0 && (
            <Box sx={{ textAlign: 'left', mb: 6 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Detalhes das Questões</Typography>
              {result.question_attempts.map((attempt, i) => (
                <Paper key={i} elevation={0} sx={{ 
                  p: 2, mb: 2, 
                  bgcolor: 'background.default',
                  border: '1px solid',
                  borderColor: attempt.result === 'correct' ? 'success.main' : attempt.result === 'partial' ? 'warning.main' : 'error.main',
                  borderLeftWidth: 4
                }}>
                  <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500 }}>
                    <strong>Q{i + 1}:</strong> {attempt.question_data?.statement?.substring(0, 100)}...
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      icon={attempt.result === 'correct' ? <CheckCircle2 size={16} /> : attempt.result === 'partial' ? <AlertTriangle size={16} /> : <XCircle size={16} />}
                      label={attempt.result === 'correct' ? 'Correta' : attempt.result === 'partial' ? 'Parcial' : 'Incorreta'}
                      color={attempt.result === 'correct' ? 'success' : attempt.result === 'partial' ? 'warning' : 'error'}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 600, bgcolor: attempt.result === 'correct' ? 'rgba(16, 185, 129, 0.1)' : attempt.result === 'partial' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}
                    />
                    {attempt.hint_used && (
                      <Chip 
                        icon={<Lightbulb size={16} />} 
                        label="Usou dica" 
                        color="warning" 
                        size="small" 
                        variant="outlined"
                        sx={{ fontWeight: 600, bgcolor: 'rgba(245, 158, 11, 0.1)' }}
                      />
                    )}
                  </Box>
                </Paper>
              ))}
            </Box>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              onClick={() => navigate(`/quiz/${result.concept_name ? result.concept_name.toLowerCase().replace(/ /g, '-').replace(/ã/g,'a').replace(/ç/g,'c').replace(/é/g,'e').replace(/ê/g,'e').replace(/ó/g,'o').replace(/ú/g,'u') : 'receita-e-despesa'}`)}
              startIcon={<RefreshCw size={20} />}
            >
              Tentar Novamente
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              size="large" 
              onClick={() => navigate('/concepts')}
              startIcon={<BookOpen size={20} />}
            >
              Ver Conceitos
            </Button>
            <Button 
              variant="contained" 
              color="secondary" 
              size="large" 
              onClick={() => navigate('/dashboard')}
              startIcon={<LayoutDashboard size={20} />}
            >
              Dashboard
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
