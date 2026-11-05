"use client";

import { useState } from "react";
import { Pencil, Trash2, Printer, X, Loader2 } from "lucide-react";
import { updateTableAction, deleteTableAction, refreshTableTokenAction } from "@/app/server/actions/tables";

// --- BOTÃO DE IMPRIMIR ---
export function PrintQRButton({ tableName, url }: { tableName: string, url: string }) {
  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=600,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${tableName}</title>
            <style>
              body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              h1 { font-size: 32px; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <h1>${tableName}</h1>
            <div id="qr-container"></div>
            <!-- Usamos uma biblioteca externa no HTML apenas para desenhar o QR Code na aba de impressão -->
            <script src="https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js"></script>
            <script>
              new QRCode(document.getElementById("qr-container"), { text: "${url}", width: 250, height: 250 });
              setTimeout(() => { window.print(); window.close(); }, 800);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <button onClick={handlePrint} className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
      <Printer size={16} />
      Imprimir
    </button>
  );
}

// --- BOTÃO E MODAL DE EDITAR (COM ELIMINAR LÁ DENTRO) ---
export function EditTableButton({ table }: { table: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(table.name);
  const [isActive, setIsActive] = useState(table.isActive);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    const result = await updateTableAction(table.id, name, isActive);
    setIsSubmitting(false);
    if (result.success) setIsOpen(false);
    else alert(result.error);
  };

  const handleDelete = async () => {
    // Usamos aspas normais e concatenamos para não dar erro de escape no JSX
    const mensagem = "Tem a certeza que deseja apagar a " + table.name + "? Se já existirem pedidos nesta mesa, o sistema apenas deixará desativá-la.";
    
    if (!window.confirm(mensagem)) return;
    
    setIsDeleting(true);
    const result = await deleteTableAction(table.id);
    setIsDeleting(false);
    
    if (result.success) {
      setIsOpen(false);
    } else {
      alert(result.error);
    }
  };

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!window.confirm("Atenção: Ao gerar um novo QR Code, o link antigo deixará de funcionar imediatamente. Os clientes que já fizeram os seus pedidos não perdem os mesmos, mas terão de ler o novo QR Code caso queiram aceder de novo ao menu. Deseja continuar?")) return;
    
    setIsRefreshing(true);
    const result = await refreshTableTokenAction(table.id);
    setIsRefreshing(false);
    
    if (result.success) {
      alert("Novo código gerado com sucesso! Lembre-se de imprimir o novo QR Code.");
      setIsOpen(false);
    } else {
      alert(result.error);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
        <Pencil size={16} />
        Editar
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <h2 className="text-xl font-semibold text-stone-900">Configurar Mesa</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 text-stone-400 hover:bg-stone-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-200">
                <span className="text-sm font-medium text-stone-900">Mesa Ativa no Salão</span>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${isActive ? 'bg-emerald-500' : 'bg-stone-300'}`}
                >
                  <span className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${isActive ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-stone-700">Nome da Mesa</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="px-4 py-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-900"
                />
              </div>

              <div className="flex flex-col gap-1.5 pt-4 mt-2 border-t border-stone-100">
                <span className="text-sm font-medium text-stone-900">Segurança do QR Code</span>
                <p className="text-xs text-stone-500 mb-2">Clique abaixo para invalidar o QR Code antigo. Recomendado quando um grupo de clientes se for embora da mesa.</p>
                <button 
                  type="button" 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="w-full bg-stone-100 text-stone-700 hover:bg-stone-200 hover:text-stone-900 border border-stone-200 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isRefreshing ? <Loader2 size={16} className="animate-spin" /> : "Gerar Novo Código de Segurança"}
                </button>
              </div>

              <div className="flex justify-between mt-4 pt-4 border-t border-stone-100">
                <button type="button" onClick={handleDelete} disabled={isDeleting} className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  {isDeleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                </button>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg">Cancelar</button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2.5 text-sm font-medium text-white bg-stone-900 rounded-lg flex items-center gap-2">
                    {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                    Guardar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}