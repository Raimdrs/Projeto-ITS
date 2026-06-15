import { useState } from 'react';
import { simulationAPI } from '../api/client';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Box, Typography, Button, Card, CardContent, Grid, TextField, Tabs, Tab, CircularProgress, Paper, Divider } from '@mui/material';
import { Rocket, BarChart3, ShieldAlert, Diamond, Calculator, TrendingUp } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function Simulations() {
  const [activeTab, setActiveTab] = useState('compound');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Compound Interest Form
  const [ciForm, setCiForm] = useState({ principal: 1000, annual_rate: 12, months: 60, monthly_contribution: 200 });
  // Budget Form
  const [budgetForm, setBudgetForm] = useState({ income: 5000, expenses: { moradia: 1500, alimentacao: 800, transporte: 300, lazer: 400, outros: 300 } });
  // Emergency Fund Form
  const [efForm, setEfForm] = useState({ monthly_expenses: 3000, months: 6, current_savings: 0, monthly_contribution: 500 });
  // Investment Comparison
  const [invForm, setInvForm] = useState({ principal: 10000, monthly_contribution: 500, months: 60 });

  const handleSimulate = async () => {
    setLoading(true);
    setResult(null);
    try {
      let res;
      if (activeTab === 'compound') res = await simulationAPI.compoundInterest(ciForm);
      else if (activeTab === 'budget') res = await simulationAPI.budget(budgetForm);
      else if (activeTab === 'emergency') res = await simulationAPI.emergencyFund(efForm);
      else if (activeTab === 'investment') res = await simulationAPI.investment(invForm);
      setResult(res.data);
    } catch (err) {
      alert('Erro na simulação: ' + (err.response?.data?.detail || 'Tente novamente'));
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'compound', label: 'Juros Compostos', icon: <Rocket size={20} /> },
    { id: 'budget', label: 'Orçamento', icon: <BarChart3 size={20} /> },
    { id: 'emergency', label: 'Reserva', icon: <ShieldAlert size={20} /> },
    { id: 'investment', label: 'Investimentos', icon: <Diamond size={20} /> },
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setResult(null);
  };

  const renderInput = (label, value, onChange, type = 'number') => (
    <TextField
      fullWidth
      label={label}
      type={type}
      variant="outlined"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      sx={{ mb: 2 }}
    />
  );

  const formatBRL = (v) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" gutterBottom sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
          Simulações
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Experimente cenários financeiros reais
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          {tabs.map(t => (
            <Tab 
              key={t.id} 
              value={t.id} 
              icon={t.icon} 
              iconPosition="start" 
              label={t.label} 
              sx={{ fontWeight: 600, fontSize: '1rem', textTransform: 'none' }} 
            />
          ))}
        </Tabs>
      </Box>

      <Grid sx={{ alignItems: 'stretch' }} container spacing={4}>
        {/* Form Panel */}
        <Grid size={{ xs: 12, md: 5, lg: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Calculator size={20} color="#3a81f3" /> Parâmetros
              </Typography>

              <Box component="form" noValidate autoComplete="off">
                {activeTab === 'compound' && (
                  <>
                    {renderInput('Capital Inicial (R$)', ciForm.principal, v => setCiForm({ ...ciForm, principal: v }))}
                    {renderInput('Taxa Anual (%)', ciForm.annual_rate, v => setCiForm({ ...ciForm, annual_rate: v }))}
                    {renderInput('Período (meses)', ciForm.months, v => setCiForm({ ...ciForm, months: v }))}
                    {renderInput('Aporte Mensal (R$)', ciForm.monthly_contribution, v => setCiForm({ ...ciForm, monthly_contribution: v }))}
                  </>
                )}

                {activeTab === 'budget' && (
                  <>
                    {renderInput('Renda Mensal (R$)', budgetForm.income, v => setBudgetForm({ ...budgetForm, income: v }))}
                    <Divider sx={{ my: 3 }}><Typography variant="body2" color="text.secondary">Despesas Fixas e Variáveis</Typography></Divider>
                    {Object.entries(budgetForm.expenses).map(([key, val]) => (
                      <TextField
                        key={key}
                        fullWidth
                        label={key.charAt(0).toUpperCase() + key.slice(1)}
                        type="number"
                        variant="outlined"
                        value={val}
                        onChange={e => setBudgetForm({ ...budgetForm, expenses: { ...budgetForm.expenses, [key]: Number(e.target.value) } })}
                        sx={{ mb: 2 }}
                      />
                    ))}
                  </>
                )}

                {activeTab === 'emergency' && (
                  <>
                    {renderInput('Despesas Mensais (R$)', efForm.monthly_expenses, v => setEfForm({ ...efForm, monthly_expenses: v }))}
                    {renderInput('Meses de Cobertura', efForm.months, v => setEfForm({ ...efForm, months: v }))}
                    {renderInput('Economia Atual (R$)', efForm.current_savings, v => setEfForm({ ...efForm, current_savings: v }))}
                    {renderInput('Aporte Mensal (R$)', efForm.monthly_contribution, v => setEfForm({ ...efForm, monthly_contribution: v }))}
                  </>
                )}

                {activeTab === 'investment' && (
                  <>
                    {renderInput('Capital Inicial (R$)', invForm.principal, v => setInvForm({ ...invForm, principal: v }))}
                    {renderInput('Aporte Mensal (R$)', invForm.monthly_contribution, v => setInvForm({ ...invForm, monthly_contribution: v }))}
                    {renderInput('Período (meses)', invForm.months, v => setInvForm({ ...invForm, months: v }))}
                  </>
                )}

                <Button 
                  fullWidth 
                  variant="contained" 
                  color="primary" 
                  size="large" 
                  onClick={handleSimulate} 
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Calculator size={20} />}
                  sx={{ mt: 2, py: 1.5, fontSize: '1.1rem' }}
                >
                  {loading ? 'Calculando...' : 'Simular'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Results Panel */}
        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
          <Card sx={{ height: '100%', bgcolor: result ? 'background.paper' : 'rgba(148, 163, 184, 0.05)' }}>
            <CardContent sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 4, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp size={20} color="#00d177" /> Resultado
              </Typography>

              {!result && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, py: 8, opacity: 0.5 }}>
                  <Calculator size={64} style={{ marginBottom: 16 }} />
                  <Typography variant="h6">Configure e clique em Simular</Typography>
                </Box>
              )}

              {result && activeTab === 'compound' && (
                <Box>
                  <Paper sx={{ p: 3, mb: 3, bgcolor: 'rgba(58, 129, 243, 0.1)', border: '1px solid rgba(58, 129, 243, 0.3)', borderRadius: 2 }}>
                    <Typography variant="body2" color="primary.main" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Montante Final</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main' }}>{formatBRL(result.final_amount)}</Typography>
                  </Paper>
                  
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Paper sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2, border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>Total Investido</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>{formatBRL(result.total_invested)}</Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Paper sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2, border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                        <Typography variant="body2" color="success.main" sx={{ fontWeight: 600, mb: 1 }}>Juros Ganhos</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>{formatBRL(result.total_interest)}</Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {result.projection?.length > 0 && (
                    <Box sx={{ height: 350, mt: 4 }}>
                      <Line
                        data={{
                          labels: result.projection.map(p => `${p.month}m`),
                          datasets: [
                            { label: 'Montante', data: result.projection.map(p => p.total), borderColor: '#3a81f3', backgroundColor: 'rgba(58, 129, 243, 0.1)', fill: true, tension: 0.3 },
                            { label: 'Investido', data: result.projection.map(p => p.invested), borderColor: '#64748b', borderDash: [5, 5], tension: 0.3 },
                          ],
                        }}
                        options={{
                          responsive: true, maintainAspectRatio: false,
                          plugins: { legend: { labels: { color: '#94a3b8' } } },
                          scales: { y: { grid: { color: 'rgba(148,163,184,0.08)' }, ticks: { color: '#94a3b8' } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } },
                        }}
                      />
                    </Box>
                  )}
                </Box>
              )}

              {result && activeTab === 'budget' && (
                <Box>
                  <Paper sx={{ p: 3, mb: 3, bgcolor: result.balance >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: '1px solid', borderColor: result.balance >= 0 ? 'success.main' : 'error.main', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ color: result.balance >= 0 ? 'success.main' : 'error.main', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Saldo Mensal</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: result.balance >= 0 ? 'success.main' : 'error.main' }}>{formatBRL(result.balance)}</Typography>
                  </Paper>
                  
                  <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>{result.message}</Typography>
                  </Paper>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">Taxa de economia:</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{result.savings_rate}%</Typography>
                  </Box>
                </Box>
              )}

              {result && activeTab === 'emergency' && (
                <Box>
                  <Paper sx={{ p: 3, mb: 3, bgcolor: 'rgba(58, 129, 243, 0.1)', border: '1px solid rgba(58, 129, 243, 0.3)', borderRadius: 2 }}>
                    <Typography variant="body2" color="primary.main" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Meta da Reserva</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main' }}>{formatBRL(result.target)}</Typography>
                  </Paper>
                  
                  <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      {result.months_to_goal ? `Tempo estimado para atingir a meta: ${Math.ceil(result.months_to_goal)} meses` : 'Defina um aporte mensal maior que zero para ver o tempo estimado.'}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {result && activeTab === 'investment' && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary', fontWeight: 600 }}>Comparação de Investimentos</Typography>
                  <Grid container spacing={2}>
                    {result.comparisons?.map((comp, i) => (
                      <Grid key={i} size={{ xs: 12 }}>
                        <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.default', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>{comp.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {comp.annual_rate}% a.a. • Risco: {comp.risk}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: 'success.main', mb: 0.5 }}>{formatBRL(comp.final_amount)}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Rendimento: +{formatBRL(comp.total_interest)}
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
