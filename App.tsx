import React, { useState } from 'react';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import ReportDisplay from './components/ReportDisplay';
import { SearchFormData, ReportState, QueryStatus } from './types';
import { generateCompanyReport } from './services/openaiService';

const App: React.FC = () => {
  const [reportState, setReportState] = useState<ReportState>({
    isLoading: false,
    data: null,
    error: null
  });

  const [status, setStatus] = useState<QueryStatus>(QueryStatus.IDLE);

  const handleSearchSubmit = async (formData: SearchFormData) => {
    setReportState({ isLoading: true, data: null, error: null });
    setStatus(QueryStatus.LOADING);

    try {
      const markdownReport = await generateCompanyReport(formData);
      setReportState({
        isLoading: false,
        data: markdownReport,
        error: null
      });
      setStatus(QueryStatus.SUCCESS);
    } catch (err: any) {
      setReportState({
        isLoading: false,
        data: null,
        error: err.message || "Ocorreu um erro desconhecido ao tentar gerar o relatório."
      });
      setStatus(QueryStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-grow py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-start">
          
          {/* Left Column: Input Form (Sticky on Desktop) */}
          <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-4 sm:space-y-6">
            <SearchForm onSubmit={handleSearchSubmit} status={status} />
          </div>

          {/* Right Column: Report Display */}
          <div className="lg:col-span-8">
            <ReportDisplay 
              report={reportState.data} 
              error={reportState.error} 
            />
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;