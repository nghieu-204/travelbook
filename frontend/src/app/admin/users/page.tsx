/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect, @next/next/no-img-element */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { MoreVertical, Shield, User as UserIcon, Loader2, Key, Search, ChevronLeft, ChevronRight, UserPlus, Filter, Mail } from 'lucide-react'
import { userService } from '@/services/userService'
import { getImageUrl } from '@/lib/utils'
import { useDebounce } from 'use-debounce'
import Link from 'next/link'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'
import { USER_STATUS, USER_ROLE } from '@/constants/status'
import { toast } from 'react-hot-toast'
import { useConfirm } from '@/providers/ConfirmProvider'

// Component xử lý ảnh đại diện có fallback
const AvatarFallback = ({ user }: { user: any }) => {
  const [hasError, setHasError] = useState(false);

  if (!user.avatar || hasError) {
    return (
      <img 
        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'A')}&background=random`}
        alt="Avatar" 
        className="w-10 h-10 rounded-full object-cover"
      />
    );
  }

  return (
    <img 
      src={getImageUrl(user.avatar)} 
      alt={user.name} 
      className="w-10 h-10 rounded-full object-cover" 
      onError={() => setHasError(true)}
    />
  );
};

export default function AdminUsers() {
  const { user: currentUser } = useAdminAuthStore()
  const { confirm } = useConfirm()
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalUsers, setTotalUsers] = useState(0)
  
  // Pagination
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch] = useDebounce(searchTerm, 500)
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // UI state
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      let url = `/admin/users?page=${page}&limit=${limit}`
      if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`
      if (roleFilter) url += `&role=${roleFilter}`
      if (statusFilter) url += `&status=${statusFilter}`

      const response = await userService.getUsers(url)
      setUsers(response.data || [])
      setTotalUsers(response.total || 0)
      setTotalPages(response.totalPages || 1)
    } catch (error) {
      console.error("Lỗi tải danh sách người dùng:", error)
    } finally {
      setIsLoading(false)
    }
  }, [page, limit, debouncedSearch, roleFilter, statusFilter])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, roleFilter, statusFilter, limit])

  const handleStatusChange = async (id: number, currentStatus: string) => {
    if (Number(currentUser?.id) === Number(id)) {
      toast.error("Bạn không thể tự khóa tài khoản của chính mình!");
      return;
    }
    const isConfirmed = await confirm({
      title: "Khóa tài khoản",
      description: `Bạn có chắc chắn muốn ${currentStatus === USER_STATUS.ACTIVE || !currentStatus ? 'khóa' : 'mở khóa'} người dùng này?`,
      type: "warning"
    });
    if (!isConfirmed) return;
    try {
      const newStatus = currentStatus === USER_STATUS.ACTIVE || !currentStatus ? USER_STATUS.BANNED : USER_STATUS.ACTIVE;
      await userService.updateUserStatus(id, newStatus)
      setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u))
      toast.success('Cập nhật trạng thái thành công')
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  }

  const handleResetPassword = async (id: number) => {
    const isConfirmed = await confirm({
      title: "Khôi phục mật khẩu",
      description: "Bạn có chắc chắn muốn gửi link đặt lại mật khẩu cho người dùng này?",
      type: "warning"
    });
    if (!isConfirmed) return;
    try {
      const res = await userService.resetUserPassword(id)
      toast.success(res.message || 'Đã gửi link đặt lại mật khẩu qua email cho người dùng này.');
      setActiveDropdown(null);
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  }

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    // Prevent self-demotion or self-ban
    if (Number(editingUser.id) === Number(currentUser?.id)) {
      if (editingUser.role !== USER_ROLE.ADMIN) {
        toast.error("Bạn không thể tự hạ quyền của chính mình!");
        return;
      }
      if (editingUser.status !== USER_STATUS.ACTIVE) {
        toast.error("Bạn không thể tự khóa tài khoản của chính mình!");
        return;
      }
    }

    try {
      setIsSaving(true);
      await userService.updateUser(editingUser.id, {
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone,
        address: editingUser.address,
        role: editingUser.role,
        status: editingUser.status
      })
      toast.success('Cập nhật người dùng thành công!');
      setEditingUser(null);
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi cập nhật người dùng');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Quản lý Người dùng</h1>
          <p className="text-slate-400">Xem danh sách, phân quyền và trạng thái tài khoản.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
          <UserPlus className="w-5 h-5" />
          <span>Thêm người dùng</span>
        </button>
      </div>

      {/* Top Bar: Search & Filters */}
      <div className="bg-[#1e293b] p-4 rounded-t-2xl border border-b-0 border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Tìm theo tên, email, SĐT..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0f172a] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0f172a] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 appearance-none transition-colors"
            >
              <option value="">Tất cả Vai trò</option>
              <option value={USER_ROLE.USER}>Khách hàng</option>
              <option value={USER_ROLE.ADMIN}>Admin</option>
            </select>
          </div>
          <div className="relative flex-1 md:w-48">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-[#0f172a] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 appearance-none transition-colors"
            >
              <option value="">Tất cả Trạng thái</option>
              <option value={USER_STATUS.ACTIVE}>Hoạt động</option>
              <option value={USER_STATUS.BANNED}>Bị khóa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#1e293b] rounded-b-2xl border border-slate-800 overflow-visible relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#0f172a] text-slate-400 text-sm border-b border-slate-800">
                <th className="p-4 font-semibold w-24">ID</th>
                <th className="p-4 font-semibold">Người dùng</th>
                <th className="p-4 font-semibold">Vai trò</th>
                <th className="p-4 font-semibold">Ngày đăng ký</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="p-4 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    Không tìm thấy người dùng nào phù hợp.
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="border-b border-slate-800/50 hover:bg-[#0f172a]/50 transition-colors">
                    <td className="p-4 text-slate-500 font-mono text-sm">#{user.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 overflow-hidden shrink-0 border border-slate-700">
                          <AvatarFallback user={user} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-100">{user.name}</div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                            <Mail className="w-3.5 h-3.5 text-slate-500/70" />
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${user.role === USER_ROLE.ADMIN ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                        {user.role === USER_ROLE.ADMIN ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-sm">
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleStatusChange(user.id, user.status)}
                        disabled={Number(currentUser?.id) === Number(user.id)}
                        className={`group relative inline-flex items-center justify-center ${Number(currentUser?.id) === Number(user.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={Number(currentUser?.id) === Number(user.id) ? 'Không thể tự khóa' : user.status === USER_STATUS.ACTIVE || !user.status ? 'Nhấn để khóa tài khoản' : 'Nhấn để mở khóa'}
                      >
                        <span className={`relative z-10 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          user.status === USER_STATUS.ACTIVE || !user.status
                            ? 'bg-emerald-500/10 text-emerald-500 group-hover:bg-red-500/20 group-hover:text-red-500' 
                            : 'bg-red-500/10 text-red-500 group-hover:bg-emerald-500/20 group-hover:text-emerald-500'
                        }`}>
                          {user.status === USER_STATUS.ACTIVE || !user.status ? 'Active' : 'Banned'}
                        </span>
                      </button>
                    </td>
                    <td className="p-4 text-right relative">
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      
                      {activeDropdown === user.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)}></div>
                          <div className="absolute right-8 top-12 w-48 bg-white rounded-lg shadow-xl z-50 border border-slate-200 overflow-hidden py-1">
                            <Link 
                              href={`/admin/users/${user.id}`}
                              className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                              Xem chi tiết
                            </Link>
                            <button 
                              onClick={() => { setEditingUser(user); setActiveDropdown(null); }}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                              Chỉnh sửa
                            </button>
                            {user.auth_provider === 'local' && (
                              <button 
                                onClick={() => handleResetPassword(user.id)}
                                className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 transition-colors flex items-center justify-between"
                              >
                                <span>Reset mật khẩu</span>
                                <Key className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-[#0f172a] rounded-b-2xl">
          <div className="text-sm text-slate-500">
            Hiển thị <span className="font-bold text-white">{totalUsers === 0 ? 0 : (page - 1) * limit + 1}</span> - <span className="font-bold text-white">{Math.min(page * limit, totalUsers)}</span> trong tổng số <span className="font-bold text-white">{totalUsers}</span> người dùng
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="bg-[#1e293b] border border-slate-700 text-slate-300 text-sm rounded-lg px-2 py-1 outline-none mr-4"
            >
              <option value={10}>10 dòng / trang</option>
              <option value={20}>20 dòng / trang</option>
              <option value={50}>50 dòng / trang</option>
            </select>
            
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded bg-[#1e293b] text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-slate-300 px-2">
              {page} / {totalPages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="p-1 rounded bg-[#1e293b] text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Chỉnh sửa người dùng #{editingUser.id}</h2>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email (Định danh)</label>
                <input 
                  type="email" 
                  value={editingUser.email || ''} 
                  disabled
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên</label>
                <input 
                  type="text" 
                  value={editingUser.name || ''} 
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  disabled
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none bg-slate-100 text-slate-500 cursor-not-allowed"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
                <input 
                  type="text" 
                  value={editingUser.phone || ''} 
                  onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                  disabled
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ</label>
                <input 
                  type="text" 
                  value={editingUser.address || ''} 
                  onChange={(e) => setEditingUser({...editingUser, address: e.target.value})}
                  disabled
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vai trò</label>
                <select 
                  value={editingUser.role || USER_ROLE.USER} 
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                  disabled={Number(editingUser.id) === Number(currentUser?.id) || editingUser.auth_provider !== 'local'}
                  className={`w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 text-slate-800 ${(Number(editingUser.id) === Number(currentUser?.id) || editingUser.auth_provider !== 'local') ? 'bg-slate-100 cursor-not-allowed text-slate-500' : 'bg-white'}`}
                >
                  <option value={USER_ROLE.USER}>User</option>
                  <option value={USER_ROLE.ADMIN} disabled={editingUser.auth_provider !== 'local'}>Admin</option>
                </select>
                {Number(editingUser.id) === Number(currentUser?.id) && <p className="text-xs text-amber-600 mt-1">Không thể thay đổi quyền của chính mình.</p>}
                {editingUser.auth_provider !== 'local' && <p className="text-xs text-amber-600 mt-1">Tài khoản liên kết (Google/Facebook) không thể được cấp quyền Admin.</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
                <select 
                  value={editingUser.status || USER_STATUS.ACTIVE} 
                  onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}
                  disabled={Number(editingUser.id) === Number(currentUser?.id)}
                  className={`w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 text-slate-800 ${Number(editingUser.id) === Number(currentUser?.id) ? 'bg-slate-100 cursor-not-allowed text-slate-500' : 'bg-white'}`}
                >
                  <option value={USER_STATUS.ACTIVE}>Hoạt động</option>
                  <option value={USER_STATUS.BANNED}>Bị khóa</option>
                </select>
                {Number(editingUser.id) === Number(currentUser?.id) && <p className="text-xs text-amber-600 mt-1">Không thể đổi trạng thái của chính mình.</p>}
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
