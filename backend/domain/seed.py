"""
Seed data for the ITS — Professional Level (Original Curriculum Deepened).
Run with: python -X utf8 -c "exec(open('domain/seed.py', encoding='utf-8').read())"
"""
import os
import django

if not 'DJANGO_SETTINGS_MODULE' in os.environ:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'its_project.settings')
    django.setup()

from domain.models import Concept, ConceptPrerequisite, Lesson
from learning.models import Question, QuestionOption

print("🌱 Iniciando seed de dados (Conteúdo Robusto e Profissional)...")

# ============================================================
# 1. CONCEITOS
# ============================================================
concepts_data = [
    # Módulo 1 - Fundamentos Financeiros
    {
        'name': 'Receita e Despesa',
        'slug': 'receita-e-despesa',
        'description': 'Análise de fluxo de caixa pessoal. Diferenciação entre receita bruta/líquida e despesas fixas/variáveis estruturadas.',
        'icon': '💰', 'color': '#4CAF50', 'order': 1,
    },
    {
        'name': 'Orçamento Pessoal',
        'slug': 'orcamento-pessoal',
        'description': 'Estruturação orçamentária profissional utilizando metodologias analíticas e reconciliação mensal.',
        'icon': '📋', 'color': '#2196F3', 'order': 2,
    },
    {
        'name': 'Planejamento Financeiro',
        'slug': 'planejamento-financeiro',
        'description': 'Definição de metas SMART, ciclo de vida financeiro e projeção de necessidade de capital.',
        'icon': '🗺️', 'color': '#FF9800', 'order': 3,
    },
    {
        'name': 'Reserva de Emergência',
        'slug': 'reserva-de-emergencia',
        'description': 'Gestão de liquidez (Tier 1 e Tier 2), cálculo de custo de vida e mitigação de choques de renda.',
        'icon': '🛡️', 'color': '#E91E63', 'order': 4,
    },
    # Módulo 2 - Matemática Financeira
    {
        'name': 'Porcentagem',
        'slug': 'porcentagem',
        'description': 'Matemática das proporções aplicada a taxas financeiras, ágios, deságios e indexadores de mercado.',
        'icon': '➗', 'color': '#9C27B0', 'order': 5,
    },
    {
        'name': 'Juros Simples',
        'slug': 'juros-simples',
        'description': 'Regime de capitalização linear, valor do dinheiro no tempo e desconto de duplicatas comerciais.',
        'icon': '📈', 'color': '#00BCD4', 'order': 6,
    },
    {
        'name': 'Juros Compostos',
        'slug': 'juros-compostos',
        'description': 'O motor da formação de patrimônio: capitalização exponencial e o impacto do tempo no crescimento financeiro.',
        'icon': '🚀', 'color': '#3F51B5', 'order': 7,
    },
    {
        'name': 'Inflação',
        'slug': 'inflacao',
        'description': 'Corrosão do poder de compra (IPCA, IGPM), juros reais vs nominais e proteção patrimonial inflacionária.',
        'icon': '📉', 'color': '#F44336', 'order': 8,
    },
    # Módulo 3 - Investimentos
    {
        'name': 'Risco e Retorno',
        'slug': 'risco-e-retorno',
        'description': 'O trade-off fundamental das finanças: risco sistêmico, volatilidade e a exigência de prêmio de risco.',
        'icon': '⚖️', 'color': '#FFC107', 'order': 9,
    },
    {
        'name': 'Investimentos',
        'slug': 'investimentos',
        'description': 'Veículos de Renda Fixa e Variável, tributação, liquidez e a função da intermediação financeira.',
        'icon': '🏢', 'color': '#8BC34A', 'order': 10,
    },
    {
        'name': 'Diversificação de Carteira',
        'slug': 'diversificacao-de-carteira',
        'description': 'Construção de portfólio robusto via alocação de ativos e mitigação de risco não-sistemático por correlação.',
        'icon': '🧩', 'color': '#795548', 'order': 11,
    },
]

concepts = {}
for data in concepts_data:
    concept, _ = Concept.objects.update_or_create(slug=data['slug'], defaults=data)
    concepts[data['slug']] = concept
    print(f"  ✅ Criado: {concept.name}")

# ============================================================
# 2. PRÉ-REQUISITOS (Estrutura do Grafo)
# ============================================================
prerequisites = [
    ('orcamento-pessoal', 'receita-e-despesa'),
    ('planejamento-financeiro', 'orcamento-pessoal'),
    ('reserva-de-emergencia', 'planejamento-financeiro'),
    ('juros-simples', 'porcentagem'),
    ('juros-compostos', 'juros-simples'),
    ('inflacao', 'porcentagem'),
    ('risco-e-retorno', 'inflacao'),
    ('investimentos', 'risco-e-retorno'),
    ('investimentos', 'juros-compostos'),
    ('diversificacao-de-carteira', 'investimentos'),
]

print("\n📌 Criando pré-requisitos...")
for concept_slug, prereq_slug in prerequisites:
    ConceptPrerequisite.objects.get_or_create(
        concept=concepts[concept_slug], prerequisite=concepts[prereq_slug]
    )

# ============================================================
# 3. AULAS ROBUSTAS E PROFISSIONAIS
# ============================================================
print("\n📚 Criando aulas aprofundadas...")

