import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if API_KEY:
    genai.configure(api_key=API_KEY)

def get_tutor_response(lesson_title, lesson_content, user_message, chat_history=None):
    """
    Communicates with Gemini AI to act as a financial tutor.
    """
    if not API_KEY:
        return "⚠️ Chave da API do Gemini não encontrada. Por favor, adicione GEMINI_API_KEY no arquivo .env do backend para ativar a IA."
        
    try:
        system_instruction = f"""Você é o FinTutor, um tutor de educação financeira de alto nível acadêmico e institucional.
O aluno está lendo neste momento uma aula intitulada '{lesson_title}'.
Aqui está o texto completo que o aluno tem na tela:
<texto_aula>
{lesson_content}
</texto_aula>

Suas diretrizes:
1. Responda APENAS perguntas relacionadas ao contexto de finanças e investimentos.
2. Use um tom encorajador, porém altamente profissional (Nível CPA-20/CEA).
3. Seja conciso. Evite respostas extremamente longas.
4. Se o usuário pedir para você fazer uma pergunta ("Faça uma pergunta", "Me teste", etc.), leia o texto da aula e crie uma pergunta instigante baseada em um conceito específico do texto.
5. Se o aluno responder a uma pergunta sua, avalie se está certo ou errado baseando-se no material.
"""
        
        model = genai.GenerativeModel('gemini-2.5-flash', system_instruction=system_instruction)
        
        messages = []
        
        # In Gemini API, history is passed alternately: user, model, user, model
        if chat_history:
            for msg in chat_history:
                role = 'user' if msg.get('role') == 'user' else 'model'
                messages.append({"role": role, "parts": [msg.get('text', '')]})
                
        messages.append({"role": "user", "parts": [user_message]})
        
        response = model.generate_content(messages)
        return response.text
        
    except Exception as e:
        print(f"Erro no Gemini: {e}")
        return "Desculpe, ocorreu um erro ao me conectar ao cérebro do Tutor. Verifique se sua chave de API está correta e tente novamente."
