import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI } from '../api/client';
import { Box, Typography, Button, Card, CardContent, LinearProgress, Chip, TextField, CircularProgress, Alert } from '@mui/material';
import { Lightbulb, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

export default function Quiz() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [hintUsed, setHintUsed] = useState(false);
  const [hint, setHint] = useState('');
  const [inputAnswer, setInputAnswer] = useState('');

  useEffect(() => {
    quizAPI.start({ concept_slug: slug, num_questions: 5 })
      .then(res => {
        setQuizData(res.data);
        setLoading(false);
      })
      .catch(err => {
        alert(err.response?.data?.error || 'Erro ao iniciar quiz');
        navigate('/concepts');
      });
  }, [slug]);

  if (loading || !quizData) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <CircularProgress />
    </Box>
  );

  const questions = quizData.questions || [];
  const currentQuestion = questions[currentIndex];

  const handleGetHint = async () => {
    try {
      const res = await quizAPI.hint({ question_id: currentQuestion.id });
      setHint(res.data.hint);
      setHintUsed(true);
    } catch (e) { /* ignore */ }
  };

  const handleSubmit = async () => {
    if (submitting) return;

    let answer;
    if (currentQuestion.question_type === 'multiple_choice' || currentQuestion.question_type === 'true_false') {
      if (!selectedAnswer) return;
      answer = String(selectedAnswer);
    } else {
      if (!inputAnswer.trim()) return;
      answer = inputAnswer.trim();
    }

    setSubmitting(true);
    try {
      const res = await quizAPI.answer({
        quiz_attempt_id: quizData.quiz_attempt_id,
        question_id: currentQuestion.id,
        answer: answer,
        time_seconds: 30,
        hint_used: hintUsed,
      });

      setFeedback(res.data);
      setAnswers([...answers, res.data]);

      if (res.data.is_quiz_complete) {
        setTimeout(() => {
          navigate(`/quiz-result/${quizData.quiz_attempt_id}`);
        }, 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setFeedback(null);
    setHint('');
    setHintUsed(false);
    setInputAnswer('');
    setCurrentIndex(currentIndex + 1);
  };

  const optionLabels = ['A', 'B', 'C', 'D', 'E'];

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out', maxWidth: 800, mx: 'auto', pb: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Button 
          variant="text" 
          color="inherit" 
          onClick={() => navigate('/concepts')}
          startIcon={<ArrowLeft size={18} />}
          sx={{ mb: 2, color: 'text.secondary' }}
        >
          Voltar
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          📝 Quiz: {quizData.concept}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Questão {currentIndex + 1} de {questions.length}
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <LinearProgress 
          variant="determinate" 
          value={((currentIndex + (feedback ? 1 : 0)) / questions.length) * 100} 
          sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(148, 163, 184, 0.2)' }}
        />
      </Box>

      <Card sx={{ mb: 4, overflow: 'visible' }}>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Chip 
              label={currentQuestion.difficulty === 1 ? 'Fácil' : currentQuestion.difficulty === 2 ? 'Médio' : 'Difícil'} 
              color={currentQuestion.difficulty === 1 ? 'success' : currentQuestion.difficulty === 2 ? 'warning' : 'error'}
              variant="outlined"
              size="small"
              sx={{ fontWeight: 700 }}
            />
            <Chip 
              label={
                currentQuestion.question_type === 'multiple_choice' ? 'Múltipla Escolha' :
                currentQuestion.question_type === 'true_false' ? 'V ou F' :
                currentQuestion.question_type === 'fill_blank' ? 'Preenchimento' : 'Cálculo'
              } 
              color="primary"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 4, lineHeight: 1.6 }}>
            {currentQuestion.statement}
          </Typography>

          {/* Options */}
          {(currentQuestion.question_type === 'multiple_choice' || currentQuestion.question_type === 'true_false') && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {currentQuestion.options?.map((option, i) => {
                const isSelected = selectedAnswer === option.id;
                const isCorrectOption = feedback && option.text === feedback.correct_answer;
                const isIncorrectSelected = feedback && isSelected && !feedback.is_correct;
                
                let borderColor = 'rgba(148, 163, 184, 0.2)';
                let bgcolor = 'background.paper';
                if (isSelected) {
                  borderColor = 'primary.main';
                  bgcolor = 'rgba(58, 129, 243, 0.05)';
                }
                if (isCorrectOption) {
                  borderColor = 'success.main';
                  bgcolor = 'rgba(16, 185, 129, 0.1)';
                } else if (isIncorrectSelected) {
                  borderColor = 'error.main';
                  bgcolor = 'rgba(239, 68, 68, 0.1)';
                }

                return (
                  <Button
                    key={option.id}
                    variant="outlined"
                    onClick={() => !feedback && setSelectedAnswer(option.id)}
                    disabled={!!feedback}
                    sx={{
                      justifyContent: 'flex-start',
                      p: 2,
                      textAlign: 'left',
                      borderColor: borderColor,
                      bgcolor: bgcolor,
                      borderWidth: 2,
                      color: 'text.primary',
                      '&:hover': {
                        borderColor: feedback ? borderColor : 'primary.main',
                        bgcolor: feedback ? bgcolor : 'rgba(58, 129, 243, 0.05)',
                        borderWidth: 2,
                      }
                    }}
                  >
                    <Box sx={{ 
                      width: 28, height: 28, borderRadius: '50%', 
                      bgcolor: isSelected ? 'primary.main' : 'rgba(148, 163, 184, 0.1)', 
                      color: isSelected ? '#fff' : 'text.secondary',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      mr: 2, fontWeight: 700, flexShrink: 0
                    }}>
                      {optionLabels[i]}
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: isSelected ? 600 : 400, flexGrow: 1 }}>
                      {option.text}
                    </Typography>
                    {isCorrectOption && <CheckCircle2 color="#10b981" />}
                    {isIncorrectSelected && <XCircle color="#ef4444" />}
                  </Button>
                );
              })}
            </Box>
          )}

          {/* Text Input */}
          {(currentQuestion.question_type === 'fill_blank' || currentQuestion.question_type === 'math_problem') && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder={currentQuestion.question_type === 'math_problem' ? 'Ex: 15.5' : 'Digite sua resposta'}
                value={inputAnswer}
                onChange={(e) => setInputAnswer(e.target.value)}
                disabled={!!feedback}
                InputProps={{ sx: { fontSize: '1.2rem', py: 1 } }}
              />
            </Box>
          )}

          {/* Hint */}
          {!feedback && (
            <Box sx={{ mt: 4 }}>
              <Button 
                variant="text" 
                color="warning" 
                onClick={handleGetHint} 
                disabled={hintUsed}
                startIcon={<Lightbulb size={20} />}
                sx={{ fontWeight: 600 }}
              >
                {hintUsed ? 'Dica usada (-5%)' : 'Pedir Dica (-5%)'}
              </Button>
              {hint && (
                <Alert severity="warning" sx={{ mt: 2, '& .MuiAlert-message': { fontSize: '1rem' } }}>
                  {hint}
                </Alert>
              )}
            </Box>
          )}

          {/* Feedback Section */}
          {feedback && (
            <Alert 
              severity={feedback.is_correct ? 'success' : 'error'} 
              sx={{ mt: 4, '& .MuiAlert-message': { width: '100%' }, p: 3, borderRadius: 2 }}
              iconMapping={{
                success: <CheckCircle2 size={28} />,
                error: <XCircle size={28} />
              }}
            >
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8, fontSize: '1.1rem', mb: feedback.mastery_level !== undefined ? 3 : 0 }}>
                {feedback.feedback}
              </Typography>
              {feedback.mastery_level !== undefined && (
                <Box sx={{ width: '100%', mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Atualização de Domínio</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>{Math.round(feedback.mastery_level)}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={feedback.mastery_level} 
                    sx={{ height: 6, borderRadius: 3 }} 
                    color={feedback.is_correct ? 'success' : 'error'}
                  />
                </Box>
              )}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        {!feedback ? (
          <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            onClick={handleSubmit} 
            disabled={submitting}
            sx={{ px: 6, py: 1.5, fontSize: '1.1rem', borderRadius: 8 }}
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Confirmar Resposta'}
          </Button>
        ) : !feedback.is_quiz_complete ? (
          <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            onClick={handleNext}
            sx={{ px: 6, py: 1.5, fontSize: '1.1rem', borderRadius: 8 }}
          >
            Próxima Questão
          </Button>
        ) : (
          <Button 
            variant="contained" 
            color="secondary" 
            size="large" 
            onClick={() => navigate(`/quiz-result/${quizData.quiz_attempt_id}`)}
            sx={{ px: 6, py: 1.5, fontSize: '1.1rem', borderRadius: 8 }}
          >
            Ver Resultado Completo
          </Button>
        )}
      </Box>
    </Box>
  );
}
