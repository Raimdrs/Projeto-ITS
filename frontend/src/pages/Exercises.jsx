import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI } from '../api/client';
import { Box, Typography, Button, Card, CardContent, CircularProgress, Chip, Stack } from '@mui/material';
import { Dumbbell, FileEdit, ArrowLeft } from 'lucide-react';

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

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out', maxWidth: 800, mx: 'auto', pb: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Button 
          variant="text" 
          color="inherit" 
          onClick={() => navigate(`/concept/${slug}`)}
          startIcon={<ArrowLeft size={18} />}
          sx={{ mb: 2, color: 'text.secondary' }}
        >
          Voltar à Aula
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 800, mb: 1 }}>
          <Dumbbell size={36} color="#3a81f3" /> Exercícios
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ ml: 6 }}>
          {questions.length} questões disponíveis no banco
        </Typography>
      </Box>

      <Box sx={{ mb: 6 }}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large" 
          onClick={() => navigate(`/quiz/${slug}`)} 
          startIcon={<FileEdit size={22} />}
          sx={{ py: 1.5, px: 4, fontSize: '1.1rem', borderRadius: 8 }}
        >
          Iniciar Quiz Adaptativo (5 questões)
        </Button>
      </Box>

      <Stack spacing={3}>
        {questions.map((q, i) => (
          <Card key={q.id} variant="outlined" sx={{ borderColor: 'rgba(148, 163, 184, 0.2)' }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Questão {i + 1}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    label={q.difficulty === 1 ? 'Fácil' : q.difficulty === 2 ? 'Médio' : 'Difícil'} 
                    color={q.difficulty === 1 ? 'success' : q.difficulty === 2 ? 'warning' : 'error'}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                  <Chip 
                    label={
                      q.question_type === 'multiple_choice' ? 'ME' :
                      q.question_type === 'true_false' ? 'V/F' :
                      q.question_type === 'fill_blank' ? 'Preench.' : 'Cálculo'
                    }
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </Box>
              
              <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6, mb: q.options?.length > 0 ? 3 : 0 }}>
                {q.statement}
              </Typography>
              
              {q.options?.length > 0 && (
                <Stack spacing={1}>
                  {q.options.map((opt, j) => (
                    <Box key={opt.id} sx={{ 
                      p: 1.5, 
                      bgcolor: 'background.default', 
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      gap: 2
                    }}>
                      <Typography sx={{ fontWeight: 700, color: 'text.secondary' }}>
                        {String.fromCharCode(65 + j)})
                      </Typography>
                      <Typography>
                        {opt.text}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
