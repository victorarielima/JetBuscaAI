// Serviço para busca híbrida RAG no Supabase Edge Function
// Busca clientes similares da JetSales por segmento

const SUPABASE_FUNCTION_URL = 'https://uryawzetpnbdmamoktma.supabase.co/functions/v1/busca-hibrida';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyeWF3emV0cG5iZG1hbW9rdG1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTY5MzIyOSwiZXhwIjoyMDg1MjY5MjI5fQ.c2VAOWVOetr4pxmcD5PSMNuB8B09URWG4DqpPCrBMmk';

export interface SimilarClient {
  content: string;
  metadata?: Record<string, unknown>;
  similarity?: number;
}

// Busca documentos usando a função Edge de busca híbrida
export async function searchSimilarClients(
  query: string, 
  _matchCount: number = 5,
  _matchThreshold: number = 0.5
): Promise<SimilarClient[]> {
  try {
    const response = await fetch(SUPABASE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY
      },
      body: JSON.stringify({
        query: query
      })
    });

    if (!response.ok) {
      console.error('Erro na busca híbrida:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    
    // Adaptar resposta ao formato esperado
    if (Array.isArray(data)) {
      return data.map((doc: { content?: string; text?: string; metadata?: Record<string, unknown>; similarity?: number; score?: number }) => ({
        content: doc.content || doc.text || JSON.stringify(doc),
        metadata: doc.metadata || {},
        similarity: doc.similarity || doc.score || 0.8
      }));
    }
    
    // Se a resposta for um objeto com results
    if (data.results && Array.isArray(data.results)) {
      return data.results.map((doc: { content?: string; text?: string; metadata?: Record<string, unknown>; similarity?: number; score?: number }) => ({
        content: doc.content || doc.text || JSON.stringify(doc),
        metadata: doc.metadata || {},
        similarity: doc.similarity || doc.score || 0.8
      }));
    }

    // Se for uma resposta única
    if (data.content || data.text) {
      return [{
        content: data.content || data.text,
        metadata: data.metadata || {},
        similarity: data.similarity || 0.8
      }];
    }

    return [];

  } catch (error) {
    console.error('Erro na busca híbrida:', error);
    return [];
  }
}

// Formata os clientes encontrados para incluir no prompt
export function formatSimilarClientsForPrompt(clients: SimilarClient[]): string {
  if (clients.length === 0) {
    return 'Nenhum cliente similar encontrado na base da JetSales.';
  }

  let result = 'CLIENTES JETSALES COM PERFIL SIMILAR:\n\n';
  
  clients.forEach((client, index) => {
    result += `${index + 1}. ${client.content}\n`;
    if (client.metadata && Object.keys(client.metadata).length > 0) {
      result += `   Detalhes: ${JSON.stringify(client.metadata)}\n`;
    }
    if (client.similarity) {
      result += `   Relevância: ${(client.similarity * 100).toFixed(0)}%\n`;
    }
    result += '\n';
  });

  return result;
}
