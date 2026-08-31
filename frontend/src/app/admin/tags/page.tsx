/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { tourService } from '@/services/tourService'
import { Tag, Edit, Trash2, X, Check, Search, Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useConfirm } from '@/providers/ConfirmProvider'

interface TagItem {
  id: number
  name: string
  category: 'type' | 'occasion'
}

export default function TagsAdminPage() {
  const { confirm } = useConfirm()
  const [tags, setTags] = useState<TagItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<'all' | 'type' | 'occasion'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editCategory, setEditCategory] = useState<'type' | 'occasion'>('type')
  const [isSaving, setIsSaving] = useState(false)

  // Add state
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState<'type' | 'occasion'>('type')
  const [isSavingNew, setIsSavingNew] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const data = await tourService.getMetadata()
      const types = (data.tourtypes || []).map((t: any) => ({ ...t, category: 'type' }))
      const occasions = (data.occasions || []).map((o: any) => ({ ...o, category: 'occasion' }))
      setTags([...types, ...occasions])
    } catch (error) {
      console.error("Failed to load metadata", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterCategory])

  const handleDelete = async (id: number, category: string) => {
    const isConfirmed = await confirm({
      title: "Xóa nhãn",
      description: "Bạn có chắc chắn muốn xóa nhãn này?",
      type: "danger"
    });
    if (!isConfirmed) return;
    
    try {
      await tourService.deleteMetadata(`/admin/tags/${id}?category=${category}`)
      setTags(prev => prev.filter(t => !(t.id === id && t.category === category)))
      toast.success('Đã xóa nhãn thành công!')
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra khi xóa nhãn!')
    }
  }

  const startEdit = (tag: TagItem) => {
    setEditingId(tag.id)
    setEditName(tag.name)
    setEditCategory(tag.category)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
  }

  const handleSave = async (id: number) => {
    if (!editName.trim()) {
      toast.error('Tên nhãn không được để trống!')
      return
    }

    const isDuplicate = tags.some(t => t.id !== id && t.name.toLowerCase() === editName.trim().toLowerCase() && t.category === editCategory)
    if (isDuplicate) {
      toast.error('Cảnh báo: Nhãn này đã tồn tại trong hệ thống!')
      return
    }

    setIsSaving(true)
    try {
      await tourService.updateMetadata('/admin/tags', id, {
        name: editName.trim(),
        category: editCategory
      })
      
      setTags(prev => prev.map(t => 
        (t.id === id && t.category === editCategory) ? { ...t, name: editName.trim() } : t
      ))
      setEditingId(null)
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật nhãn!')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAdd = async () => {
    if (!newName.trim()) {
      toast.error('Tên nhãn không được để trống!')
      return
    }

    const isDuplicate = tags.some(t => t.name.toLowerCase() === newName.trim().toLowerCase() && t.category === newCategory)
    if (isDuplicate) {
      toast.error('Cảnh báo: Nhãn này đã tồn tại trong hệ thống!')
      return
    }

    setIsSavingNew(true)
    try {
      const res = await tourService.createMetadata('/admin/tags', {
        name: newName.trim(),
        category: newCategory
      })
      
      if (res && res.tag) {
        setTags(prev => [res.tag, ...prev])
        setIsAdding(false)
        setNewName('')
        toast.success('Đã thêm nhãn mới thành công!')
      }
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra khi thêm nhãn mới!')
    } finally {
      setIsSavingNew(false)
    }
  }

  const filteredTags = tags.filter(t => {
    return t.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterCategory === 'all' || t.category === filterCategory)
  }).sort((a, b) => b.id - a.id)

  const totalPages = Math.ceil(filteredTags.length / itemsPerPage)
  const paginatedTags = filteredTags.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="shrink-0">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Tag className="w-6 h-6 text-purple-500" /> Quản lý Nhãn (Tags)
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="w-full sm:w-auto bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500 outline-none"
          >
            <option value="all">Tất cả Nhóm</option>
            <option value="type">Loại hình Du lịch</option>
            <option value="occasion">Dịp lễ / Sự kiện</option>
          </select>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Tìm nhãn..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1e293b] border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 w-full sm:w-auto justify-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-purple-900/20 whitespace-nowrap"
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
                <th className="px-6 py-4 font-semibold">Tên Nhãn</th>
                <th className="px-6 py-4 font-semibold">Nhóm Phân Loại</th>
                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isAdding && (
                <tr className="border-b border-slate-800 bg-purple-900/10">
                  <td className="px-6 py-4 font-medium text-purple-400 text-xs">MỚI</td>
                  <td className="px-6 py-4">
                    <input 
                      type="text"
                      placeholder="Nhập tên nhãn mới..."
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-[#0f172a] border border-purple-500 rounded px-3 py-1.5 text-white w-full outline-none focus:ring-2 focus:ring-purple-500/50"
                      autoFocus
                    />
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="bg-[#0f172a] border border-slate-600 rounded px-3 py-1.5 text-white w-full outline-none focus:ring-2 focus:ring-purple-500/50"
                    >
                      <option value="type">Loại hình Du lịch</option>
                      <option value="occasion">Dịp lễ / Sự kiện</option>
                    </select>
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
              {filteredTags.length === 0 && !isAdding ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Không tìm thấy nhãn nào.
                  </td>
                </tr>
              ) : (
                paginatedTags.map(tag => {
                  const isEditing = editingId === tag.id && editCategory === tag.category

                  return (
                    <tr key={`${tag.category}-${tag.id}`} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-500">#{tag.id}</td>
                      
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input 
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="bg-[#0f172a] border border-purple-500 rounded px-3 py-1.5 text-white w-full outline-none focus:ring-2 focus:ring-purple-500/50"
                            autoFocus
                          />
                        ) : (
                          <span className="font-semibold text-white">{tag.name}</span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-xs font-medium cursor-not-allowed">
                            {tag.category === 'type' ? 'Loại hình Du lịch' : 'Dịp lễ / Sự kiện'} (Không đổi)
                          </span>
                        ) : (
                          <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${tag.category === 'type' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-pink-500/20 text-pink-400 border border-pink-500/30'}`}>
                            {tag.category === 'type' ? 'Loại hình Du lịch' : 'Dịp lễ / Sự kiện'}
                          </span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button 
                                onClick={() => handleSave(tag.id)}
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
                                onClick={() => startEdit(tag)}
                                className="p-1.5 rounded hover:bg-purple-500/10 text-slate-400 hover:text-purple-400 transition-colors"
                                title="Sửa"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(tag.id, tag.category)}
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
