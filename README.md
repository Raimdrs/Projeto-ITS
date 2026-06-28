# 🎓 FinTutor — Sistema Tutor Inteligente de Educação Financeira

O **FinTutor** é um Sistema Tutor Inteligente (ITS) de alto nível projetado para ensinar conceitos de finanças avançadas (Nível MBA / Certificações CPA-20 e CEA) através de aprendizagem adaptativa e inteligência artificial.

Diferente de um curso tradicional, a plataforma monitora o domínio de cada conceito matemático e teórico do aluno, exigindo proficiência para desbloquear novos módulos. O sistema também conta com simulações financeiras em tempo real (Juros Compostos, ZBB, etc.) e um Tutor Virtual integrado via API do Google Gemini.

---
### 👥 Desenvolvedores / Equipe:
* Luiz Eduardo Batista De Lima
* Maria Leticia De Moura Silva
* Rai De Medeiros Cunha
* Thyago Pereira Da Silva

## 🛠 Tecnologias Utilizadas

O projeto foi construído utilizando uma arquitetura moderna dividida entre Backend (API) e Frontend (SPA).

### Backend
*   **[Python 3.10+](https://www.python.org/)**: Linguagem principal.
*   **[Django 5.1](https://www.djangoproject.com/) & [Django REST Framework](https://www.django-rest-framework.org/)**: Frameworks base para construção da API robusta e escalável.
*   **[PostgreSQL](https://www.postgresql.org/) / SQLite**: Banco de dados relacional.
*   **Autenticação JWT (`djangorestframework-simplejwt`)**: Sistema seguro de login por tokens.
*   **Google Gemini AI (`google-generativeai`)**: Integração com LLM para gerar interações proativas com os alunos em tempo real durante o estudo.

### Frontend
*   **[React 18](https://react.dev/) + [Vite](https://vitejs.dev/)**: Biblioteca de renderização ultra-rápida.
*   **[React Router Dom](https://reactrouter.com/)**: Gerenciamento de rotas e navegação protegida.
*   **[Axios](https://axios-http.com/)**: Requisições HTTP ao backend.
*   **[Chart.js](https://www.chartjs.org/) (`react-chartjs-2`)**: Renderização de gráficos financeiros nas simulações.
*   **[Lucide React](https://lucide.dev/)**: Biblioteca de ícones vetoriais em SVG.
*   **Vanilla CSS**: Um Design System próprio de alta fidelidade visual construído sem dependência de frameworks.

---

## 🚀 Como Preparar o Ambiente e Rodar a Aplicação

Siga os passos abaixo para configurar o ambiente de desenvolvimento na sua máquina local.

### 1. Pré-requisitos
Certifique-se de ter os seguintes programas instalados:
*   [Node.js](https://nodejs.org/en/) (Versão 18 ou superior)
*   [Python](https://www.python.org/downloads/) (Versão 3.10 ou superior)
*   [Git](https://git-scm.com/)

### 2. Clonando o Repositório
```bash
git clone https://github.com/Raimdrs/Projeto-ITS.git
cd Projeto-ITS
```

### 3. Configurando o Backend (Django)

Abra um terminal na pasta raiz do projeto e acesse o diretório do backend:
```bash
cd backend
```

Crie e ative um ambiente virtual (recomendado):
```bash
# No Windows:
python -m venv venv
venv\Scripts\activate

# No Linux/Mac:
python3 -m venv venv
source venv/bin/activate
```

Instale as dependências:
```bash
pip install -r requirements.txt
```

Configure as variáveis de ambiente:
Crie um arquivo chamado `.env` dentro da pasta `backend` e adicione sua chave da API do Google Gemini (para o Chatbot funcionar):
```env
GEMINI_API_KEY=sua_chave_do_google_ai_studio_aqui
```

Crie o banco de dados e aplique as migrações:
```bash
python manage.py makemigrations
python manage.py migrate
```

Popule o banco de dados com as aulas, exercícios e estrutura curricular:
```bash
python -X utf8 -c "exec(open('domain/seed.py', encoding='utf-8').read())"
```

Inicie o servidor Backend:
```bash
python manage.py runserver
```
*(O servidor Django rodará em `http://localhost:8000`)*

### 4. Configurando o Frontend (React)

Abra um **novo** terminal na pasta raiz do projeto e acesse o diretório do frontend:
```bash
cd frontend
```

Instale as dependências do Node:
```bash
npm install
```

Inicie o servidor de desenvolvimento do Vite:
```bash
npm run dev
```
*(O servidor React rodará em `http://localhost:5173`)*

---

## 🎮 Acessando a Plataforma

1. Com os dois terminais rodando (Django e Vite), abra seu navegador.
2. Acesse `http://localhost:5173`.
3. Na tela de login, clique em **Cadastre-se** para criar seu perfil de estudante.
4. Você será levado ao **Dashboard**. Navegue pelos Módulos, faça Simulações Financeiras e teste conversar com a **IA Tutor** no canto da tela de qualquer Aula!

---

