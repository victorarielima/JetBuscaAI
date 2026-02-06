import { SearchFormData, ReportSection } from '../types';
import { SYSTEM_INSTRUCTION } from '../constants';
import { searchSimilarClients, formatSimilarClientsForPrompt } from './supabaseService';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

// Função auxiliar para identificar o setor da empresa
async function identifyCompanySector(companyName: string, additionalInfo?: string): Promise<string> {
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
            content: `Você é um especialista em classificação de empresas brasileiras por nicho de mercado.

Sua tarefa é identificar o TIPO DE SERVIÇO ou PRODUTO PRINCIPAL que a empresa oferece.

REGRAS CRÍTICAS:
1. PESQUISE mentalmente o que essa empresa brasileira faz com base no nome
2. Se houver informações adicionais fornecidas, USE-AS como fonte primária
3. NÃO assuma baseado apenas em palavras do nome (ex: "Eng" não significa necessariamente construção civil)
4. Foque no SERVIÇO PRESTADO, não no setor industrial genérico
5. Considere que muitas empresas com "Eng" no nome são de consultoria, treinamentos ou gestão

CATEGORIAS PRIORITÁRIAS para buscar clientes similares:
- Treinamentos e Capacitação Corporativa
- Consultoria em Gestão e Qualidade
- Consultoria em Processos e Produção
- Software e Tecnologia B2B
- E-commerce e Varejo Online
- Saúde e Bem-estar
- Educação e Cursos
- Alimentação e Food Service
- Serviços Financeiros
- Logística e Transporte
- Marketing e Publicidade
- Indústria e Manufatura

Responda com 2-5 palavras descrevendo o tipo de serviço/produto principal.`
          },
          {
            role: 'user',
            content: `Empresa: "${companyName}"${additionalInfo ? `\n\nINFORMAÇÕES FORNECIDAS (use como referência principal): ${additionalInfo}` : ''}\n\nQual o tipo de serviço ou produto principal desta empresa? Responda apenas com a classificação.`
          }
        ],
        temperature: 0.2,
        max_tokens: 50
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao identificar setor');
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || 'Setor não identificado';
  } catch (error) {
    console.error('Erro ao identificar setor:', error);
    return 'Setor não identificado';
  }
}

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
[Analise como a empresa atende hoje e onde pode melhorar com automação]

### Insights Sazonais e de Mercado
[IMPORTANTE: Identifique períodos de PICO de demanda específicos para o setor/produto da empresa]
- **Datas Comemorativas:** [Ex: Dia das Mães, Natal, Black Friday, Dia dos Namorados]
- **Sazonalidade do Setor:** [Ex: Mês das Noivas (Maio) para moda/calçados, Volta às Aulas para papelarias, Verão para turismo]
- **Eventos Especiais:** [Ex: Copa do Mundo, shows, feriados prolongados]
- **Impacto Estimado:** [Como esses períodos aumentam o volume de atendimento da empresa]
- **Como a JetSales ajuda:** [Ex: "No mês das noivas, sua equipe conseguiria atender 3x mais clientes com chatbots automatizados"]

### Oportunidades Identificadas
[Liste 2-3 dores específicas que podem ser resolvidas com automação]
1. [Dor + como a JetSales resolve]
2. [Dor + como a JetSales resolve]

### Pitch Personalizado
- **Argumento Chave:** [Frase de impacto focada no setor. Ex: "Imagina atender todas as noivas de maio sem perder nenhuma venda por demora no WhatsApp?"]
- **Solução Sugerida:** [Chatbot, Multi-atendentes, Agentes de IA, CRM, etc]
- **ROI Esperado:** [Estimativa de ganho: mais vendas, menos tempo perdido, etc]

### Perguntas de Sondagem (SPIN)
- [Pergunta sobre volume de atendimento em datas sazonais]
- [Pergunta sobre perda de vendas por demora no atendimento]
- [Pergunta sobre organização dos leads e follow-up]`
  },
  clientesjetsales: {
    title: 'Clientes JetSales no Segmento',
    instruction: `## Clientes JetSales no Mesmo Segmento
[Esta seção será preenchida automaticamente com base nos clientes existentes da JetSales que atuam no mesmo segmento ou similar]

### Cases de Sucesso Relevantes
[Se houver clientes JetSales no mesmo segmento, mencione como eles se beneficiaram da solução]

### Argumento de Prova Social
[Use os clientes existentes como prova de que a JetSales entende o segmento]`
  }
};

export const generateCompanyReport = async (formData: SearchFormData): Promise<string> => {
  if (!apiKey) {
    throw new Error("Chave de API não configurada.");
  }

  const { selectedSections } = formData;

  // Variável para armazenar o setor identificado
  let identifiedSector = '';
  let similarClientsInfo = '';

  // Se a seção de clientes JetSales estiver selecionada, primeiro identificar o setor
  if (selectedSections.includes('clientesjetsales')) {
    try {
      // Montar contexto adicional com todas as informações disponíveis
      const contextParts: string[] = [];
      if (formData.industry) contextParts.push(`Setor informado: ${formData.industry}`);
      if (formData.additionalInfo) contextParts.push(`Observações: ${formData.additionalInfo}`);
      if (formData.website) contextParts.push(`Website: ${formData.website}`);
      const additionalContext = contextParts.length > 0 ? contextParts.join('. ') : undefined;

      // Passo 1: Identificar o setor da empresa
      console.log('Identificando setor da empresa...');
      identifiedSector = await identifyCompanySector(
        formData.companyName, 
        additionalContext
      );
      console.log('Setor identificado:', identifiedSector);

      // Passo 2: Buscar clientes similares usando o SETOR identificado (não os dados do formulário)
      console.log('Buscando clientes JetSales no setor:', identifiedSector);
      const similarClients = await searchSimilarClients(identifiedSector, 5, 0.4);
      similarClientsInfo = formatSimilarClientsForPrompt(similarClients);
      
      // Adicionar o setor identificado na info
      if (similarClients.length > 0) {
        similarClientsInfo = `SETOR IDENTIFICADO: ${identifiedSector}\n\n${similarClientsInfo}`;
      } else {
        similarClientsInfo = `SETOR IDENTIFICADO: ${identifiedSector}\n\nNenhum cliente JetSales encontrado neste segmento específico.`;
      }
    } catch (error) {
      console.warn('Erro ao buscar clientes similares:', error);
      similarClientsInfo = 'Não foi possível consultar a base de clientes.';
    }
  }

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
  
  // Usar o setor identificado se disponível, senão usar o do formulário
  if (identifiedSector && identifiedSector !== 'Setor não identificado') {
    userPrompt += `- **Setor (identificado pela IA):** ${identifiedSector}\n`;
  } else if (formData.industry) {
    userPrompt += `- **Setor:** ${formData.industry}\n`;
  }
  
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

  // Adicionar informação de clientes similares se disponível
  if (similarClientsInfo && selectedSections.includes('clientesjetsales')) {
    userPrompt += `\n📊 **BASE DE CLIENTES JETSALES (USE ESTAS INFORMAÇÕES):**\n`;
    userPrompt += similarClientsInfo;
    userPrompt += `\nUse esses clientes como PROVA SOCIAL no pitch. Mencione que a JetSales já atende empresas similares.\n`;
  }

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
