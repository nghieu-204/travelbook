/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { tourService } from '@/services/tourService'
import { MapPin, Edit, Trash2, X, Check, Search, Plus, ChevronRight, ChevronDown, Folder, File, Globe, Map } from 'lucide-react'

interface Category { id: number; name: string }
interface Region { id: number; category_id: number; name: string }
interface Country { id: number; region_id: number; name: string }
interface Destination { id: number; region_id: number | null; country_id: number | null; name: string }

type NodeType = 'category' | 'region' | 'country' | 'destination' | 'landmark'

interface TreeNode {
  uid: string;
  id: number;
  name: string;
  type: NodeType;
  children: TreeNode[];
  categoryId?: number;
  regionId?: number;
  countryId?: number;
  destinationId?: number;
  isInternational?: boolean;
}

const TreeRow = ({ 
  node, 
  level = 0, 
  onAdd, 
  onEdit, 
  onDelete,
  searchTerm
}: { 
  node: TreeNode; 
  level?: number;
  onAdd: (type: NodeType, parentNode: TreeNode) => void;
  onEdit: (node: TreeNode) => void;
  onDelete: (node: TreeNode) => void;
  searchTerm?: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(level < 1);
  const hasChildren = node.children && node.children.length > 0;

  useEffect(() => {
    if (searchTerm) {
      setIsExpanded(true)
    } else {
      setIsExpanded(level < 1)
    }
  }, [searchTerm, level])

  const getIcon = () => {
    switch (node.type) {
      case 'category': return <Globe className="w-4 h-4 text-blue-500" />
      case 'region': return <Map className="w-4 h-4 text-emerald-500" />
      case 'country': return <Folder className="w-4 h-4 text-amber-500" />
      case 'destination': return <MapPin className="w-4 h-4 text-rose-500" />
      case 'landmark': return <MapPin className="w-3 h-3 text-purple-400" />
    }
  }

  const getTypeLabel = () => {
    switch (node.type) {
      case 'category': return 'Phân loại'
      case 'region': return 'Vùng miền'
      case 'country': return 'Quốc gia'
      case 'destination': return 'Điểm đến'
      case 'landmark': return 'Địa danh (Cấp 4)'
    }
  }

  return (
    <>
      <tr className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
        <td className="px-6 py-3">
          <div className="flex items-center" style={{ paddingLeft: `${level * 24}px` }}>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-6 h-6 flex items-center justify-center shrink-0 mr-1 text-slate-400 hover:text-white disabled:opacity-30"
              disabled={!hasChildren}
            >
              {hasChildren ? (isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />) : <span className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-2">
              {getIcon()}
              <span className={`font-medium ${node.type === 'category' ? 'text-white' : 'text-slate-300'}`}>
                {node.name}
              </span>
              <span className="text-xs text-slate-500 ml-2 bg-slate-800 px-2 py-0.5 rounded-full">
                {getTypeLabel()}
              </span>
            </div>
          </div>
        </td>
        <td className="px-6 py-3 text-right">
          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {node.type === 'category' && (
              <button onClick={() => onAdd('region', node)} className="px-2 py-1 text-xs font-medium rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors">
                + Thêm Vùng miền
              </button>
            )}
            {node.type === 'region' && node.isInternational && (
              <button onClick={() => onAdd('country', node)} className="px-2 py-1 text-xs font-medium rounded bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white transition-colors">
                + Thêm Quốc gia
              </button>
            )}
            {node.type === 'region' && !node.isInternational && (
              <button onClick={() => onAdd('destination', node)} className="px-2 py-1 text-xs font-medium rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors">
                + Thêm Điểm đến
              </button>
            )}
            {node.type === 'country' && (
              <button onClick={() => onAdd('destination', node)} className="px-2 py-1 text-xs font-medium rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors">
                + Thêm Điểm đến
              </button>
            )}
            {node.type === 'destination' && (
              <button onClick={() => onAdd('landmark', node)} className="px-2 py-1 text-xs font-medium rounded bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white transition-colors">
                + Thêm Địa danh
              </button>
            )}
            
            {node.type !== 'category' && (
              <>
                <button onClick={() => onEdit(node)} className="p-1.5 rounded hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 transition-colors" title="Sửa">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(node)} className="p-1.5 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors" title="Xóa">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
      {isExpanded && hasChildren && node.children.map(child => (
        <TreeRow 
          key={child.uid} 
          node={child} 
          level={level + 1} 
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
          searchTerm={searchTerm}
        />
      ))}
    </>
  )
}

export default function DestinationsAdminPage() {
  const [treeData, setTreeData] = useState<TreeNode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [modalType, setModalType] = useState<NodeType>('destination')
  const [modalParentNode, setModalParentNode] = useState<TreeNode | null>(null)
  const [modalNodeToEdit, setModalNodeToEdit] = useState<TreeNode | null>(null)
  const [modalName, setModalName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const data = await tourService.getMetadata()
      
      const categories: Category[] = data.categories || []
      const regions: Region[] = data.regions || []
      const countries: Country[] = data.countries || []
      const destinations: Destination[] = data.destinations || []
      const landmarks: any[] = data.landmarks || []

      // Build Tree
      const tree: TreeNode[] = categories.map(cat => {
        const isInternational = cat.name.toLowerCase().includes('quốc tế') || cat.name.toLowerCase().includes('ngoài nước')
        
        return {
          uid: `cat-${cat.id}`,
          id: cat.id,
          name: cat.name,
          type: 'category',
          categoryId: cat.id,
          isInternational,
          children: regions.filter(r => r.category_id === cat.id).map(reg => {
            return {
              uid: `reg-${reg.id}`,
              id: reg.id,
              name: reg.name,
              type: 'region',
              categoryId: cat.id,
              regionId: reg.id,
              isInternational,
              children: isInternational 
                ? countries.filter(c => c.region_id === reg.id).map(country => ({
                    uid: `country-${country.id}`,
                    id: country.id,
                    name: country.name,
                    type: 'country',
                    categoryId: cat.id,
                    regionId: reg.id,
                    countryId: country.id,
                    isInternational,
                    children: destinations.filter(d => d.country_id === country.id).map(dest => ({
                      uid: `dest-${dest.id}`,
                      id: dest.id,
                      name: dest.name,
                      type: 'destination',
                      categoryId: cat.id,
                      regionId: reg.id,
                      countryId: country.id,
                      isInternational,
                      children: landmarks.filter(l => l.destination_id === dest.id).map(land => ({
                        uid: `land-${land.id}`,
                        id: land.id,
                        name: land.name,
                        type: 'landmark',
                        categoryId: cat.id,
                        regionId: reg.id,
                        countryId: country.id,
                        destinationId: dest.id,
                        isInternational,
                        children: []
                      }))
                    }))
                  }))
                : destinations.filter(d => d.region_id === reg.id && !d.country_id).map(dest => ({
                    uid: `dest-${dest.id}`,
                    id: dest.id,
                    name: dest.name,
                    type: 'destination',
                    categoryId: cat.id,
                    regionId: reg.id,
                    isInternational,
                    children: landmarks.filter(l => l.destination_id === dest.id).map(land => ({
                        uid: `land-${land.id}`,
                        id: land.id,
                        name: land.name,
                        type: 'landmark',
                        categoryId: cat.id,
                        regionId: reg.id,
                        destinationId: dest.id,
                        isInternational,
                        children: []
                    }))
                  }))
            }
          })
        }
      })

      setTreeData(tree)
    } catch (error) {
      console.error("Failed to load metadata", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAdd = (type: NodeType, parentNode: TreeNode) => {
    setModalMode('add')
    setModalType(type)
    setModalParentNode(parentNode)
    setModalName('')
    setIsModalOpen(true)
  }

  const handleEdit = (node: TreeNode) => {
    setModalMode('edit')
    setModalType(node.type)
    setModalNodeToEdit(node)
    setModalName(node.name)
    setIsModalOpen(true)
  }

  const handleDelete = async (node: TreeNode) => {
    if (node.children && node.children.length > 0) {
      let childTypeLabel = 'mục con';
      if (node.children[0].type === 'country') childTypeLabel = 'quốc gia';
      else if (node.children[0].type === 'destination') childTypeLabel = 'điểm đến';
      else if (node.children[0].type === 'landmark') childTypeLabel = 'địa danh';
      alert(`Không thể xóa vì mục này đang chứa các ${childTypeLabel} bên trong. Vui lòng xóa chúng trước.`)
      return
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa ${getTypeLabel(node.type)} "${node.name}"?`)) return
    
    try {
      let endpoint = ''
      if (node.type === 'region') endpoint = `/admin/regions/${node.id}`
      else if (node.type === 'country') endpoint = `/admin/countries/${node.id}`
      else if (node.type === 'destination') endpoint = `/admin/destinations/${node.id}`
      else if (node.type === 'landmark') endpoint = `/admin/landmarks/${node.id}`
      
      await tourService.deleteMetadata(endpoint)
      loadData()
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra khi xóa!')
    }
  }

  const submitModal = async () => {
    if (!modalName.trim()) {
      alert('Vui lòng nhập tên!')
      return
    }

    setIsSaving(true)
    try {
      let endpoint = ''
      let payload: any = { name: modalName.trim() }

      if (modalType === 'region') {
        endpoint = '/admin/regions'
        payload.category_id = modalMode === 'add' ? modalParentNode?.id : modalNodeToEdit?.categoryId
      } else if (modalType === 'country') {
        endpoint = '/admin/countries'
        payload.region_id = modalMode === 'add' ? modalParentNode?.id : modalNodeToEdit?.regionId
      } else if (modalType === 'destination') {
        endpoint = '/admin/destinations'
        if (modalMode === 'add') {
           payload.region_id = modalParentNode?.regionId || modalParentNode?.id || null
           payload.country_id = modalParentNode?.type === 'country' ? modalParentNode.id : null
        } else {
           payload.region_id = modalNodeToEdit?.regionId || null
           payload.country_id = modalNodeToEdit?.countryId || null
        }
      } else if (modalType === 'landmark') {
        endpoint = '/admin/landmarks'
        if (modalMode === 'add') {
           payload.destination_id = modalParentNode?.id || null
        } else {
           payload.destination_id = modalNodeToEdit?.destinationId || null
        }
      }

      if (modalMode === 'edit') {
        await tourService.updateMetadata(endpoint, modalNodeToEdit?.id || 0, payload)
      } else {
        await tourService.createMetadata(endpoint, payload)
      }
      
      setIsModalOpen(false)
      loadData()
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra!')
    } finally {
      setIsSaving(false)
    }
  }

  const getTypeLabel = (type: NodeType) => {
    switch (type) {
      case 'category': return 'Phân loại'
      case 'region': return 'Vùng miền'
      case 'country': return 'Quốc gia'
      case 'destination': return 'Điểm đến'
      case 'landmark': return 'Địa danh (Cấp 4)'
    }
  }

  const filterTree = (nodes: TreeNode[], term: string): TreeNode[] => {
    if (!term) return nodes
    const lowerTerm = term.toLowerCase()
    
    return nodes.reduce<TreeNode[]>((acc, node) => {
      const isMatch = node.name.toLowerCase().includes(lowerTerm)
      const filteredChildren = filterTree(node.children, term)
      
      if (isMatch || filteredChildren.length > 0) {
        acc.push({
          ...node,
          children: isMatch ? node.children : filteredChildren
        })
      }
      return acc
    }, [])
  }

  const filteredTreeData = filterTree(treeData, searchTerm)

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
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-500" /> Quản lý Khu vực & Điểm đến
          </h1>
          <p className="text-sm text-slate-400 mt-1">Quản lý phân cấp địa lý (Phân loại {'>'} Vùng miền {'>'} Quốc gia {'>'} Điểm đến)</p>
        </div>
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Tìm kiếm khu vực, điểm đến..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1e293b] border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="bg-[#1e293b] rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-[#0f172a]/50">
              <tr>
                <th className="px-6 py-4 font-semibold">Tên Khu Vực / Điểm Đến</th>
                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredTreeData.map(node => (
                <TreeRow 
                  key={node.uid} 
                  node={node} 
                  onAdd={handleAdd}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  searchTerm={searchTerm}
                />
              ))}
              {filteredTreeData.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-slate-500">
                    Chưa có dữ liệu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">
              {modalMode === 'add' 
                ? `Thêm ${getTypeLabel(modalType)} (vào ${modalParentNode?.name})`
                : `Sửa ${getTypeLabel(modalType)}`}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Tên {getTypeLabel(modalType)}</label>
                <input 
                  type="text"
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Nhập tên..."
                  autoFocus
                />
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={submitModal}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50"
                >
                  {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Check className="w-4 h-4" />}
                  Lưu lại
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