lessons_data = {
    'receita-e-despesa': {
        'title': 'Análise Estrutural de Receitas e Despesas',
        'content': '''# Receitas e Despesas: A Base do Fluxo de Caixa

Para gerenciar finanças de forma profissional, o indivíduo deve encarar seu orçamento como o de uma empresa. A compreensão exata da origem e destino do dinheiro é o que separa a gestão amadora da gestão estruturada de patrimônio.

## Anatomia das Receitas
- **Receita Bruta**: É o valor nominal do seu salário ou faturamento antes de qualquer dedução tributária (IRPF, INSS, taxas de sindicato).
- **Receita Líquida**: O capital real que "entra no caixa". Profissionais baseiam seu padrão de vida estritamente na receita líquida.
- **Receitas Ativas vs. Passivas**: 
  - *Ativas* demandam a troca direta de tempo e esforço por dinheiro (trabalho CLT, autônomo).
  - *Passivas* são geradas independentemente do seu esforço diário (dividendos, aluguéis, direitos autorais).

## Estruturação de Despesas (DRE Pessoal)
Em vez de simplesmente listar gastos, deve-se categorizá-los sob a ótica de uma Demonstração de Resultado:
1. **Despesas Inelásticas (Fixas)**: Custos de manutenção da vida (moradia, saúde, seguros). São difíceis de reduzir no curto prazo sem drástica mudança de padrão.
2. **Despesas Elásticas (Variáveis)**: Custos que flutuam mês a mês (lazer, compras). São os alvos primários em um plano de reestruturação financeira.

A diferença entre a sua Receita Líquida e o total das suas Despesas é a sua **Capacidade de Geração de Caixa Livre (Free Cash Flow)**, que ditará o seu potencial de enriquecimento.''',
        'practical_examples': '''### Estudo de Caso: A Armadilha da Receita Bruta
Um jovem engenheiro é promovido para um salário bruto de R$ 10.000. Animado, ele assume uma prestação de carro de R$ 3.000/mês (30% do bruto).
Porém, após os descontos pesados de INSS (teto) e IR (alíquota de 27,5%), sua receita líquida real é próxima a R$ 7.500. A prestação do carro passa a consumir impressionantes 40% de todo o capital real que ele tem para viver.
**Lição**: Dimensionar passivos sempre em relação à capacidade real de geração de caixa pós-impostos.''',
        'key_points': 'Diferencie Receita Bruta da Líquida; Foque na expansão de Receitas Passivas no longo prazo; Classifique despesas em inelásticas e elásticas para otimizar cortes.',
    },
    'orcamento-pessoal': {
        'title': 'Orçamento Base-Zero e Reconciliação Mensal',
        'content': '''# Gestão Orçamentária Avançada

Um orçamento profissional não é apenas anotar no final do mês o que foi gasto (post-mortem financeiro), mas sim direcionar intencionalmente para onde cada centavo deve ir antes do mês começar.

## Modelos Orçamentários

### 1. A Regra 50/30/20 (Nível Intermediário)
- **50% Gastos Essenciais**: Moradia, mercado básico, saúde, transporte.
- **30% Gastos Discricionários**: Lazer, hobbies, compras, viagens.
- **20% Investimentos/Redução de Dívidas**: Construção de patrimônio ou eliminação de passivos onerosos.

### 2. Orçamento Base-Zero (ZBB) (Nível Profissional)
Na gestão ZBB, o seu orçamento mensal começa em R$ 0. Você pega toda a sua receita prevista e distribui em categorias (incluindo "Investimentos") até que sobre exatamente ZERO.
A premissa matemática: **Receitas - Despesas - Investimentos = 0**.
Se você quiser gastar a mais em lazer, é obrigado a subtrair o dinheiro de outra categoria orçamentária imediatamente.

## O Princípio "Pay Yourself First"
Em vez de esperar o final do mês para investir o que sobra (se sobrar), o profissional aloca a parcela de investimentos (os 20% do orçamento) no dia em que o salário cai na conta. Transformando o seu investimento futuro em uma "despesa" primária, você ajusta seu padrão de vida automaticamente aos 80% restantes.''',
        'practical_examples': '''### O ZBB em Prática
Receita Líquida Mensal: R$ 5.000
Alocação imediata (Pay Yourself First): -R$ 1.000 (Investimentos/Poupança)
Restam R$ 4.000.
Alocação Moradia: -R$ 2.000
Alocação Alimentação: -R$ 1.000
Alocação Transporte: -R$ 500
Alocação Lazer: -R$ 500
**Saldo a destinar: R$ 0.**
Neste modelo, não há sobras sem destino. Todo capital trabalha com um propósito.''',
        'key_points': 'Orçar é prever, não apenas anotar gastos; A Regra 50/30/20 é um ponto de partida sólido; O ZBB garante alocação intencional de 100% da receita; Pague a si mesmo primeiro automatizando os investimentos.',
    },
    'planejamento-financeiro': {
        'title': 'Planejamento Estratégico e Metas SMART',
        'content': '''# O Plano Diretor do Patrimônio

Planejamento financeiro trata de projetar suas necessidades de capital ao longo da linha do tempo da sua vida. Sem metas claras, o dinheiro é gasto na conveniência do curto prazo.

## O Ciclo de Vida Financeiro
1. **Fase de Acumulação (20 a 45 anos)**: Foco máximo em capacitação profissional para elevar receitas, aportes agressivos em investimentos de risco, e formação da reserva de emergência. O patrimônio líquido começa a crescer pela poupança ativa.
2. **Fase de Consolidação (45 a 60 anos)**: Atingimento do pico salarial. O patrimônio começa a crescer primariamente pelos rendimentos (juros compostos) mais do que pelos aportes. Ajuste gradual de risco.
3. **Fase de Usufruição (60+ anos)**: Aposentadoria e sucessão patrimonial. Foco na preservação de capital e geração de caixa previsível.

## Metas SMART
Metas financeiras precisam ser estruturadas para serem executáveis. A metodologia SMART exige que uma meta seja:
- **S**pecific (Específica): "Comprar um HB20 semi-novo".
- **M**easurable (Mensurável): "R$ 50.000".
- **A**chievable (Alcançável): "Poupando R$ 1.000 por mês, é possível."
- **R**elevant (Relevante): "Melhorar a locomoção da família."
- **T**ime-bound (Temporal): "Em 50 meses (pouco mais de 4 anos)."

Um plano financeiro robusto exige alinhar os aportes do orçamento pessoal às Metas SMART.''',
        'practical_examples': '''### Avaliando a Viabilidade de Metas
Alguém ganha R$ 4.000/mês e quer "Viajar para a Europa logo". Essa meta é difusa.
**Aplicando o SMART:**
"Viajar para Paris" (Específico)
"Custará R$ 15.000 com passagens e hotéis" (Mensurável)
"Daqui a 2 anos (24 meses)" (Temporal)
Isso exige um esforço de poupança de R$ 625/mês. Isso representa 15,6% da receita do indivíduo. A meta é **Alcançável** e **Relevante**, exigindo um corte de gastos no lazer atual para financiar o lazer futuro.''',
        'key_points': 'O patrimônio passa por acumulação, consolidação e usufruição; Metas vagas fracassam; A estrutura SMART transforma sonhos em cálculos matemáticos executáveis.',
    },
    'reserva-de-emergencia': {
        'title': 'Gestão de Liquidez e a Reserva de Emergência',
        'content': '''# A Defesa do Patrimônio Pessoal

A Reserva de Emergência é o fundo de capital criado para absorver choques de liquidez (ex: desemprego, problemas de saúde, manutenção urgente). Ela é o alicerce absoluto de qualquer plano financeiro. Sem ela, o investidor frequentemente se vê forçado a tomar dívidas a juros escorchantes ou vender ativos de longo prazo com enorme prejuízo.

## O Cálculo do Custo de Vida Essencial
O tamanho da reserva é ditado pelo seu custo de sobrevivência mensal. Isso exclui despesas elásticas como viagens e restaurantes de luxo. 
- *Gastos Essenciais = Aluguel/Prestação + Alimentação base + Saúde + Contas Básicas.*

## Dimensionamento da Reserva
O volume da reserva depende do risco de mercado e estabilidade de renda do indivíduo:
- **Servidores Públicos**: 3 a 6 meses do custo de vida. (Alta estabilidade de renda).
- **Trabalhadores CLT**: 6 meses do custo de vida. (Possuem seguro-desemprego e FGTS como buffer secundário).
- **Autônomos e Empreendedores**: 12 meses do custo de vida. (Renda extremamente variável e vulnerável a choques macroeconômicos).

## Alocação: A Regra de Ouro (Tiers de Liquidez)
O capital da reserva de emergência tem apenas dois objetivos: **Liquidez diária** e **Segurança Absoluta**.
Retorno não é o foco. A inflação corrói esse dinheiro aos poucos, o que é o "prêmio do seguro" que você paga para estar protegido.
- Onde investir: CDBs de liquidez diária (100% CDI) de grandes bancos, Tesouro Selic ou Fundos DI taxa zero.''',
        'practical_examples': '''### Estudo: O Perigo da Falta de Liquidez
Investidor X não fez reserva de emergência e aplicou todos os seus R$ 30.000 em ações, visando longo prazo. 
Em uma grave crise econômica, as ações caem 40% (seu saldo vira R$ 18.000) e simultaneamente ele perde o emprego. Precisando de dinheiro imediato para aluguel e alimentação, ele é forçado a vender as ações no fundo do poço, consolidando uma perda de R$ 12.000.
A reserva de emergência em liquidez (ex: Tesouro Selic) teria protegido a carteira de ações e evitado a perda.''',
        'key_points': 'A reserva serve para proteção (Liquidez e Segurança), não para rentabilidade (Retorno); Deve cobrir de 6 a 12 meses de custo de vida essencial; Evita a contração de dívidas abusivas ou venda forçada de ativos.',
    },
    'porcentagem': {
        'title': 'Matemática das Proporções Financeiras',
        'content': '''# Porcentagem: O Alfabeto Financeiro

As finanças operam primordialmente em taxas proporcionais (%), não em valores nominais absolutos. Compreender porcentagem é o pré-requisito para o cálculo de rendimentos, juros, descontos e inflação.

## O Que é a Porcentagem?
Porcentagem (ou percentagem) indica uma razão cujo denominador é 100.
Dizer "15%" é matematicamente idêntico a dizer `15 / 100` ou `0,15`.
Na formulação financeira, usamos a **forma unitária** (decimal). Exemplo: Um rendimento de 8% ao ano é representado como `0,08` nos cálculos de juros.

## Fatores de Multiplicação (Ágios e Deságios)
O mercado financeiro precifica ativos e rendimentos através da aplicação de Fatores.
- **Fator de Acréscimo (Aumento)**: É calculado como `1 + taxa`. Para dar um aumento de 20%, multiplica-se o valor por `1,20`.
- **Fator de Desconto (Queda)**: É calculado como `1 - taxa`. Se uma ação caiu 30%, seu novo valor é o original multiplicado por `0,70`.

## A Ilusão das Porcentagens Assimétricas
Um dos maiores erros analíticos ocorre ao somar e subtrair porcentagens em bases diferentes.
Se o seu portfólio sofreu uma perda (Drawdown) de **50%**, um ganho subsequente de 50% **não** devolverá seu patrimônio ao valor original. 
Se você tinha 100 e perde 50%, você fica com 50. Para voltar a 100, você não precisa de 50%, você precisa dobrar o capital, ou seja, um ganho de **100%**.
As perdas são sempre mais devastadoras que os ganhos proporcionais.''',
        'practical_examples': '''### Estudo: Descontos Compostos
Um título no tesouro teve deságio de 10% no primeiro dia e de 20% no segundo dia por estresse no mercado. A queda total não é 30% (10% + 20%).
O cálculo correto exige multiplicar os fatores de desconto:
Fator Final = (1 - 0,10) * (1 - 0,20) = 0,90 * 0,80 = 0,72.
A queda real foi de 28% (pois o título agora vale 72% do valor original).''',
        'key_points': 'Sempre transforme taxas (10%) em decimais (0,10) para uso em fórmulas; Fator de aumento = (1 + taxa) e de queda = (1 - taxa); Perdas requerem porcentagens maiores de ganhos para empatar.',
    },
    'juros-simples': {
        'title': 'Juros Simples e a Capitalização Linear',
        'content': '''# Juros Simples

O Juro é essencialmente o "aluguel" cobrado pelo uso do dinheiro ao longo do tempo. O regime de capitalização simples tem aplicação limitada no mundo real dos investimentos (que usam majoritariamente juros compostos), mas é a base conceitual e ainda é utilizado em operações de curtíssimo prazo e descontos de duplicatas/cheques.

## A Dinâmica Linear
Nos juros simples, a taxa de juros incide **apenas sobre o Capital Inicial** em todos os períodos. O rendimento é constante.
Se você emprestar R$ 1.000 a 10% ao mês, todo mês você ganhará exatos R$ 100, independente de quanto o montante total tenha crescido.

## A Fórmula Fundamental
**J = C * i * t**
Onde:
- **J** = Juros acumulados (O valor monetário ganho/pago).
- **C** = Capital Inicial (Valor Principal ou Present Value - PV).
- **i** = Taxa de juros, na forma unitária (ex: 5% = 0,05).
- **t** = Tempo (O período da aplicação).

**M = C + J** (O Montante final é o Capital somado aos Juros).

*Importante*: O prazo (t) e a taxa (i) devem obrigatoriamente estar na mesma unidade de tempo. Se a taxa é anual, o tempo deve ser em anos.''',
        'practical_examples': '''### Cálculo Direto de Desconto
Uma empresa precisa descontar uma duplicata de R$ 5.000 (Capital Inicial) em um banco que cobra juros simples de 3% ao mês. Faltam 4 meses (t) para o vencimento.
Juros = 5000 * 0,03 * 4
Juros = R$ 600.
A empresa pagará R$ 600 de juros pela antecipação, recebendo líquido R$ 4.400 na conta hoje. Como a incidência é sempre sobre os 5 mil, o valor juros é constante de R$ 150/mês.''',
        'key_points': 'Juros simples incidem sempre e exclusivamente sobre o Capital Inicial; O crescimento patrimonial num gráfico é uma linha reta (crescimento linear); Taxa e Tempo devem estar na mesma base temporal.',
    },
    'juros-compostos': {
        'title': 'Juros Compostos e o Efeito Exponencial',
        'content': '''# Juros Compostos: A Oitava Maravilha do Mundo

A imensa maioria do mercado financeiro e bancário opera em regime de juros compostos. Diferentemente do regime simples, aqui temos o efeito de **"Juros sobre Juros"**, gerando crescimento exponencial.

## A Dinâmica Exponencial
Nos juros compostos, a taxa incide não apenas sobre o capital inicial, mas sobre o **Montante atualizado** do período anterior. 
Se você investir R$ 1.000 a 10% ao ano:
- Ano 1: Ganha R$ 100 (10% de 1.000). Saldo: R$ 1.100.
- Ano 2: Ganha R$ 110 (10% de 1.100). Saldo: R$ 1.210.
- Ano 3: Ganha R$ 121 (10% de 1.210). Saldo: R$ 1.331.
Com o passar do tempo, a bola de neve acelera assustadoramente.

## A Equação Exponencial
**M = C * (1 + i)^t**
Onde:
- **M** = Montante Final (Future Value - FV).
- **C** = Capital Inicial.
- **i** = Taxa unitária.
- **t** = Tempo de investimento.

O "tempo" na equação dos juros compostos atua como uma **Potência**. Isso significa matematicamente que o Tempo é o fator mais explosivo da equação. Começar a investir cedo, mesmo com pouco dinheiro, supera em larga escala começar tarde com muito dinheiro.''',
        'practical_examples': '''### Estudo: O Tempo Vence o Aporte
Investidor A começa aos 20 anos, aporta R$ 300 por mês até os 30 anos e nunca mais coloca 1 centavo na conta (rendendo a 10% a.a. até os 60). Ele aportou apenas R$ 36.000 do próprio bolso.
Investidor B começa aos 30 anos, aporta os mesmos R$ 300 todos os meses, sem falhar, dos 30 até os 60 anos. Ele aportou R$ 108.000 do bolso.
Aos 60 anos, o Investidor A (que aportou 1/3 do valor) terá consideravelmente MAIS patrimônio que o B, pois seu dinheiro ficou sob a potência do tempo por 40 anos, gerando o "efeito bola de neve" que o B não conseguiu igualar em 30 anos.''',
        'key_points': 'Juros compostos crescem sobre o montante acumulado (efeito bola de neve); O fator "tempo" atua como potência matemática, sendo a variável mais importante; Dívidas no cartão de crédito usam juros compostos para arruinar devedores.',
    },
    'inflacao': {
        'title': 'Inflação e Preservação do Poder de Compra',
        'content': '''# A Corrosão Invisível do Dinheiro

A inflação é a elevação persistente e generalizada do nível de preços de uma economia. Quando a inflação sobe, o "poder de compra" do seu dinheiro despenca. Uma nota de R$ 100 continua sendo de 100, mas compra menos bens reais na prateleira do mercado.

## Índices de Mercado
- **IPCA (Índice Nacional de Preços ao Consumidor Amplo)**: O índice oficial da inflação no Brasil. Utilizado pelo Banco Central.
- **IGP-M**: Índice focado no mercado atacado e aluguéis. Costuma oscilar mais violentamente com o câmbio do Dólar.

## Juros Nominais vs. Juros Reais
O conceito mais vital em matemática financeira aplicada é entender que investir a 10% a.a. em um cenário onde a inflação foi de 8% a.a. não te enriquece de verdade na proporção de 10%.

- **Retorno Nominal**: O crescimento numérico bruto do capital na conta.
- **Retorno Real**: O crescimento ajustado pela inflação (o quanto de riqueza estrutural você realmente ganhou).

A Equação de Fisher ajustada define o ganho real de forma precisa:
**(1 + Taxa Real) = (1 + Taxa Nominal) / (1 + Inflação)**''',
        'practical_examples': '''### Estudo de Caso: Ilusão Monetária
No país X, a taxa de juros básica da renda fixa é de 15% ao ano. A inflação do país no ano bateu 13%.
O investidor que aplicou R$ 100.000 viu sua conta crescer para R$ 115.000 e achou um excelente negócio.
No entanto, os bens que ele pretendia comprar (ex: imóveis, carros) que custavam 100 mil, agora custam 113 mil devido à inflação.
Seu enriquecimento REAL foi de apenas cerca de 1,77% em poder de compra verdadeiro: (1,15 / 1,13) - 1.
Investir na Poupança (que às vezes rende abaixo da inflação) causa destruição sistêmica e matemática da sua riqueza.''',
        'key_points': 'Inflação corrói o poder de compra do dinheiro parado e de rentabilidades nominais fracas; Juro Real é o que sobra após extrair a inflação; Títulos "Tesouro IPCA+" garantem juros reais positivos como proteção.',
    },
    'risco-e-retorno': {
        'title': 'O Paradigma de Risco e Retorno',
        'content': '''# A Lei de Ouro das Finanças

O pilar central da alocação de ativos pode ser resumido em uma premissa fundamental: **Não existe rendimento acima da taxa básica da economia sem a assunção proporcional de risco**.

## A Taxa Livre de Risco (Risk-Free Rate)
A Taxa Selic (título Tesouro Selic) é considerada a aplicação "Livre de Risco" no Brasil, pois é o Governo quem emite a moeda. Qualquer outro investimento precisa oferecer um "Prêmio de Risco" (pagar a mais) para que o investidor aceite desviar seu dinheiro dessa segurança absoluta.

## Volatilidade como Métrica de Risco
No jargão financeiro institucional, risco é medido pela volatilidade (Desvio Padrão dos preços históricos). 
- Ativos de Baixa Volatilidade: CDBs, Tesouro Direto. O preço flutua pouco, mas o retorno projetado é menor.
- Ativos de Alta Volatilidade: Ações, Criptomoedas, Ações de Startups. O preço oscila violentamente (para cima e para baixo), permitindo retornos estratosféricos ou perdas capitais completas.

## O Trade-off
O trade-off (relação de compromisso) diz que para ter a possibilidade estatística de obter grandes multiplicações patrimoniais, o investidor é OBRIGADO a expor o capital à incerteza da renda variável.
A fuga sistemática de "promessas milagrosas" (Rendimento alto com Risco zero) é o que blinda o profissional de cair em pirâmides financeiras e fraudes (Ponzi Schemes).''',
        'practical_examples': '''### A Pirâmide de Risco x Retorno
1. **Base (Alto Volume, Baixo Risco)**: Títulos do Tesouro, CDBs de bancões. Protege da inflação, oferece liquidez diária, mas jamais te deixará rico da noite para o dia.
2. **Meio (Risco Moderado)**: Fundos Imobiliários e Debêntures. O risco de crédito de empresas introduz a possibilidade de perdas temporárias em troca de yields (proventos) atrativos e acima da Selic.
3. **Topo (Alto Risco)**: Ações e Venture Capital. Podem multiplicar o capital por 10x em uma década, mas exigem estômago para ver o portfólio cair 40% em crises sistêmicas (Drawdowns severos) sem entrar em pânico.''',
        'key_points': 'Retornos elevados exigem a assunção de altos riscos de volatilidade; A taxa livre de risco dita a linha base de todos os outros investimentos; Promessas de retorno estratosférico sem risco são indícios clássicos de fraudes e pirâmides.',
    },
    'investimentos': {
        'title': 'Anatomia dos Veículos de Investimento',
        'content': '''# Conhecendo os Ativos do Mercado

Investir significa direcionar fluxos de capital atual para empresas ou para o estado, financiando operações em troca de juros, participação nos lucros e valorização das cotas (ações).

## 1. Renda Fixa (Mercado de Dívida)
Você se torna **Credor**. Você empresta o dinheiro, e o emissor assina um compromisso de te devolver o principal + juros em uma data acordada.
- **Títulos Públicos**: Você empresta ao Governo Federal (Tesouro Direto). É o pilar da segurança no país.
- **CDBs e Letras Bancárias**: Você empresta a Bancos (para eles emprestarem aos clientes). Cobertos pelo FGC (Fundo Garantidor de Créditos) até R$ 250.000.
- **Debêntures e CRIs/CRAs**: Emissão por empresas privadas. Maior risco de calote (Credit Risk), mas maiores retornos oferecidos.

## 2. Renda Variável (Mercado de Capitais/Equity)
Você se torna **Sócio**. Não há garantia de recebimento de juros ou de devolução do principal. Seu retorno dependerá do sucesso comercial do negócio ao longo do tempo.
- **Ações**: Frações do capital social de uma empresa S.A. Gera retornos por distribuição de lucros (Dividendos) e pela valorização da cotação no longo prazo com o crescimento do EBITDA da companhia.
- **Fundos Imobiliários (FIIs)**: Participação em grandes shoppings, lajes corporativas e galpões logísticos, que repassam o aluguel mensalmente de forma isenta de IR na fonte para a pessoa física.

## Perfil de Investidor (Suitability)
Antes de investir, instituições medem a tolerância ao risco do indivíduo:
- *Conservador*: Prioriza a preservação acima de tudo.
- *Moderado*: Aceita leve volatilidade na busca de retornos um pouco acima da média.
- *Agressivo/Arrojado*: Disposto a enfrentar grandes quedas de capital de curto prazo visando o máximo enriquecimento estrutural na década.''',
        'practical_examples': '''### Estudo: Sócio x Credor
Um investidor tem R$ 10.000.
Ele pode comprar um CDB do Banco Itaú (Renda Fixa). Ele saberá exatamente quanto vai receber em 3 anos, ganhando juros na data fixada. O risco dele se limita a quebra do bancão, coberta pelo FGC.
Ou ele pode comprar Ações da Vale (Renda Variável). Se a tonelada de ferro explodir na China, a empresa distribuirá lucros espetaculares. Mas se ocorrer um acidente ambiental terrível ou os preços das commodities colapsarem globalmente, a ação da Vale despenca 30% em uma semana, e seus R$ 10.000 viram R$ 7.000.''',
        'key_points': 'Renda fixa significa que você empresta dinheiro (Credor); Renda variável significa que você se associa ao risco do negócio (Sócio); Diferentes classes de ativos atendem a diferentes perfis de risco e prazos de resgate.',
    },
    'diversificacao-de-carteira': {
        'title': 'Diversificação Estrutural de Portfólio',
        'content': '''# A Matemática da Proteção Patrimonial

Segundo Harry Markowitz (ganhador do Prêmio Nobel), a diversificação é o "único almoço grátis do mercado financeiro". É a aplicação matemática e estatística na mitigação do Risco Não-Sistemático (Risco Específico).

## Risco Específico vs Risco Sistêmico
- **Risco Específico**: O risco exclusivo de uma empresa ou setor (ex: o governo altera uma lei de agrotóxicos e derruba o setor agrícola, o CEO de uma varejista é preso por fraude). Esse risco é DILUÍDO e eliminado ao se investir em diversas empresas de múltiplos setores.
- **Risco Sistêmico**: O risco do "sistema como um todo" (ex: Pandemia global, crise subprime de 2008, hiperinflação crônica). Esse risco joga todos os ativos para baixo e não pode ser eliminado apenas comprando mais ações brasileiras.

## Correlação e Descorrelação
O segredo real da diversificação profissional não é comprar várias ações diferentes. É comprar classes de ativos **descorrelacionadas** ou negativamente correlacionadas.
- Ativos correlacionados andam juntos (Ex: As ações do Banco do Brasil e Itaú tendem a subir ou cair nas mesmas conjunturas macroeconômicas).
- Ativos negativamente correlacionados fazem "Hedge" (proteção) um do outro. O exemplo mais puro na economia emergente é **Bolsa Local vs Dólar**. Em crises agudas de pânico, investidores estrangeiros fogem da bolsa brasileira e compram Dólar. A bolsa afunda 30%, mas o Dólar sobe 30%. Um portfólio misto sobrevive com a carteira equilibrada.

## Alocação Estratégica
Asset Allocation é a decisão de dividir o dinheiro estruturalmente em "caixas" independentes (Ex: 30% Tesouro, 30% Ações Brasil, 30% Ações EUA, 10% FIIs). Essa política blinda o investidor contra o pânico generalizado e atitudes precipitadas.''',
        'practical_examples': '''### Rebalanceamento Forçado (Buy low, Sell high)
A carteira alvo é 50% Renda Fixa e 50% Ações, com R$ 100 mil no total (R$ 50k cada).
Após um ano efervescente de alta generalizada, as ações disparam muito. A carteira vai para R$ 140 mil, sendo R$ 90k (64%) em Ações e R$ 50k (36%) na Renda Fixa.
O "Rebalanceamento" força o investidor profissional a vender R$ 20 mil das Ações (vender na alta com lucro) e realocar na Renda Fixa para voltar ao alvo original 50/50. Semestres depois, se a bolsa afundar bruscamente, o peso das ações cai. O investidor tira dinheiro da RF e compra Ações (comprar na baixa/pânico). Essa técnica mecânica extrai rentabilidade da volatilidade a longo prazo.''',
        'key_points': 'Diversificar dilui o Risco Específico (fraudes e quebras locais); Diversificação eficaz exige ativos descorrelacionados (ex: Internacionalização cambial em Dólar); O rebalanceamento estratégico garante que você venderá na alta e comprará na baixa mecanicamente.',
    },
}

