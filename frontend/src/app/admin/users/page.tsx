import { MoreVertical, Shield, User as UserIcon } from 'lucide-react'

const mockUsers = [
  { id: 'US001', name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', role: 'Khách hàng', status: 'Hoạt động', joinDate: '10/01/2026' },
  { id: 'US002', name: 'Trần Thị B', email: 'tranthib@gmail.com', role: 'Khách hàng', status: 'Hoạt động', joinDate: '15/02/2026' },
  { id: 'US003', name: 'Quản trị viên', email: 'admin@travelbooking.com', role: 'Admin', status: 'Hoạt động', joinDate: '01/01/2026' },
  { id: 'US004', name: 'Lê Văn C', email: 'levanc@gmail.com', role: 'Khách hàng', status: 'Bị khóa', joinDate: '20/03/2026' },
]

export default function AdminUsers() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Quản lý Người dùng</h1>
        <p className="text-slate-400">Xem danh sách, phân quyền và trạng thái tài khoản.</p>
      </div>

      <div className="bg-[#1e293b] rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0f172a] text-slate-400 text-sm border-b border-slate-800">
              <th className="p-4 font-semibold">Tài khoản</th>
              <th className="p-4 font-semibold">Vai trò</th>
              <th className="p-4 font-semibold">Ngày tham gia</th>
              <th className="p-4 font-semibold">Trạng thái</th>
              <th className="p-4 font-semibold text-right">Tùy chọn</th>
            </tr>
          </thead>
          <tbody className="text-slate-300">
            {mockUsers.map(user => (
              <tr key={user.id} className="border-b border-slate-800/50 hover:bg-[#0f172a]/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                      {user.role === 'Admin' ? <Shield className="w-5 h-5 text-emerald-500" /> : <UserIcon className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="font-medium text-white">{user.name}</div>
                      <div className="text-sm text-slate-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'Admin' ? 'bg-purple-500/20 text-purple-500' : 'bg-slate-800 text-slate-400'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-slate-400">{user.joinDate}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    user.status === 'Hoạt động' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="p-2 text-slate-500 hover:text-white transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
