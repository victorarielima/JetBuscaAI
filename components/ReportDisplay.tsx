import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  AlertCircle, 
  Building2, 
  Target, 
  ShoppingCart, 
  Users, 
  MessageSquare, 
  Star, 
  Rocket, 
  AlertTriangle,
  Globe,
  Copy,
  Check,
  Download,
  FileText,
  TrendingUp,
  Zap
} from './Icons';

interface ReportDisplayProps {
  report: string | null;
  error: string | null;
}

interface Section {
  id: string;
  title: string;
  content: string;
  icon: React.ReactNode;
  gradient: string;
  bgColor: string;
}

const sectionConfig: Record<string, { icon: React.ReactNode; gradient: string; bgColor: string }> = {
  'dados cadastrais': { 
    icon: <Building2 className="w-5 h-5" />, 
    gradient: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50 border-blue-200'
  },
  'o que a empresa faz': { 
    icon: <Target className="w-5 h-5" />, 
    gradient: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50 border-purple-200'
  },
  'principais produtos': { 
    icon: <ShoppingCart className="w-5 h-5" />, 
    gradient: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50 border-emerald-200'
  },
  'perfil do cliente': { 
    icon: <Users className="w-5 h-5" />, 
    gradient: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50 border-orange-200'
  },
  'canais de atendimento': { 
    icon: <MessageSquare className="w-5 h-5" />, 
    gradient: 'from-cyan-500 to-cyan-600',
    bgColor: 'bg-cyan-50 border-cyan-200'
  },
  'reputação': { 
    icon: <Star className="w-5 h-5" />, 
    gradient: 'from-yellow-500 to-amber-500',
    bgColor: 'bg-yellow-50 border-yellow-200'
  },
  'reclame aqui': { 
    icon: <Star className="w-5 h-5" />, 
    gradient: 'from-yellow-500 to-amber-500',
    bgColor: 'bg-yellow-50 border-yellow-200'
  },
  'estratégia': { 
    icon: <Rocket className="w-5 h-5" />, 
    gradient: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50 border-pink-200'
  },
  'oportunidades': { 
    icon: <TrendingUp className="w-5 h-5" />, 
    gradient: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50 border-green-200'
  },
  'pontos de atenção': { 
    icon: <AlertTriangle className="w-5 h-5" />, 
    gradient: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50 border-red-200'
  },
  'fontes': { 
    icon: <Globe className="w-5 h-5" />, 
    gradient: 'from-slate-500 to-slate-600',
    bgColor: 'bg-slate-50 border-slate-200'
  },
  'referências': { 
    icon: <Globe className="w-5 h-5" />, 
    gradient: 'from-indigo-500 to-purple-600',
    bgColor: 'bg-indigo-50 border-indigo-200'
  },
  'default': { 
    icon: <FileText className="w-5 h-5" />, 
    gradient: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-50 border-indigo-200'
  }
};

const getSectionConfig = (title: string) => {
  const lowerTitle = title.toLowerCase();
  for (const [key, config] of Object.entries(sectionConfig)) {
    if (lowerTitle.includes(key)) {
      return config;
    }
  }
  return sectionConfig['default'];
};