for slug, data in lessons_data.items():
    Lesson.objects.update_or_create(
        concept=concepts[slug], order=1,
        defaults={
            'title': data['title'],
            'content': data['content'],
            'practical_examples': data.get('practical_examples', ''),
            'key_points': data.get('key_points', ''),
            'estimated_minutes': 20,
        }
    )
    print(f"  ✅ Aula Profunda: {data['title']}")

# ============================================================
# 4. QUESTÕES (Quizzes Profissionais)
# ============================================================
print("\n❓ Criando questões de certificação...")

def create_mc_question(concept_slug, statement, options_data, explanation, difficulty=2, hint=''):
    q, _ = Question.objects.get_or_create(concept=concepts[concept_slug], statement=statement, defaults={
        'question_type': 'multiple_choice', 'explanation': explanation, 'difficulty': difficulty, 'hint': hint
    })
    QuestionOption.objects.filter(question=q).delete()
    for i, (text, is_correct) in enumerate(options_data):
        QuestionOption.objects.create(question=q, text=text, is_correct=is_correct, order=i)

# Modulo 1
create_mc_question('receita-e-despesa', 'No âmbito da análise fundamentalista de finanças pessoais, qual componente determina a real capacidade estrutural do indivíduo iniciar e manter um programa de acúmulo de patrimônio consistente?',
    [('O montante bruto de receitas correntes (Salário Nominal)', False), ('O controle ferrenho das despesas fixas (inelásticas), pois estas asfixiam a Receita Líquida em cenários de queda de ganhos.', True), ('A maximização dos impostos e FGTS', False), ('O foco primário em cortes de lazeres e cafés no curto prazo', False)],
    'A verdadeira capacidade de poupar reside no controle de compromissos que você não pode cortar se o seu salário cair (ex: prestações de carros, aluguel). Eles asfixiam sua margem. Despesas elásticas são mais fáceis de adequar num mês ruim.', 3)

