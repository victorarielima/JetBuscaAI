import { SearchFormData } from '../types';
import { SYSTEM_INSTRUCTION } from '../constants';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

export const generateCompanyReport = async (formData: SearchFormData): Promise<string> => {
  if (!apiKey) {
    throw new Error("Chave de API não configurada.");
  }

  // Build a strict prompt to keep the model focused
  let userPrompt = `Aja como um analista de vendas B2B. Pesquise e crie um relatório completo em PORTUGUÊS sobre a empresa abaixo.\n\n`;
  
  userPrompt += `📌 **DADOS DA EMPRESA ALVO:**\n`;
  userPrompt += `- **Nome:** ${formData.companyName}\n`;
  
  if (formData.cnpj) userPrompt += `- **CNPJ:** ${formData.cnpj}\n`;
  if (formData.location) userPrompt += `- **Localização (Cidade/Estado):** ${formData.location}\n`;
  else userPrompt += `- **Localização:** Não informada (Se houver múltiplas empresas com este nome, priorize a mais relevante nacionalmente ou liste as opções).\n`;
  
  if (formData.industry) userPrompt += `- **Setor:** ${formData.industry}\n`;
  if (formData.additionalInfo) userPrompt += `- **Contexto Adicional:** ${formData.additionalInfo}\n`;

  // Gerar slug para Reclame Aqui
  const reclameAquiSlug = formData.companyName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  userPrompt += `\n⚠️ **INSTRUÇÕES DE PESQUISA CRÍTICAS:**\n`;
  userPrompt += `1. **Pesquisa Geral:** Encontre o site oficial e o que a empresa faz.\n`;
  userPrompt += `2. **RECLAME AQUI (EXTREMAMENTE IMPORTANTE):**\n`;
  userPrompt += `   - **URL DIRETA para verificar:** https://www.reclameaqui.com.br/empresa/${reclameAquiSlug}/lista-reclamacoes/\n`;
  userPrompt += `   - **SEMPRE TENTE** acessar essa URL e variações antes de dizer que não existe perfil.\n`;
  userPrompt += `   - **VARIAÇÕES A TENTAR:** "${reclameAquiSlug}", "${formData.companyName.toLowerCase().replace(/\s+/g, '-')}", nome sem sufixos (ltda, sa, me).\n`;
  userPrompt += `   - **A MAIORIA das empresas brasileiras TEM perfil no Reclame Aqui** - não assuma que não existe.\n`;
  userPrompt += `   - **EXTRAIA TODOS OS DADOS:** Nota, Reputação, Índice de Solução, Taxa de Resposta, Total de Reclamações.\n`;
  userPrompt += `   - **INCLUA O LINK** do perfil no Reclame Aqui na seção de Referências.\n`;
  userPrompt += `3. **Produtos:** Liste detalhadamente o que eles vendem.\n`;
  userPrompt += `4. **Referências:** Liste TODAS as URLs consultadas (site, reclame aqui, redes sociais, etc).\n`;
  userPrompt += `5. **Idioma:** O relatório DEVE ser em Português do Brasil.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: SYSTEM_INSTRUCTION
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro na API OpenAI: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content;
    } else {
      throw new Error("O modelo não retornou texto. Tente novamente com mais detalhes.");
    }

  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
};
