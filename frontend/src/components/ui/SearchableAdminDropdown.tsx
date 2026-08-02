import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Plus } from 'lucide-react';

interface Option {
  id: string | number;
  name: string;
}

interface SearchableAdminDropdownProps {
  options: Option[];
  value: string | number;
  onChange: (val: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  onQuickAdd?: (newText: string) => Promise<void>;
}

export default function SearchableAdminDropdown({
  options,
  value,
  onChange,
  placeholder = '-- Chọn --',
  disabled = false,
  onQuickAdd
}: SearchableAdminDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(opt => String(opt.id) === String(value));
  
  const filteredOptions = options.filter(opt => 
    (opt.name || '').toLowerCase().includes(search.toLowerCase())
  );

  console.log("SearchableDropdown Render:", { options, filteredOptions, search });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id: string | number) => {
    onChange(id);
    setIsOpen(false);
    setSearch('');
  };

  const handleQuickAdd = async () => {
    if (!search.trim() || !onQuickAdd) return;
    setIsAdding(true);
    try {
      await onQuickAdd(search.trim());
      setIsOpen(false);
      setSearch('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className={`relative w-full ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} ref={wrapperRef}>
      <div 
        className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer focus-within:ring-2 focus-within:ring-blue-500"
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? 'text-white font-medium' : 'text-slate-400'}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown className="w-5 h-5 text-slate-400" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1e293b] border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-slate-700 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              className="w-full bg-[#0f172a] text-white rounded-lg pl-9 pr-3 py-2 text-sm outline-none placeholder:text-slate-500 border border-transparent focus:border-slate-600"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className="overflow-y-auto max-h-[200px] p-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <div 
                  key={opt.id} 
                  onClick={() => handleSelect(opt.id)}
                  className={`px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium transition-colors ${String(opt.id) === String(value) ? 'bg-blue-600/20 text-blue-400' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'}`}
                >
                  {opt.name}
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-sm text-slate-500">
                Không tìm thấy kết quả
              </div>
            )}
          </div>
          
          {onQuickAdd && search.trim() && !filteredOptions.some(opt => opt.name.toLowerCase() === search.toLowerCase().trim()) && (
            <div className="p-2 border-t border-slate-700 bg-[#0f172a]/50">
              <button 
                onClick={handleQuickAdd}
                disabled={isAdding}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 transition-colors text-sm font-semibold disabled:opacity-50"
              >
                {isAdding ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
                    Đang lưu...
                  </span>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Thêm điểm đến mới: <span className="text-white">&ldquo;{search.trim()}&rdquo;</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