create_mc_question('orcamento-pessoal', 'O princípio "Pay yourself first" (Pague a si mesmo primeiro), basilar na filosofia de Orçamento Base-Zero (ZBB), determina a mecânica que o investidor deve:',
    [('Automatizar o investimento da sua cota alvo (ex: 20%) já no primeiro dia de receita, forçando os demais gastos a se adaptarem aos 80% restantes do orçamento.', True), ('Anotar todos os gastos meticulosamente no fim do mês', False), ('Gastar seus ganhos primeiro e aplicar invariavelmente os resíduos remanescentes, maximizando a eficiência de utilidade', False), ('Comprar bens que gerem felicidade instantânea (consumo)', False)],
    'Priorizar o investimento antes do consumo transforma o "Aporte" numa dívida compulsória positiva, bloqueando o impulso de gastar sobras em futilidades.', 2)

create_mc_question('planejamento-financeiro', 'A metodologia SMART exige que a definição de metas financeiras (Goal-Based Investing) contenha, primariamente, características de temporalidade e métricas tangíveis. Assinale o exemplo perfeito de meta SMART:',
    [('Gostaria de ter estabilidade em fundos imobiliários um dia', False), ('Poupar um montante razoável mês a mês para conseguir viajar no verão', False), ('Acumular o capital principal de R$ 100.000,00 no Tesouro Direto nos próximos 60 meses para o pagamento integral da entrada do apartamento Y.', True), ('Aumentar o patrimônio o mais velozmente possível', False)],
    'Possui especificidade (Entrada de apartamento), valor absoluto (R$ 100k) e barreira temporal (60 meses), possibilitando o cálculo retroativo das prestações necessárias do investimento.', 2)

