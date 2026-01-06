import React, { useCallback, useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  FileText, Upload, Trash2, Download, Search, 
  FileCheck, ShieldCheck, Clock, X, 
  Receipt, Briefcase, FileSignature, Layers
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Importando os tipos do seu arquivo central de types
import { DocumentCategory, WorkshopDocument } from '../types';

// Definição das categorias para o layout e filtros
const CATEGORY_MAP: { id: DocumentCategory; label: string; icon: any; color: string; bg: string }[] = [
  { id: 'nfe', label: 'Notas Fiscais', icon: Receipt, color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'contrato', label: 'Contratos', icon: FileSignature, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'rh', label: 'Recursos Humanos', icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'outros', label: 'Diversos', icon: FileText, color: 'text-slate-600', bg: 'bg-slate-50' },
];

export const Documents: React.FC = () => {
  const { documents, addDocument, deleteDocument } = useData();
  
  // ESTADOS
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'all'>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>('nfe');

  // LÓGICA DE UPLOAD (Dropzone)
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      // Criando o objeto com a tipagem correta
      const newDoc: WorkshopDocument = {
        id: uuidv4(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file), // Simulação de URL
        uploadDate: new Date().toISOString(),
        category: uploadCategory, // Tipagem garantida pelo useState<DocumentCategory>
      };
      addDocument(newDoc);
    });
    setIsUploadModalOpen(false);
  }, [addDocument, uploadCategory]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // FORMATADORES
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${['B', 'KB', 'MB', 'GB'][i]}`;
  };

  // FILTRAGEM
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-orange-100 pb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-2 h-8 bg-orange-500 rounded-full" />
            CENTRAL DE DOCUMENTOS
          </h1>
          <p className="text-slate-500 font-medium italic">Gestão e organização de arquivos da empresa</p>
        </div>
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 transition-all flex items-center gap-2 active:scale-95"
        >
          <Upload size={20} />
          UPLOAD DE ARQUIVO
        </button>
      </div>

      {/* CARDS DE ESTATÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<FileCheck className="text-emerald-600"/>} label="Total de Arquivos" value={documents.length} />
        <StatCard icon={<Receipt className="text-orange-600"/>} label="Notas Fiscais" value={documents.filter(d => d.category === 'nfe').length} />
        <StatCard icon={<ShieldCheck className="text-blue-600"/>} label="Contratos" value={documents.filter(d => d.category === 'contrato').length} />
        <StatCard icon={<Clock className="text-slate-600"/>} label="Espaço em Uso" value={formatSize(documents.reduce((acc, d) => acc + d.size, 0))} />
      </div>

      {/* BARRA DE FILTROS E BUSCA */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${selectedCategory === 'all' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Tudo
          </button>
          {CATEGORY_MAP.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${selectedCategory === cat.id ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        
        <div className="relative flex-1 max-w-md ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Pesquisar arquivo..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* GRID DE DOCUMENTOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDocs.map((doc) => {
          const categoryInfo = CATEGORY_MAP.find(c => c.id === doc.category) || CATEGORY_MAP[3];
          const Icon = categoryInfo.icon;

          return (
            <div key={doc.id} className="group bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all relative overflow-hidden flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ${categoryInfo.bg} ${categoryInfo.color}`}>
                  <Icon size={24} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button 
                    onClick={() => window.open(doc.url, '_blank')}
                    className="p-2 bg-slate-50 text-slate-600 hover:bg-orange-500 hover:text-white rounded-lg"
                    title="Baixar arquivo"
                  >
                    <Download size={16} />
                  </button>
                  <button 
                    onClick={() => deleteDocument(doc.id)}
                    className="p-2 bg-slate-50 text-slate-600 hover:bg-red-500 hover:text-white rounded-lg"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-slate-900 truncate pr-4" title={doc.name}>
                  {doc.name}
                </h3>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                  <span>{categoryInfo.label}</span>
                  <span>{formatSize(doc.size)}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock size={12} />
                  <span className="text-[10px] font-bold">
                    {format(new Date(doc.uploadDate), "dd MMM yyyy", { locale: ptBR })}
                  </span>
                </div>
                <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase font-black tracking-tighter">
                  {doc.type.split('/')[1]?.toUpperCase() || 'DOC'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* EMPTY STATE */}
      {filteredDocs.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <Layers size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-900">Nenhum documento</h3>
          <p className="text-slate-500">Faça um upload ou mude os filtros.</p>
        </div>
      )}

      {/* MODAL DE UPLOAD */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-orange-500 p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black tracking-tight">NOVO ARQUIVO</h2>
                <p className="text-xs text-orange-100 font-bold uppercase tracking-wider">Selecione a categoria antes</p>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="hover:rotate-90 transition-transform">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-2">
                {CATEGORY_MAP.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setUploadCategory(cat.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${uploadCategory === cat.id ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-inner' : 'border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50'}`}
                  >
                    <cat.icon size={18} />
                    <span className="text-xs font-black uppercase tracking-tighter">{cat.label}</span>
                  </button>
                ))}
              </div>

              <div 
                {...getRootProps()} 
                className={`border-4 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all ${
                  isDragActive ? 'border-orange-500 bg-orange-50 scale-105' : 'border-slate-100 hover:border-orange-200 hover:bg-slate-50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-sm border border-orange-200">
                    <Upload size={32} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 uppercase">Arraste seu arquivo</p>
                    <p className="text-xs text-slate-400 mt-1 font-medium">PDF, XML, Imagens (Máx 10MB)</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-all text-xs uppercase tracking-widest"
              >
                Cancelar Operação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// COMPONENTE DE MÉTRICAS (STAT CARD)
const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
  <div className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
    <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
    </div>
  </div>
);