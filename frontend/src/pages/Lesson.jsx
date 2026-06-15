import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { conceptsAPI } from '../api/client';
import AITutorChat from '../components/AITutorChat';
import * as LucideIcons from 'lucide-react';
import { BookOpen, Lightbulb, Key, FileEdit, Dumbbell, ArrowLeft } from 'lucide-react';
import { Box, Typography, Button, Tabs, Tab, Card, CardContent, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

export default function Lesson() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [concept, setConcept] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      conceptsAPI.detail(slug),
      conceptsAPI.lessons(slug),
    ]).then(([conceptRes, lessonsRes]) => {
      setConcept(conceptRes.data);
      setLessons(lessonsRes.data?.results || lessonsRes.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <CircularProgress />
    </Box>
  );

  if (!concept) return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h5" color="text.secondary">Conceito não encontrado</Typography>
    </Box>
  );

  const lesson = lessons[0] || {};

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const processBold = (text) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => i % 2 === 1 ? <strong key={i} style={{ color: 'var(--mui-palette-primary-main)' }}>{part}</strong> : part);
  };

  const renderContent = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    const elements = [];
    let inTable = false;
    let tableRows = [];

    const processLine = (line, idx) => {
      if (line.startsWith('### ')) return <Typography key={idx} variant="h6" sx={{ mt: 3, mb: 2, fontWeight: 700 }}>{line.slice(4)}</Typography>;
      if (line.startsWith('## ')) return <Typography key={idx} variant="h5" sx={{ mt: 4, mb: 2, fontWeight: 800, color: 'primary.main' }}>{line.slice(3)}</Typography>;
      if (line.startsWith('# ')) return <Typography key={idx} variant="h4" sx={{ mt: 4, mb: 3, fontWeight: 800 }}>{line.slice(2)}</Typography>;
      if (line.startsWith('> ')) return (
        <Box key={idx} sx={{ p: 2, my: 3, borderLeft: '4px solid', borderColor: 'secondary.main', bgcolor: 'rgba(0, 209, 119, 0.05)', borderRadius: '0 8px 8px 0' }}>
          <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>{processBold(line.slice(2))}</Typography>
        </Box>
      );
      if (line.startsWith('- ') || line.startsWith('* ')) return (
        <Box component="li" key={idx} sx={{ ml: 3, mb: 1 }}>
          <Typography component="span" variant="body1" sx={{ lineHeight: 1.8 }}>{processBold(line.slice(2))}</Typography>
        </Box>
      );
      if (/^\d+\.\s/.test(line)) return (
        <Box component="li" key={idx} sx={{ ml: 3, mb: 1 }}>
          <Typography component="span" variant="body1" sx={{ lineHeight: 1.8 }}>{processBold(line.replace(/^\d+\.\s/, ''))}</Typography>
        </Box>
      );
      if (line.trim() === '') return <Box key={idx} sx={{ height: 16 }} />;
      return <Typography key={idx} variant="body1" sx={{ mb: 2, lineHeight: 1.8, fontSize: '1.05rem', color: 'text.primary' }}>{processBold(line)}</Typography>;
    };

    lines.forEach((line, idx) => {
      if (line.includes('|') && line.trim().startsWith('|')) {
        if (!inTable) { inTable = true; tableRows = []; }
        if (!line.match(/^[\s|:-]+$/)) { 
          const cells = line.split('|').filter(c => c.trim());
          tableRows.push(cells.map(c => c.trim()));
        }
      } else {
        if (inTable) {
          elements.push(
            <TableContainer component={Paper} key={`table-${idx}`} sx={{ my: 4, bgcolor: 'background.default', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'rgba(58, 129, 243, 0.1)' }}>
                  <TableRow>{tableRows[0]?.map((c, i) => <TableCell key={i} sx={{ fontWeight: 'bold' }}>{c}</TableCell>)}</TableRow>
                </TableHead>
                <TableBody>
                  {tableRows.slice(1).map((row, ri) => (
                    <TableRow key={ri} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      {row.map((c, ci) => <TableCell key={ci}>{c}</TableCell>)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          );
          inTable = false;
          tableRows = [];
        }
        elements.push(processLine(line, idx));
      }
    });

    if (inTable && tableRows.length > 0) {
      elements.push(
        <TableContainer component={Paper} key="table-final" sx={{ my: 4, bgcolor: 'background.default', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'rgba(58, 129, 243, 0.1)' }}>
              <TableRow>{tableRows[0]?.map((c, i) => <TableCell key={i} sx={{ fontWeight: 'bold' }}>{c}</TableCell>)}</TableRow>
            </TableHead>
            <TableBody>
              {tableRows.slice(1).map((row, ri) => (
                <TableRow key={ri} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  {row.map((c, ci) => <TableCell key={ci}>{c}</TableCell>)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    return <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>{elements}</Box>;
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out', maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Button 
          variant="text" 
          color="inherit" 
          onClick={() => navigate('/concepts')}
          startIcon={<ArrowLeft size={18} />}
          sx={{ mb: 2, color: 'text.secondary' }}
        >
          Voltar aos Conceitos
        </Button>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
        <Box sx={{ color: 'primary.main', display: 'flex' }}>
          {(() => {
            const Icon = LucideIcons[concept.icon] || LucideIcons.BookOpen;
            return <Icon size={48} />;
          })()}
        </Box>
        <Box>
          <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, mb: 1 }}>{concept.name}</Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>{concept.description}</Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab icon={<BookOpen size={18} />} iconPosition="start" label="Aula Teórica" sx={{ fontWeight: 600, fontSize: '1rem', textTransform: 'none' }} />
          <Tab icon={<Lightbulb size={18} />} iconPosition="start" label="Exemplos Práticos" sx={{ fontWeight: 600, fontSize: '1rem', textTransform: 'none' }} />
          <Tab icon={<Key size={18} />} iconPosition="start" label="Pontos-Chave" sx={{ fontWeight: 600, fontSize: '1rem', textTransform: 'none' }} />
        </Tabs>
      </Box>

      {/* Content */}
      <Card sx={{ mb: 6 }}>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          {activeTab === 0 && renderContent(lesson.content)}
          {activeTab === 1 && renderContent(lesson.practical_examples)}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4, fontWeight: 800, color: 'primary.main' }}>
                <Key size={28} /> Pontos-Chave
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                {lesson.key_points?.split(';').map((point, i) => (
                  <Box component="li" key={i} sx={{ mb: 2, pl: 1 }}>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                      {point.trim()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 8, flexWrap: 'wrap' }}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large" 
          onClick={() => navigate(`/quiz/${slug}`)} 
          startIcon={<FileEdit size={22} />}
          sx={{ py: 1.5, px: 4, fontSize: '1.1rem' }}
        >
          Fazer Quiz
        </Button>
        <Button 
          variant="outlined" 
          color="primary" 
          size="large" 
          onClick={() => navigate(`/exercises/${slug}`)} 
          startIcon={<Dumbbell size={22} />}
          sx={{ py: 1.5, px: 4, fontSize: '1.1rem' }}
        >
          Exercícios
        </Button>
      </Box>

      <AITutorChat conceptSlug={slug} />
    </Box>
  );
}