create_mc_question('reserva-de-emergencia', 'A alocação profissional da Reserva de Emergência prioriza "Tiers" de segurança máxima em detrimento do prêmio de risco (rentabilidade). Qual veículo financeiro incorre em violação severa desse princípio para montar o fundo de emergência?',
    [('Fundo de Renda Fixa DI taxa zero', False), ('Títulos do Tesouro Selic e Contas Remuneradas Diárias (Ex: Nubank, Itaú)', False), ('Debêntures corporativas incentivadas com prêmio de IPCA + 9% a.a. sem liquidez diária', True), ('CDBs emitidos pelos 4 maiores bancos de varejo', False)],
    'As Debêntures, mesmo pagando taxas estratosféricas (Yield), não possuem liquidez diária e carregam risco de calote (Credit Risk) da empresa emissora. Reserva exige liquidez imediata (D+0/D+1) e zero risco sistêmico.', 3)

# Modulo 2
create_mc_question('porcentagem', 'A falta de compreensão de Fatores de Variação pode levar um investidor amador à falência em mercados arriscados. Se uma ação despenca 50% devido a um "Crash", qual a valorização percentual que o capital remanescente deverá entregar obrigatoriamente para reverter a perda original (Break-even)?',
    [('25%', False), ('50%', False), ('75%', False), ('100%', True)],
    'Se de R$ 1.000 cai 50%, resta R$ 500. Para voltar para os exatos R$ 1.000 com o saldo novo (500), você precisa multiplicar 500 por 2 (aumento de 100%). Perdas percentuais profundas geram abismos matemáticos de recuperação.', 3)

