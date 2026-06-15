import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { conceptsAPI } from '../api/client';
import * as LucideIcons from 'lucide-react';
import { Box, Typography, Grid, Card, CardContent, CardActionArea, LinearProgress, Chip, CircularProgress, Avatar } from '@mui/material';

export default function ConceptList() {
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    conceptsAPI.list().then(res => {
      setConcepts(res.data?.results || res.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const statusLabel = { mastered: 'Dominado', in_progress: 'Em Progresso', available: 'Disponível', locked: 'Bloqueado' };
  const statusColor = { mastered: 'success', in_progress: 'primary', available: 'warning', locked: 'default' };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" gutterBottom sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
          Conceitos
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Explore os módulos de educação financeira
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {concepts.map((concept, i) => {
          const isLocked = concept.status === 'locked';
          const Icon = LucideIcons[concept.icon] || LucideIcons.BookOpen;

          return (
            <Grid key={concept.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                opacity: isLocked ? 0.6 : 1,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: isLocked ? 'none' : 'translateY(-4px)',
                  boxShadow: isLocked ? 'none' : '0 12px 24px -10px rgba(58, 129, 243, 0.3)'
                }
              }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, bgcolor: concept.color || 'primary.main' }} />
                
                <CardActionArea 
                  disabled={isLocked}
                  onClick={() => navigate(`/concept/${concept.slug}`)}
                  sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', p: 1 }}
                >
                  <CardContent sx={{ width: '100%', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: `${concept.color}20`, color: concept.color, width: 48, height: 48 }}>
                        <Icon size={24} />
                      </Avatar>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        {concept.name}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 40, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {concept.description}
                    </Typography>

                    <Box sx={{ width: '100%', mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Domínio</Typography>
                        <Typography variant="caption" color="text.primary" sx={{ fontWeight: 600 }}>{concept.mastery_level || 0}%</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={concept.mastery_level || 0} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: 'rgba(148, 163, 184, 0.2)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: concept.mastery_level >= 80 ? 'success.main' : 'primary.main'
                          }
                        }} 
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                      <Chip 
                        label={`${isLocked ? '🔒 ' : ''}${statusLabel[concept.status] || concept.status}`}
                        color={statusColor[concept.status] || 'default'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      {concept.prerequisites?.length > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          {concept.prerequisites.length} pré-requisito(s)
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
