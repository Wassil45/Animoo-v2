import React from 'react';
import { FilterOptions } from '../types';
import { X, Check } from 'lucide-react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onChangeFilters: (filters: FilterOptions) => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onChangeFilters,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <h2 className="text-xl font-extrabold text-stone-900">Préférences de rencontre</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center hover:bg-stone-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Species Selector */}
        <div>
          <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">
            Je souhaite rencontrer des
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'all', label: '🐾 Tous' },
              { id: 'dog', label: '🐶 Chiens' },
              { id: 'cat', label: '🐱 Chats' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => onChangeFilters({ ...filters, species: opt.id as any })}
                className={`py-2.5 px-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  filters.species === opt.id
                    ? 'bg-gradient-to-r from-primary to-[#FF5E62] text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Distance Slider */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Distance maximale
            </label>
            <span className="text-xs font-bold text-rose-600">{filters.maxDistanceKm} km</span>
          </div>
          <input
            type="range"
            min="1"
            max="25"
            step="1"
            value={filters.maxDistanceKm}
            onChange={(e) => onChangeFilters({ ...filters, maxDistanceKm: Number(e.target.value) })}
            className="w-full accent-[#E11D48] h-2 bg-stone-200 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-stone-400 mt-1">
            <span>1 km</span>
            <span>10 km</span>
            <span>25 km</span>
          </div>
        </div>

        {/* Max Age */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Âge maximal
            </label>
            <span className="text-xs font-bold text-rose-600">{filters.maxAge} ans</span>
          </div>
          <input
            type="range"
            min="1"
            max="12"
            step="1"
            value={filters.maxAge}
            onChange={(e) => onChangeFilters({ ...filters, maxAge: Number(e.target.value) })}
            className="w-full accent-[#E11D48] h-2 bg-stone-200 rounded-lg cursor-pointer"
          />
        </div>

        {/* Energy Level Filter */}
        <div>
          <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">
            Niveau d'énergie recherché
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'all', label: 'Tous' },
              { id: 'calm', label: 'Calme 💤' },
              { id: 'medium', label: 'Modéré 🎾' },
              { id: 'high', label: 'Énergie ⚡' },
            ].map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => onChangeFilters({ ...filters, minEnergy: lvl.id as any })}
                className={`py-2 px-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                  filters.minEnergy === lvl.id
                    ? 'bg-rose-500 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toggle options */}
        <div className="flex flex-col gap-3 pt-2 border-t border-stone-100">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs font-semibold text-stone-700">Profils vaccinés & vérifiés uniquement</span>
            <input
              type="checkbox"
              checked={filters.verifiedOnly}
              onChange={(e) => onChangeFilters({ ...filters, verifiedOnly: e.target.checked })}
              className="w-4 h-4 accent-[#E11D48] rounded"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs font-semibold text-stone-700">Animaux stérilisés</span>
            <input
              type="checkbox"
              checked={filters.sterilizedOnly}
              onChange={(e) => onChangeFilters({ ...filters, sterilizedOnly: e.target.checked })}
              className="w-4 h-4 accent-[#E11D48] rounded"
            />
          </label>
        </div>

        {/* Submit */}
        <button
          onClick={onClose}
          className="w-full h-12 rounded-full bg-gradient-to-r from-primary to-[#FF5E62] text-white font-bold text-sm shadow-md active:scale-95 transition-all cursor-pointer mt-2"
        >
          Appliquer les filtres
        </button>
      </div>
    </div>
  );
};