create_mc_question('juros-simples', 'Qual a característica essencial de regime de capitalização operado sob "Juros Simples" na antecipação e desconto de duplicatas bancárias em relação ao regime exponencial?',
    [('A incidência do fator taxa é processada apenas e invariavelmente sobre o Valor Presente Nominal original em todos os instantes "T".', True), ('A taxa sofre ajuste sistemático pela inflação', False), ('Os rendimentos passados sofrem re-remuneração contínua somados ao capital formador.', False), ('O crescimento do montante se dá por um eixo parabólico de convexidade ascendente', False)],
    'No regime simples, independentemente da duração da dívida, a taxa multiplica sempre o saldo base original de formação, o que causa o crescimento vetorial (reta linear constante).', 2)

create_mc_question('juros-compostos', 'Na equação canônica de cálculo do Valor Futuro sob regime de juros compostos [FV = PV * (1+i)^T], a variável T atua de forma decisiva e proeminente no efeito "Bola de Neve" porque:',
    [('Opera como um vetor multiplicador direto e fracionado', False), ('Ela é um fator Exponencial (uma Potência) submetendo os lucros pretéritos ao ganho recorrente sistêmico.', True), ('O tempo não sofre a incidência contínua dos impostos federais estipulados', False), ('Minimiza a variância dos portfólios das ações ao longo do mandato longo', False)],
    'A grande força tracionadora dos juros compostos (e a essência da matemática de juros sobre juros) é a capitalização exponencial, representada pela potência temporal (T). O que enriquece com força o investidor é a paciência de manter o dinheiro trabalhando ao longo das décadas.', 2)

