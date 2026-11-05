"use client";

import { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, Loader2, Info } from "lucide-react";
import * as motion from "framer-motion/client";

export default function AdminMediaPage() {
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Gera um nome único para não haver ficheiros com nomes repetidos
      const fileExtension = file.name.split('.').pop();
      const uniqueFilename = `media-${Date.now()}.${fileExtension}`;

      const response = await fetch(`/api/upload?filename=${uniqueFilename}`, {
        method: 'POST',
        body: file,
      });

      if (!response.ok) throw new Error('Falha no upload');

      const data = await response.json();
      
      // Adiciona a nova URL da imagem à nossa galeria
      setImages((prev) => [data.url, ...prev]);
      
    } catch (error) {
      alert("Ocorreu um erro ao carregar a imagem.");
      console.error(error);
    } finally {
      setIsUploading(false);
      // Limpa o input para poder carregar a mesma imagem de novo se quiser
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Mídia e Imagens</h1>
        <p className="text-stone-500">Faça o upload de fotos para usar nos produtos e na marca.</p>
      </header>

      {/* PAINEL DE DICAS DE TAMANHO */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8 flex gap-4">
        <Info className="text-blue-500 flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-semibold text-blue-900 mb-2">Tamanhos Recomendados</h3>
          <ul className="text-sm text-blue-800 flex flex-col gap-1 list-disc pl-4">
            <li><b>Foto de Produto:</b> 800 x 800 pixels (Proporção 1:1, Quadrada). Fundo liso ou transparente.</li>
            <li><b>Logotipo do Restaurante:</b> 400 x 400 pixels. Preferência por PNG com fundo transparente.</li>
            <li><b>Capa do Restaurante:</b> 1920 x 400 pixels (Banner). Formato retangular horizontal (JPG).</li>
            <li><b>Tamanho máximo:</b> 4MB por imagem para não deixar o menu lento.</li>
          </ul>
        </div>
      </div>

      {/* ÁREA DE UPLOAD */}
      <div className="bg-white rounded-2xl p-8 border border-stone-200 text-center mb-8">
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleUpload}
          accept="image/png, image/jpeg, image/webp"
          className="hidden" 
        />
        
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {isUploading ? (
              <Loader2 className="animate-spin text-stone-900" size={24} />
            ) : (
              <UploadCloud className="text-stone-600" size={24} />
            )}
          </div>
          <h2 className="text-lg font-semibold text-stone-900 mb-2">
            {isUploading ? "A carregar imagem..." : "Arraste fotos ou clique aqui"}
          </h2>
          <p className="text-stone-500 text-sm mb-6">
            Suporta JPG, PNG e WEBP.
          </p>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-stone-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors disabled:opacity-70"
          >
            Selecionar do Computador
          </button>
        </div>
      </div>

      {/* GALERIA VISUAL */}
      <div>
        <h2 className="text-lg font-semibold text-stone-900 mb-4">Arquivos Recentes</h2>
        
        {images.length === 0 ? (
          <div className="text-center py-12 bg-stone-100/50 rounded-2xl border border-dashed border-stone-200">
            <ImageIcon size={32} className="mx-auto text-stone-300 mb-3" />
            <p className="text-stone-500 text-sm">Nenhuma imagem enviada ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {images.map((url, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative aspect-square bg-stone-100 rounded-xl overflow-hidden border border-stone-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="Galeria" className="w-full h-full object-cover" />
                
                {/* Overlay com botão de copiar link ao passar o rato */}
                <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(url);
                      alert("Link da imagem copiado!");
                    }}
                    className="bg-white text-stone-900 text-xs font-bold px-3 py-1.5 rounded-md hover:bg-stone-100"
                  >
                    Copiar URL
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}