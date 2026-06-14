import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI } from '../api/client';
import ProgressBar from '../components/ProgressBar';

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

  if (loading || !quizData) return <div className="loading-spinner"><div className="spinner" /></div>;

  const questions = quizData.questions || [];
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

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
        // Quiz finished — navigate to results
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
    <div className="quiz-container animate-fade-in">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/concepts')}>
          ← Voltar
        </button>
      </div>

      <div className="quiz-header">
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>
          📝 Quiz: {quizData.concept}
        </h2>
        <span className="quiz-progress-text">
          Questão {currentIndex + 1} de {questions.length}
        </span>
      </div>

      <ProgressBar
        value={currentIndex + (feedback ? 1 : 0)}
        max={questions.length}
        showLabel={false}
        height="6px"
      />

      <div className="question-card" style={{ marginTop: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <span className={`badge ${
            currentQuestion.difficulty === 1 ? 'badge-success' :
            currentQuestion.difficulty === 2 ? 'badge-warning' : 'badge-danger'
          }`}>
            {currentQuestion.difficulty === 1 ? '🟢 Fácil' :
             currentQuestion.difficulty === 2 ? '🟡 Médio' : '🔴 Difícil'}
          </span>
          <span className="badge badge-primary">
            {currentQuestion.question_type === 'multiple_choice' ? 'Múltipla Escolha' :
             currentQuestion.question_type === 'true_false' ? 'V ou F' :
             currentQuestion.question_type === 'fill_blank' ? 'Preenchimento' : 'Cálculo'}
          </span>
        </div>

        <div className="question-statement">{currentQuestion.statement}</div>

        {/* Options for MC and TF */}
        {(currentQuestion.question_type === 'multiple_choice' || currentQuestion.question_type === 'true_false') && (
          <div className="question-options">
            {currentQuestion.options?.map((option, i) => (
              <button
                key={option.id}
                className={`option-btn ${
                  selectedAnswer === option.id ? 'selected' : ''
                } ${
                  feedback && option.text === feedback.correct_answer ? 'correct' : ''
                } ${
                  feedback && selectedAnswer === option.id && !feedback.is_correct ? 'incorrect' : ''
                }`}
                onClick={() => !feedback && setSelectedAnswer(option.id)}
                disabled={!!feedback}
              >
                <span className="option-label">{optionLabels[i]}</span>
                <span>{option.text}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input for fill_blank and math_problem */}
        {(currentQuestion.question_type === 'fill_blank' || currentQuestion.question_type === 'math_problem') && (
          <div style={{ marginTop: 'var(--space-4)' }}>
            <input
              type="text"
              className="form-input"
              placeholder={currentQuestion.question_type === 'math_problem' ? 'Digite o resultado numérico...' : 'Digite sua resposta...'}
              value={inputAnswer}
              onChange={(e) => setInputAnswer(e.target.value)}
              disabled={!!feedback}
              style={{ fontSize: 'var(--font-size-lg)' }}
            />
          </div>
        )}

        {/* Hint */}
        {!feedback && (
          <div style={{ marginTop: 'var(--space-4)' }}>
            <button className="btn btn-outline btn-sm" onClick={handleGetHint} disabled={hintUsed}>
              💡 {hintUsed ? 'Dica usada (-5%)' : 'Pedir Dica (-5%)'}
            </button>
            {hint && (
              <div style={{
                marginTop: 'var(--space-3)', padding: 'var(--space-4)',
                background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-md)',
                color: 'var(--warning-400)', fontSize: 'var(--font-size-sm)'
              }}>
                💡 {hint}
              </div>
            )}
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div style={{
            marginTop: 'var(--space-6)', padding: 'var(--space-5)',
            background: feedback.is_correct ? 'rgba(0, 209, 119, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            border: `1px solid ${feedback.is_correct ? 'rgba(0, 209, 119, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ whiteSpace: 'pre-line', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
              {feedback.feedback}
            </div>
            {feedback.mastery_level !== undefined && (
              <div style={{ marginTop: 'var(--space-3)' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                  Domínio: {Math.round(feedback.mastery_level)}%
                </span>
                <ProgressBar value={feedback.mastery_level} variant="auto" showLabel={false} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
        {!feedback ? (
          <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Verificando...' : 'Confirmar Resposta'}
          </button>
        ) : !feedback.is_quiz_complete ? (
          <button className="btn btn-primary btn-lg" onClick={handleNext}>
            Próxima Questão →
          </button>
        ) : (
          <button className="btn btn-accent btn-lg" onClick={() => navigate(`/quiz-result/${quizData.quiz_attempt_id}`)}>
            Ver Resultado 🏆
          </button>
        )}
      </div>
    </div>
  );
}
