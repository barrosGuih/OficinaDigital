import React, { useCallback } from 'react';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { FileText, Upload, Trash2, File, Download } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import { WorkshopDocument } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Documents: React.FC = () => {
  const { documents, addDocument, deleteDocument } = useData();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const newDoc: WorkshopDocument = {
        id: uuidv4(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file), // In a real app, upload to server
        uploadDate: new Date().toISOString(),
        category: 'other',
      };
      addDocument(newDoc);
    });
  }, [addDocument]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
        <p className="text-gray-500">Gestão de arquivos e contratos</p>
      </div>

      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? 'Solte os arquivos aqui...' : 'Clique ou arraste arquivos para upload'}
            </p>
            <p className="text-sm text-gray-500 mt-1">PDF, Imagens, Documentos (max. 10MB)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <Card key={doc.id} className="group hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate" title={doc.name}>{doc.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                    {doc.category}
                  </Badge>
                  <span className="text-xs text-gray-500">{formatSize(doc.size)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {format(new Date(doc.uploadDate), "d 'de' MMM, yyyy", { locale: ptBR })}
                </p>
              </div>
              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => window.open(doc.url, '_blank')}>
                  <Download className="w-4 h-4 text-gray-500" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:text-red-600" onClick={() => deleteDocument(doc.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