create_mc_question('inflacao', 'Sob o escopo da Economia Macroeconômica Aplicada, calcular o "Retorno Real" dos investimentos no Brasil se difere do "Retorno Nominal" pelo seguinte fato estrutural:',
    [('O retorno real considera o desconto do imposto de renda, enquanto o nominal é o valor líquido.', False), ('O retorno real deduz as taxas de corretagem da bolsa de valores.', False), ('O retorno real deflaciona e anula a erosão do poder de compra na linha do tempo medida por indexadores como IPCA (Fórmula de Fisher).', True), ('Retorno real exige a medição do impacto pela curva futura de derivativos de CDI da B3.', False)],
    'Rentabilidade nominal = o número absoluto do ganho na conta do home broker. Rentabilidade real = o que sobra de crescimento de patrimônio de fato após descontar o encarecimento estrutural do custo de vida gerado pela Inflação.', 3)

# Modulo 3
create_mc_question('risco-e-retorno', 'Na teoria financeira, a "Taxa Livre de Risco" (Risk-Free Rate), como o Tesouro Selic no Brasil, impõe uma restrição conceitual intransponível. Esta restrição de ferro prega que:',
    [('Somente a bolsa de valores pode render menos que esta métrica padrão.', False), ('Investimentos imobiliários superam fatalmente a inflação', False), ('Qualquer rendimento superior demandado por fundos, pirâmides e ações impõe inequivocamente e matematicamente o incremento subjacente de risco (seja sistêmico, crédito ou liquidez).', True), ('A taxa livre de risco isenta impostos totais, otimizando o Net Return.', False)],
    'Se a renda fixa ultra-segura garantida pelo estado paga 10%, é matematicamente impossível qualquer ser humano entregar 15% de retorno mensal de "forma segura e garantida" - o mercado pagaria a taxa de risco sem questionar. Onde há excesso de rentabilidade, há um componente forte de risco escondido.', 2)

