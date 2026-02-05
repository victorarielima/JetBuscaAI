import { SearchFormData, ReportSection } from '../types';
import { SYSTEM_INSTRUCTION } from '../constants';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

// Mapeamento de seções para instruções de prompt
const SECTION_PROMPTS: Record<ReportSection, { title: string; instruction: string }> = {
  dados: {
    title: 'Dados Cadastrais',
    instruction: `## Dados Cadastrais
| Campo | Informação |
|-------|------------|
| **Razão Social** | [razão social] |
| **CNPJ** | [CNPJ se encontrar] |
| **Sede** | [cidade/estado] |
| **Setor** | [setor de atuação] |
| **Site** | [website oficial] |
| **Fundação** | [ano de fundação] |`
  },
  produtos: {
    title: 'Produtos e Serviços',
    instruction: `## Principais Produtos e Serviços
[Liste detalhadamente o que a empresa comercializa, com descrições]
1. **[Produto/Serviço A]**: [Descrição]
2. **[Produto/Serviço B]**: [Descrição]
...`
  },
  clientes: {
    title: 'Perfil do Cliente',
    instruction: `## Perfil do Cliente (Target)
- **Quem compra:** [Perfil das empresas ou consumidores]
- **Segmento:** [B2B, B2C, ou ambos]
- **Porte dos clientes:** [PME, Grandes empresas, Varejo, etc]
- **Volume de Atendimento:** [Estime: Alto volume? Venda complexa?]`
  },
  canais: {
    title: 'Canais de Atendimento',
    instruction: `## Canais de Atendimento Atuais
[Pesquise como eles atendem: WhatsApp, Instagram, Chat, Telefone, Email, etc]
- **WhatsApp:** [Sim/Não - tem botão no site?]
- **Instagram:** [@ e se é ativo]
- **Facebook:** [link]
- **Telefone:** [número]
- **Chat no site:** [Sim/Não]`
  },
  reclameaqui: {
    title: 'Reputação e Reclame Aqui',
    instruction: `## Reputação e Reclame Aqui
[PESQUISE OBRIGATORIAMENTE no Reclame Aqui]
| Indicador | Valor |
|-----------|-------|
| **Nome no Portal** | [nome cadastrado] |
| **Nota Geral** | [X.X/10] |
| **Reputação** | [Ótimo/Bom/Regular/Ruim/Não Recomendada] |
| **Total de Reclamações** | [número] |
| **Taxa de Resposta** | [X%] |
| **Taxa de Solução** | [X%] |
| **Voltariam a fazer negócio** | [X%] |

**Principais Queixas:** [Liste 2-3 problemas mais comuns]
**Link do Perfil:** [URL do Reclame Aqui]`
  },
  estrategia: {
    title: 'Estratégia de Venda',
    instruction: `## Estratégia de Venda JetSales
### Diagnóstico
[Analise como a empresa atende hoje e onde pode melhorar]

### Oportunidades Identificadas
[Liste 2-3 dores que podem ser resolvidas com automação de atendimento]

### Pitch Personalizado
- **Argumento Chave:** [Frase de impacto para o setor]
- **Solução Sugerida:** [Chatbot, Multi-atendentes, CRM, etc]

### Perguntas de Sondagem
- [Pergunta sobre volume de atendimento]
- [Pergunta sobre resposta em horários de pico]`
  }
};

export const generateCompanyReport = async (formData: SearchFormData): Promise<string> => {
  if (!apiKey) {
    throw new Error("Chave de API não configurada.");
  }

  const { selectedSections } = formData;

  // Gerar slug para Reclame Aqui
  const reclameAquiSlug = formData.companyName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  // Construir prompt baseado nas seções selecionadas
  let userPrompt = `Aja como um analista de vendas B2B. Pesquise e crie um relatório em PORTUGUÊS sobre a empresa abaixo.\n\n`;
  
  userPrompt += `📌 **DADOS DA EMPRESA ALVO:**\n`;
  userPrompt += `- **Nome:** ${formData.companyName}\n`;
  
  if (formData.cnpj) userPrompt += `- **CNPJ:** ${formData.cnpj}\n`;
  if (formData.location) userPrompt += `- **Localização:** ${formData.location}\n`;
  if (formData.industry) userPrompt += `- **Setor:** ${formData.industry}\n`;
  if (formData.additionalInfo) userPrompt += `- **Contexto Adicional:** ${formData.additionalInfo}\n`;

  // Adicionar instruções específicas para Reclame Aqui se selecionado
  if (selectedSections.includes('reclameaqui')) {
    userPrompt += `\n🔍 **INSTRUÇÕES PARA RECLAME AQUI:**\n`;
    userPrompt += `- **URL DIRETA:** https://www.reclameaqui.com.br/empresa/${reclameAquiSlug}/\n`;
    userPrompt += `- **VARIAÇÕES:** "${reclameAquiSlug}", "${formData.companyName.toLowerCase().replace(/\s+/g, '-')}"\n`;
    userPrompt += `- A maioria das empresas brasileiras TEM perfil - não assuma que não existe.\n`;
  }

  userPrompt += `\n📋 **ESTRUTURA DO RELATÓRIO (INCLUA APENAS ESTAS SEÇÕES):**\n\n`;
  userPrompt += `# 🏢 ${formData.companyName}\n\n`;

  // Adicionar apenas as seções selecionadas
  selectedSections.forEach(section => {
    if (SECTION_PROMPTS[section]) {
      userPrompt += SECTION_PROMPTS[section].instruction + '\n\n---\n\n';
    }
  });

  userPrompt += `\n⚠️ **REGRAS:**\n`;
  userPrompt += `1. Inclua APENAS as seções listadas acima, não adicione outras.\n`;
  userPrompt += `2. Responda em Português do Brasil.\n`;
  userPrompt += `3. Se não encontrar alguma informação, indique "Não encontrado".\n`;

  // Ajustar max_tokens baseado no número de seções
  const maxTokens = Math.min(1024 + (selectedSections.length * 512), 4096);

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
        max_tokens: maxTokens
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
