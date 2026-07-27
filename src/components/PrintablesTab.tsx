import React, { useState } from 'react';
import { ClipboardList, X, Printer, Maximize2 } from 'lucide-react';
import { AnimatedTabIcon } from './AnimatedTabIcon';

interface PrintablesTabProps {
  onModalToggle?: (isOpen: boolean) => void;
}

const PrintablesTab: React.FC<PrintablesTabProps> = ({ onModalToggle }) => {
  const [selectedFile, setSelectedFile] = useState<{ label: string; file: string } | null>(null);

  const forms = [
    { id: 'lrf', label: 'Laboratory Request Form (4s for A4)', file: `${import.meta.env.BASE_URL}lrf.pdf` },
    { id: 'slrf', label: 'Laboratory Request Form (1s for A6)', file: `${import.meta.env.BASE_URL}slrf.pdf` },
    { id: 'ef', label: 'Equilife Form', file: `${import.meta.env.BASE_URL}ef.pdf` },
    { id: 'efn', label: 'Equilife Forms (NEW)', file: `${import.meta.env.BASE_URL}ef1.pdf` },
    { id: 'spf', label: 'SurgPath Form', file: `${import.meta.env.BASE_URL}sp.pdf` },
    { id: 'rivf', label: 'RIV Form', file: `${import.meta.env.BASE_URL}rivf.pdf` },
  ];

  const handleSelectFile = (form: { label: string; file: string } | null) => {
    setSelectedFile(form);
    if (onModalToggle) {
      onModalToggle(!!form);
    }
  };

  return (
    <div id="third-tool" className="tool-content active">
      <div className="input-section">
        <div id="title-logo-wrapper">
          <AnimatedTabIcon id="third-tool" isActive={true} size={30} />
          <h2>Printables Repository</h2>
        </div>

        <div className="input-column">
          <div className="bg-white border border-[#ced4da] p-[15px] rounded-lg my-5 shadow-[0_6px_15px_rgba(0,0,0,0.05)]">
            <p className="text-base mt-1.25 text-[#374151]">
              <strong>• Use only for emergency:</strong> Procure forms from nurse stations as much as possible.
            </p>
            <p className="text-base mt-1.25 text-[#374151]">
              <strong>• Select a form below to view a printable PDF preview. Press printer button to print.</strong>
            </p>
          </div>

          <div className="flex gap-[15px] flex-wrap mb-[30px]">
            {forms.map(form => (
              <button 
                key={form.id} 
                onClick={() => handleSelectFile(form)}
              >
                {form.label}
              </button>
            ))}
          </div>
        </div>

        {/* PDF Modal Popup */}
        {selectedFile && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full h-full max-w-6xl max-h-screen md:max-h-[95vh] md:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-gray-800">{selectedFile.label}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={selectedFile.file}
                    download
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm border-none cursor-pointer no-underline"
                  >
                    <Printer className="w-4 h-4" />
                    Download to Print
                  </a>
                  <button
                    onClick={() => handleSelectFile(null)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500 border-none bg-transparent cursor-pointer"
                    title="Close"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content - PDF Viewer */}
              <div className="flex-1 bg-gray-100 relative flex flex-col">
                <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 flex items-center justify-between">
                  <p className="text-[11px] md:text-xs text-blue-700 flex items-center gap-2">
                    <Maximize2 className="w-3 h-3" />
                    <strong>Tip:</strong> If this is a fillable form, type directly into the boxes. Use the <strong>print icon INSIDE the PDF toolbar</strong> (top right of the PDF) to ensure your text is included.
                  </p>
                  <a 
                    href={selectedFile.file} 
                    download 
                    className="text-[11px] md:text-xs text-blue-600 font-bold hover:underline"
                  >
                    Download PDF
                  </a>
                </div>
                <div className="flex-1">
                  <iframe
                    id="pdf-viewer"
                    src={`${selectedFile.file}#toolbar=1&view=FitH`}
                    className="w-full h-full border-none"
                    title="Printable Preview"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrintablesTab;