create_mc_question('investimentos', 'A grande delimitação institucional e filosófica existente entre os polos "Renda Fixa" (Mercado de Dívida) e "Renda Variável" (Equity/Mercado de Capitais) é explicitada pela natureza contratual que diz:',
    [('A Renda Fixa obriga prazos contínuos e o investidor é Sócio das empresas endividadas, retendo passivos.', False), ('A Renda Fixa torna você credor do tomador, atrelado a juros pactuados, enquanto a Renda Variável o converte em co-sócio dos fluxos residuais incertos.', True), ('Fundos multimercados atuam exclusivamente fora de Renda Variável', False), ('A renda fixa jamais incorre em variação e queda em momento nenhum (Ausência de marcação a mercado)', False)],
    'Credor emite dívidas, sabendo seus diretos aos fluxos de cupons. Sócio compra uma fração do valor da empresa apostando na capacidade perpétua da diretoria no repasse dos lucros futuros exponenciais.', 2)

create_mc_question('diversificacao-de-carteira', 'O processo de rebalanceamento sistêmico de um Asset Allocation robusto (composto por frações atreladas à inflação, Selic, Ibovespa e Dólar) protege o investidor dos seus próprios vieses psicológicos ao forçar:',
    [('A execução de estratégias de Market Timing puras que miram a antecipação da flutuação da Taxa Selic antes do COPOM.', False), ('A mecânica estruturada e automática de lucrar vendendo parcialidades da classe de ativos efervescente (na alta) para a recompra metódica da classe sub-precificada do momento e negligenciada pelo mercado.', True), ('A compra massiva de Opções de Compra e Opções de Venda ITM para proteção total do CDI e variação em câmbio local de paridade', False), ('O estanque da valorização total impedindo que fique rico pela trava limitadora das posições.', False)],
    'Como as classes andam em ciclos inversos (Correlação Descorrelacionada), quando ações batem topos perigosos, ficam mais do que sua % alvo. Ao voltar pro alvo, o sistema o forçará matematicamente a extrair seu ganho a "seco" antes de um crash futuro, migrando capital ao que tá em crise no dia.', 3)

print("✅ Seed concluído! Aulas, currículo e matriz de Quizzes de nível aprofundado regravadas e inseridas no SQL.")
