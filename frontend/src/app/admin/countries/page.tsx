/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { fetchApi } from '@/lib/api'
import { MapPin, Edit, Trash2, X, Check, Search, Plus } from 'lucide-react'

interface Category {
  id: number
  name: string
}

interface Region {
  id: number
  category_id: number
  name: string
}

interface Country {
  id: number
  region_id: number
  name: string
}

export default function CountriesAdminPage() {
  const [countries, setCountries] = useState<Country[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategoryId, setFilterCategoryId] = useState<number>(0)
  const [filterRegionId, setFilterRegionId] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editCategoryId, setEditCategoryId] = useState<number>(0)
  const [editRegionId, setEditRegionId] = useState<number>(0)
  const [isSaving, setIsSaving] = useState(false)

  // Add state
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCategoryId, setNewCategoryId] = useState<number>(0)
  const [newRegionId, setNewRegionId] = useState<number>(0)
  const [isSavingNew, setIsSavingNew] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const data = await fetchApi('/metadata')
      setCountries(data.countries || [])
      setRegions(data.regions || [])
      setCategories(data.categories || [])
    } catch (error) {
      console.error("Failed to load metadata", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterRegionId, filterCategoryId])

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa điểm đến này?')) return
    
    try {
      await fetchApi(`/admin/countries/${id}`, { method: 'DELETE' })
      setCountries(prev => prev.filter(d => d.id !== id))
      alert('Đã xóa điểm đến thành công!')
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra khi xóa điểm đến!')
    }
  }

  const startEdit = (dest: Country) => {
    setEditingId(dest.id)
    setEditName(dest.name)
    setEditRegionId(dest.region_id)
    const region = regions.find(r => r.id === dest.region_id)
    setEditCategoryId(region ? region.category_id : 0)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setEditRegionId(0)
    setEditCategoryId(0)
  }

  const handleSave = async (id: number) => {
    if (!editName.trim()) {
      alert('Tên điểm đến không được để trống!')
      return
    }

    const isExist = countries.some(
      (d) => d.id !== id && d.name.toLowerCase() === editName.trim().toLowerCase()
    )
    if (isExist) {
      alert('Điểm đến này đã tồn tại!')
      return
    }

    setIsSaving(true)
    try {
      await fetchApi(`/admin/countries/${id}`, {
        method: 'PUT',
        data: {
          name: editName.trim(),
          region_id: editRegionId
        }
      })
      
      setCountries(prev => prev.map(d => 
        d.id === id ? { ...d, name: editName.trim(), region_id: editRegionId } : d
      ))
      setEditingId(null)
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra khi cập nhật điểm đến!')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAdd = async () => {
    if (!newName.trim()) {
      alert('Tên điểm đến không được để trống!')
      return
    }
    
    const isExist = countries.some(
      (d) => d.name.toLowerCase() === newName.trim().toLowerCase()
    )
    if (isExist) {
      alert('Điểm đến này đã tồn tại!')
      return
    }

    if (!newRegionId) {
      alert('Vui lòng chọn Vùng miền!')
      return
    }

    setIsSavingNew(true)
    try {
      const res = await fetchApi('/admin/countries', {
        method: 'POST',
        data: {
          name: newName.trim(),
          region_id: newRegionId
        }
      })
      
      if (res && res.id) {
        setCountries(prev => [res, ...prev])
        setIsAdding(false)
        setNewName('')
        setNewRegionId(0)
        alert('Đã thêm điểm đến mới thành công!')
      }
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra khi thêm điểm đến mới!')
    } finally {
      setIsSavingNew(false)
    }
  }

  const filteredCountries = countries.filter(d => {
    const region = regions.find(r => r.id === d.region_id)
    const categoryId = region ? region.category_id : 0
    return d.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterRegionId === 0 || d.region_id === filterRegionId) &&
      (filterCategoryId === 0 || categoryId === filterCategoryId)
  }).sort((a, b) => b.id - a.id) // Show newest first

  const totalPages = Math.ceil(filteredCountries.length / itemsPerPage)
  const paginatedCountries = filteredCountries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="shrink-0">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-500" /> Quản lý Điểm đến
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <select
            value={filterCategoryId}
            onChange={(e) => {
              setFilterCategoryId(Number(e.target.value))
              setFilterRegionId(0)
            }}
            className="w-full sm:w-auto bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value={0}>Loại Tour</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={filterRegionId}
            onChange={(e) => setFilterRegionId(Number(e.target.value))}
            className="w-full sm:w-auto bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value={0}>Tất cả Vùng miền</option>
            {regions.filter(r => filterCategoryId === 0 || r.category_id === filterCategoryId).map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Tìm điểm đến..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1e293b] border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 w-full sm:w-auto justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-900/20 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Thêm mới
          </button>
        </div>
      </div>

      <div className="bg-[#1e293b] rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-[#0f172a]/50">
              <tr>
                <th className="px-6 py-4 font-semibold w-16">ID</th>
                <th className="px-6 py-4 font-semibold">Tên Điểm đến</th>
                <th className="px-6 py-4 font-semibold">Thuộc Vùng miền</th>
                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isAdding && (
                <tr className="border-b border-slate-800 bg-blue-900/10">
                  <td className="px-6 py-4 font-medium text-blue-400 text-xs">MỚI</td>
                  <td className="px-6 py-4">
                    <input 
                      type="text"
                      placeholder="Nhập tên điểm đến mới..."
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-[#0f172a] border border-blue-500 rounded px-3 py-1.5 text-white w-full outline-none focus:ring-2 focus:ring-blue-500/50"
                      autoFocus
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <select 
                        value={newCategoryId}
                        onChange={(e) => {
                          setNewCategoryId(Number(e.target.value))
                          setNewRegionId(0)
                        }}
                        className="bg-[#0f172a] border border-slate-600 rounded px-3 py-1.5 text-white w-full outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        <option value={0}>-- Phân loại --</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <select 
                        value={newRegionId}
                        onChange={(e) => setNewRegionId(Number(e.target.value))}
                        className="bg-[#0f172a] border border-slate-600 rounded px-3 py-1.5 text-white w-full outline-none focus:ring-2 focus:ring-blue-500/50"
                        disabled={!newCategoryId}
                      >
                        <option value={0}>-- Chọn Vùng --</option>
                        {regions.filter(r => r.category_id === newCategoryId).map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={handleAdd}
                        disabled={isSavingNew}
                        className="p-1.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors"
                        title="Lưu"
                      >
                        {isSavingNew ? <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div> : <Check className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => setIsAdding(false)}
                        disabled={isSavingNew}
                        className="p-1.5 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
                        title="Hủy"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              {filteredCountries.length === 0 && !isAdding ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Không tìm thấy điểm đến nào.
                  </td>
                </tr>
              ) : (
                paginatedCountries.map(dest => {
                  const isEditing = editingId === dest.id
                  const regionName = regions.find(r => r.id === dest.region_id)?.name || 'Không rõ'

                  return (
                    <tr key={dest.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-500">#{dest.id}</td>
                      
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input 
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="bg-[#0f172a] border border-blue-500 rounded px-3 py-1.5 text-white w-full outline-none focus:ring-2 focus:ring-blue-500/50"
                            autoFocus
                          />
                        ) : (
                          <span className="font-semibold text-white">{dest.name}</span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <select 
                              value={editCategoryId}
                              onChange={(e) => {
                                setEditCategoryId(Number(e.target.value))
                                setEditRegionId(0)
                              }}
                              className="bg-[#0f172a] border border-slate-600 rounded px-3 py-1.5 text-white w-full outline-none focus:ring-2 focus:ring-blue-500/50"
                            >
                              <option value={0}>-- Phân loại --</option>
                              {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                            <select 
                              value={editRegionId}
                              onChange={(e) => setEditRegionId(Number(e.target.value))}
                              className="bg-[#0f172a] border border-slate-600 rounded px-3 py-1.5 text-white w-full outline-none focus:ring-2 focus:ring-blue-500/50"
                              disabled={!editCategoryId}
                            >
                              <option value={0}>-- Chọn Vùng --</option>
                              {regions.filter(r => r.category_id === editCategoryId).map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-xs font-medium">
                            {regionName}
                          </span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button 
                                onClick={() => handleSave(dest.id)}
                                disabled={isSaving}
                                className="p-1.5 rounded bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors"
                                title="Lưu"
                              >
                                {isSaving ? <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div> : <Check className="w-4 h-4" />}
                              </button>
                              <button 
                                onClick={cancelEdit}
                                disabled={isSaving}
                                className="p-1.5 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
                                title="Hủy"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => startEdit(dest)}
                                className="p-1.5 rounded hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 transition-colors"
                                title="Sửa"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(dest.id)}
                                className="p-1.5 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-[#1e293b] p-4 rounded-xl border border-slate-800 shadow-sm">
          <p className="text-sm text-slate-400">
            Hiển thị trang <span className="font-semibold text-white">{currentPage}</span> / <span className="font-semibold text-white">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-[#0f172a] text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700 transition-colors"
            >
              Trước
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-[#0f172a] text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700 transition-colors"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
