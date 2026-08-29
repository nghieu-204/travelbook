'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, Check } from 'lucide-react'

export interface MultiSelectOption {
  id: string | number
  label: string
  count?: number
}

interface MultiSelectDropdownProps {
  label: string
  placeholder?: string
  options: MultiSelectOption[]
  selectedIds: (string | number)[]
  onChange: (selectedIds: (string | number)[]) => void
  disabled?: boolean
}

export default function MultiSelectDropdown({
  label,
  placeholder = 'Chọn mục',
  options,
  selectedIds,
  onChange,
  disabled = false
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Reset search khi đóng dropdown
  const handleToggle = () => {
    const next = !isOpen
    setIsOpen(next)
    if (!next) setSearchTerm('')
  }

  // Lọc option theo từ khóa tìm kiếm (Realtime)
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Logic chọn / bỏ chọn
  const toggleOption = (id: string | number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(selectedId => selectedId !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* 1. Label ở trên */}
      <label className="block text-sm font-semibold text-slate-400 mb-2">
        {label}
      </label>

      {/* 2. Nút bấm (Trigger Button) */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`w-full flex items-center justify-between bg-[#0f172a] border ${disabled ? 'border-slate-800 opacity-50 cursor-not-allowed' : 'border-slate-700 hover:bg-slate-800 focus:ring-2 focus:ring-blue-500'} px-5 py-3 rounded-xl transition-colors outline-none text-white`}
      >
        <span className="truncate mr-4 text-sm font-medium">
          {selectedIds.length > 0 
            ? `Đã chọn ${selectedIds.length} mục` 
            : placeholder}
        </span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* 3. Menu xổ xuống (Dropdown Menu) */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-[#1e293b] rounded-xl shadow-xl border border-slate-700 z-50 overflow-hidden origin-top animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Header: Search Input */}
          <div className="p-3 border-b border-slate-700">
            <div className="relative flex items-center bg-[#0f172a] rounded-lg px-4 py-2.5 border border-slate-700 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
              <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent outline-none text-sm text-white font-medium placeholder:text-slate-500 placeholder:font-normal"
                autoFocus
              />
            </div>
          </div>

          {/* Danh sách (List) với Custom Scrollbar bằng Tailwind */}
          <div className="max-h-[250px] overflow-y-auto p-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-500">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => {
                const isSelected = selectedIds.includes(option.id)
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleOption(option.id)}
                    className="w-full flex items-center px-3 py-2.5 rounded-lg hover:bg-[#0f172a] transition-colors text-left group"
                  >
                    {/* Checkbox Hình vuông */}
                    <div className={`w-5 h-5 flex-shrink-0 rounded-[4px] flex items-center justify-center mr-3 border transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-600 bg-[#0f172a] group-hover:border-blue-400'}`}>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </div>
                    
                    {/* Tên địa điểm */}
                    <span className={`flex-1 text-sm truncate transition-colors ${isSelected ? 'font-semibold text-blue-400' : 'font-medium text-slate-300'}`}>
                      {option.label}
                    </span>
                    
                    {/* Số lượng tour (Count) */}
                    {option.count !== undefined && (
                      <span className="text-xs font-medium text-slate-400 ml-2">
                        ({option.count})
                      </span>
                    )}
                  </button>
                )
              })
            ) : (
              <div className="py-8 text-center flex flex-col items-center justify-center">
                <Search className="w-8 h-8 text-slate-200 mb-2" />
                <p className="text-sm text-slate-500 font-medium">Không tìm thấy kết quả</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