const ReportDisplay: React.FC<ReportDisplayProps> = ({ report, error }) => {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const parseReport = useMemo(() => {
    if (!report) return { companyName: '', sections: [] };

    // Regex para remover todos os emojis unicode
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]/gu;

    const lines = report.split('\n');
    let companyName = '';
    const sections: Section[] = [];
    let currentSection: { title: string; content: string[] } | null = null;

    for (const line of lines) {
      // Match company name (h1)
      const h1Match = line.match(/^#\s+(.+)$/);
      if (h1Match) {
        companyName = h1Match[1].replace(emojiRegex, '').trim();
        continue;
      }

      // Match section headers (h2)
      const h2Match = line.match(/^##\s+(.+)$/);
      if (h2Match) {
        if (currentSection) {
          const cleanTitle = currentSection.title.replace(emojiRegex, '').trim();
          const config = getSectionConfig(cleanTitle);
          sections.push({
            id: cleanTitle.toLowerCase().replace(/\s+/g, '-'),
            title: cleanTitle,
            content: currentSection.content.join('\n').trim(),
            ...config
          });
        }
        currentSection = {
          title: h2Match[1],
          content: []
        };
        continue;
      }

      if (currentSection) {
        currentSection.content.push(line);
      }
    }

    // Push last section
    if (currentSection) {
      const cleanTitle = currentSection.title.replace(emojiRegex, '').trim();
      const config = getSectionConfig(cleanTitle);
      sections.push({
        id: cleanTitle.toLowerCase().replace(/\s+/g, '-'),
        title: cleanTitle,
        content: currentSection.content.join('\n').trim(),
        ...config
      });
    }

    return { companyName, sections };
  }, [report]);

  const handleCopy = async () => {
    if (report) {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (report) {
      const blob = new Blob([report], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${parseReport.companyName.toLowerCase().replace(/\s+/g, '-') || 'empresa'}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center shadow-lg">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-red-100 mb-3 sm:mb-4 shadow-inner">
          <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-red-900 mb-2">Erro ao gerar relatório</h3>
        <p className="text-sm sm:text-base text-red-700 max-w-md mx-auto">{error}</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="h-full min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-6 sm:p-8 lg:p-12">
        <div className="relative">
          <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full"></div>
          <Building2 className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mb-4 sm:mb-6 opacity-30 relative" />
        </div>
        <p className="text-base sm:text-lg lg:text-xl font-semibold text-slate-500 text-center">Nenhum relatório gerado</p>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 text-center">Preencha o formulário para iniciar a análise estratégica.</p>
        <div className="flex gap-2 mt-4 sm:mt-6">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    );
  }

  const { companyName, sections } = parseReport;

  return (
    <div className="animate-fade-in">
      {/* Header com nome da empresa */}
      <div className="bg-gradient-to-r from-brand-600 via-green-600 to-emerald-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 shadow-xl sm:shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-24 sm:w-36 lg:w-48 h-24 sm:h-36 lg:h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
            <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-2.5 sm:px-3 py-1 rounded-full text-white/90 text-xs sm:text-sm font-medium w-fit">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
              Análise B2B Completa
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="p-1.5 sm:p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all backdrop-blur-sm group"
                title="Copiar relatório"
              >
                {copied ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-300" />
                ) : (
                  <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform" />
                )}
              </button>
              <button
                onClick={handleDownload}
                className="p-1.5 sm:p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all backdrop-blur-sm group"
                title="Baixar relatório"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
          
          <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-white mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
            <Building2 className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 flex-shrink-0" />
            <span className="break-words">{companyName || 'Relatório da Empresa'}</span>
          </h1>
          <p className="text-white/80 text-xs sm:text-sm">
            Relatório gerado por IA • {new Date().toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Navigation Pills */}
      {sections.length > 0 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                const el = document.getElementById(section.id);
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setActiveSection(section.id);
              }}
              className={`
                inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all flex-shrink-0
                ${activeSection === section.id 
                  ? `bg-gradient-to-r ${section.gradient} text-white shadow-lg scale-105` 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-102'
                }
              `}
            >
              {section.icon}
              <span className="hidden xs:inline sm:inline">{section.title.split(' ').slice(0, 2).join(' ')}</span>
            </button>
          ))}
        </div>
      )}

      {/* Cards das Seções */}
      <div className="grid gap-4 sm:gap-6">
        {sections.map((section, index) => (
          <div
            key={section.id}
            id={section.id}
            className={`
              bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border overflow-hidden 
              transition-all duration-300 hover:shadow-xl
              ${section.bgColor.split(' ')[1]}
            `}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Card Header */}
            <div className={`bg-gradient-to-r ${section.gradient} p-3 sm:p-4 flex items-center gap-2 sm:gap-3`}>
              <div className="p-1.5 sm:p-2 bg-white/20 rounded-md sm:rounded-lg backdrop-blur-sm">
                {React.cloneElement(section.icon as React.ReactElement, { className: 'w-5 h-5 sm:w-6 sm:h-6 text-white' })}
              </div>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white truncate">{section.title}</h2>
            </div>
            
            {/* Card Content */}
            <div className={`p-4 sm:p-6 ${section.bgColor.split(' ')[0]}`}>
              <div className="prose prose-slate max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h3: ({ children }) => (
                      <h3 className="text-lg font-semibold text-slate-800 mt-4 mb-2 flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${section.gradient}`}></div>
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-slate-600 leading-relaxed mb-3">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="space-y-2 my-3">{children}</ul>
                    ),
                    li: ({ children }) => (
                      <li className="flex items-start gap-2 text-slate-600">
                        <span className={`mt-2 w-1.5 h-1.5 rounded-full bg-gradient-to-r ${section.gradient} flex-shrink-0`}></span>
                        <span>{children}</span>
                      </li>
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-4 rounded-xl border border-slate-200 shadow-sm">
                        <table className="w-full">{children}</table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className={`bg-gradient-to-r ${section.gradient} text-white`}>{children}</thead>
                    ),
                    th: ({ children }) => (
                      <th className="px-4 py-3 text-left font-semibold text-sm">{children}</th>
                    ),
                    td: ({ children }) => (
                      <td className="px-4 py-3 text-slate-700 border-t border-slate-100">{children}</td>
                    ),
                    tr: ({ children }) => (
                      <tr className="hover:bg-slate-50 transition-colors">{children}</tr>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-slate-800">{children}</strong>
                    ),
                    a: ({ href, children }) => (
                      <a 
                        href={href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline underline-offset-2 inline-flex items-center gap-1"
                      >
                        {children}
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className={`border-l-4 border-gradient-to-r ${section.gradient.split(' ')[1]} pl-4 py-2 my-3 bg-white/50 rounded-r-lg italic text-slate-600`}>
                        {children}
                      </blockquote>
                    )
                  }}
                >
                  {section.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
      </div>


    </div>
  );
};

export default ReportDisplay;