import React from 'react';
import { Product } from '../types/game';
import { PRODUCTS } from '../constants/gameData';

interface ProductSelectProps {
  onSelect: (product: Product) => void;
  onBack: () => void;
}

const ProductSelect: React.FC<ProductSelectProps> = ({ onSelect, onBack }) => {
  return (
    <div 
      className="h-screen w-screen bg-cover bg-center flex items-center justify-center p-4 md:p-8 relative overflow-hidden"
      style={{ backgroundImage: "url('/assets/beach_bg.png')" }}
    >
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />

      {/* Back Button */}
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 md:top-8 md:left-8 z-20 flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-white/90 text-[#3164F4] font-black text-xs md:text-sm rounded-full shadow-lg border-2 md:border-4 border-[#3164F4] hover:bg-[#3164F4] hover:text-white transition-all duration-300 uppercase tracking-widest"
      >
        <span>←</span> VOLTAR
      </button>

      <div className="relative z-10 w-full max-w-5xl h-full flex flex-col justify-center py-4">
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-block bg-white/95 px-6 py-4 md:px-10 md:py-6 rounded-[30px] md:rounded-[40px] border-4 md:border-8 border-[#3164F4] shadow-2xl transform -rotate-1">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none text-[#3164F4]">
              Escolha seu <span className="text-[#FF4E6B]">Produto</span>
            </h2>
            <p className="mt-2 text-slate-600 font-bold uppercase text-[10px] md:text-xs tracking-[0.2em]">
              Selecione a campanha para iniciar sua jornada
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 max-h-[60vh] overflow-y-auto custom-scrollbar px-2">
          {PRODUCTS.map((product) => (
            <button
              key={product.id}
              onClick={() => onSelect(product)}
              className="group relative bg-white/95 rounded-[25px] md:rounded-[35px] p-4 md:p-6 shadow-lg border-2 border-transparent hover:border-[#3164F4] transition-all duration-300 hover:-translate-y-1 flex flex-col items-center justify-center gap-3 md:gap-4 overflow-hidden"
            >
              <div 
                className="absolute inset-x-0 bottom-0 h-1 transition-all duration-300 group-hover:h-full group-hover:opacity-10 opacity-0"
                style={{ backgroundColor: product.color }}
              />
              
              <div className="relative z-10 w-16 h-16 md:w-24 md:h-24 rounded-full bg-slate-50 flex items-center justify-center p-2 shadow-inner group-hover:scale-110 transition-transform duration-300 border border-slate-100">
                {product.logo ? (
                  <img 
                    src={product.logo} 
                    alt={product.name} 
                    className="w-full h-full object-contain p-2 drop-shadow-sm" 
                  />
                ) : (
                  <span className="text-2xl md:text-4xl font-black" style={{ color: product.color }}>
                    {product.name.charAt(0)}
                  </span>
                )}
              </div>
              
              <div className="relative z-10 text-center">
                <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter text-slate-800 transition-colors group-hover:text-[#3164F4]">
                  {product.name}
                </h3>
                <div 
                  className="w-8 h-1 mx-auto mt-2 rounded-full opacity-30 group-hover:w-16 group-hover:opacity-100 transition-all duration-300"
                  style={{ backgroundColor: product.color }}
                />
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 md:mt-10 text-center">
          <p className="text-white/90 font-black text-[9px] md:text-[10px] uppercase tracking-widest bg-black/40 backdrop-blur-md inline-block px-6 py-2 rounded-full border border-white/20">
            Enfrente a hierarquia AeC em cada produto selecionado
          </p>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(49, 100, 244, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default ProductSelect;
