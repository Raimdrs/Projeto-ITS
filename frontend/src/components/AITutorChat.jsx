import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, User, Sparkles } from 'lucide-react';
import { tutorAPI } from '../api/client';
import { Box, Paper, IconButton, Typography, TextField, Fab, CircularProgress, Avatar } from '@mui/material';

export default function AITutorChat({ conceptSlug }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Olá! Sou o FinTutor, seu assistente de IA. Vi que você está estudando esta aula. O que acha de eu te fazer uma pergunta para testar seus conhecimentos? Ou você tem alguma dúvida sobre o texto?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const newMessages = [...messages, { role: 'user', text: userText }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      
      const response = await tutorAPI.chat({
        concept_slug: conceptSlug,
        message: userText,
        history: history
      });

      setMessages([...newMessages, { role: 'model', text: response.data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: 'model', text: 'Desculpe, ocorreu um erro ao me comunicar com o servidor.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end'
    }}>
      {/* Chat Window */}
      {isOpen && (
        <Paper elevation={6} sx={{
          width: 350,
          height: 500,
          display: 'flex',
          flexDirection: 'column',
          mb: 2,
          overflow: 'hidden',
          borderRadius: 3,
          animation: 'slideUp 0.3s ease-out'
        }}>
          {/* Header */}
          <Box sx={{
            p: 2,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Bot size={24} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Tutor IA</Typography>
            </Box>
            <IconButton onClick={() => setIsOpen(false)} size="small" sx={{ color: 'inherit' }}>
              <X size={20} />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            bgcolor: 'background.default'
          }}>
            {messages.map((msg, i) => (
              <Box key={i} sx={{
                display: 'flex',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                gap: 1.5,
                alignItems: 'flex-start'
              }}>
                <Avatar sx={{ 
                  width: 32, height: 32, 
                  bgcolor: msg.role === 'user' ? 'primary.main' : 'secondary.main',
                  color: 'white'
                }}>
                  {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </Avatar>
                
                <Box sx={{
                  bgcolor: msg.role === 'user' ? 'primary.main' : 'background.paper',
                  color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary',
                  p: 1.5,
                  borderRadius: 2,
                  borderTopRightRadius: msg.role === 'user' ? 0 : 8,
                  borderTopLeftRadius: msg.role === 'model' ? 0 : 8,
                  maxWidth: '80%',
                  border: msg.role === 'model' ? '1px solid' : 'none',
                  borderColor: 'divider',
                  boxShadow: 1
                }}>
                  <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                    {msg.text}
                  </Typography>
                </Box>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', color: 'text.secondary', ml: 1 }}>
                <CircularProgress size={16} color="inherit" />
                <Typography variant="caption">Pensando...</Typography>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box component="form" onSubmit={handleSend} sx={{
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            gap: 1,
            bgcolor: 'background.paper'
          }}>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Digite sua dúvida..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              InputProps={{
                sx: { borderRadius: 4, bgcolor: 'background.default' }
              }}
            />
            <IconButton
              type="submit"
              color="primary"
              disabled={loading || !input.trim()}
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' }
              }}
            >
              <Send size={18} />
            </IconButton>
          </Box>
        </Paper>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <Fab 
          color="secondary" 
          aria-label="chat" 
          onClick={() => setIsOpen(true)}
          sx={{ 
            width: 60, height: 60,
            animation: 'pulse 2s infinite',
            '&:hover': { transform: 'scale(1.1)', transition: 'transform 0.2s' }
          }}
        >
          <Sparkles size={28} />
        </Fab>
      )}
    </Box>
  );
}
