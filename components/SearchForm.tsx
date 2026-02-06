import React, { useState } from 'react';
import { SearchFormData, QueryStatus, ReportSection } from '../types';
import { Search, Building2, MapPin, Briefcase, FileText, Loader2, ShoppingCart, Users, MessageSquare, Star, Rocket, Check, Award } from './Icons';

interface SearchFormProps {
  onSubmit: (data: SearchFormData) => void;
  status: QueryStatus;
}

const REPORT_SECTIONS: { id: ReportSection; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dados', label: 'Info Cadastrais', Icon: Building2 },
  { id: 'produtos', label: 'Produtos', Icon: ShoppingCart },
  { id: 'clientes', label: 'Clientes', Icon: Users },
  { id: 'canais', label: 'Canais', Icon: MessageSquare },
  { id: 'reclameaqui', label: 'Reclame Aqui', Icon: Star },
  { id: 'estrategia', label: 'Estratégia', Icon: Rocket },
  { id: 'clientesjetsales', label: 'Clientes JetSales', Icon: Award },
];

const SearchForm: React.FC<SearchFormProps> = ({ onSubmit, status }) => {
  const [formData, setFormData] = useState<SearchFormData>({
    companyName: '',
    cnpj: '',
    location: '',
    industry: '',
    additionalInfo: '',
    selectedSections: ['dados', 'produtos', 'clientes', 'canais', 'reclameaqui', 'estrategia', 'clientesjetsales']
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim()) return;
    onSubmit(formData);
  };

  const isLoading = status === QueryStatus.LOADING;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-slate-100 overflow-hidden">
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 p-4 sm:p-6">
        <h2 className="text-white text-lg sm:text-xl font-semibold">
          Nova Pesquisa
        </h2>
        <p className="text-brand-100 mt-1 text-xs sm:text-sm">
          Preencha os dados da empresa para gerar o relatório
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
        
        {/* Company Name */}
        <div className="space-y-2">
          <label htmlFor="companyName" className="block text-sm font-medium text-slate-700">
            Nome da Empresa <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building2 className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              name="companyName"
              id="companyName"
              required
              disabled={isLoading}
              placeholder="Ex: Magazine Luiza, WEG, Nubank..."
              className="block w-full pl-10 pr-3 py-3 text-base sm:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow disabled:bg-slate-50 disabled:text-slate-500 bg-white text-slate-900"
              value={formData.companyName}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5">
          {/* CNPJ */}
          <div className="space-y-2">
            <label htmlFor="cnpj" className="block text-sm font-medium text-slate-700">
              CNPJ <span className="text-slate-400 text-xs font-normal">(Opcional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="cnpj"
                id="cnpj"
                disabled={isLoading}
                placeholder="00.000.000/0001-00"
                className="block w-full pl-10 pr-3 py-2.5 text-base sm:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow disabled:bg-slate-50 disabled:text-slate-500 bg-white text-slate-900"
                value={formData.cnpj}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label htmlFor="location" className="block text-sm font-medium text-slate-700">
              Cidade / Estado <span className="text-slate-400 text-xs font-normal">(Opcional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="location"
                id="location"
                disabled={isLoading}
                placeholder="Ex: São Paulo, SP"
                className="block w-full pl-10 pr-3 py-2.5 text-base sm:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow disabled:bg-slate-50 disabled:text-slate-500 bg-white text-slate-900"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Industry */}
        <div className="space-y-2">
          <label htmlFor="industry" className="block text-sm font-medium text-slate-700">
            Setor de Atuação <span className="text-slate-400 text-xs font-normal">(Opcional)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Briefcase className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              name="industry"
              id="industry"
              disabled={isLoading}
              placeholder="Ex: Varejo, Indústria, Tecnologia..."
              className="block w-full pl-10 pr-3 py-2.5 text-base sm:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow disabled:bg-slate-50 disabled:text-slate-500 bg-white text-slate-900"
              value={formData.industry}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Context */}
        <div className="space-y-2">
          <label htmlFor="additionalInfo" className="block text-sm font-medium text-slate-700">
            Informações Adicionais <span className="text-slate-400 text-xs font-normal">(Opcional)</span>
          </label>
          <textarea
            name="additionalInfo"
            id="additionalInfo"
            disabled={isLoading}
            rows={3}
            placeholder="Contexto da reunião, dúvidas específicas ou produtos de interesse..."
            className="block w-full p-3 text-base sm:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow resize-none disabled:bg-slate-50 disabled:text-slate-500 bg-white text-slate-900"
            value={formData.additionalInfo}
            onChange={handleChange}
          />
        </div>

        {/* Section Selection */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700">
              Seções do Relatório
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setFormData(prev => ({ ...prev, selectedSections: REPORT_SECTIONS.map(s => s.id) }))}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium disabled:opacity-50"
              >
                Todas
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setFormData(prev => ({ ...prev, selectedSections: [] }))}
                className="text-xs text-slate-500 hover:text-slate-700 font-medium disabled:opacity-50"
              >
                Limpar
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {REPORT_SECTIONS.map((section, index) => {
              const isSelected = formData.selectedSections.includes(section.id);
              const IconComponent = section.Icon;
              const isLastOdd = REPORT_SECTIONS.length % 2 === 1 && index === REPORT_SECTIONS.length - 1;
              return (
                <button
                  key={section.id}
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      selectedSections: isSelected
                        ? prev.selectedSections.filter(s => s !== section.id)
                        : [...prev.selectedSections, section.id]
                    }));
                  }}
                  className={`
                    flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium
                    border-2 transition-all duration-200 disabled:opacity-50
                    ${isLastOdd ? 'sm:col-span-2' : ''}
                    ${isSelected 
                      ? 'border-brand-500 bg-brand-50 text-brand-700' 
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }
                  `}
                >
                  <div className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center ${isSelected ? 'bg-brand-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    {isSelected ? <Check className="w-3.5 h-3.5" /> : <IconComponent className="w-3.5 h-3.5" />}
                  </div>
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !formData.companyName.trim() || formData.selectedSections.length === 0}
          className="w-full flex justify-center items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all duration-200 transform active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5" />
              Analisando...
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              Gerar Relatório
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SearchForm;