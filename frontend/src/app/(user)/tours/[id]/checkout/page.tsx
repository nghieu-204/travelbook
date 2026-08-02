/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { fetchApi } from '@/lib/api'
import CheckoutClient from './CheckoutClient'
import Link from 'next/link'

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  let tour: any = null;
  try {
    const response = await fetch(`${process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8902/api'}/tours/${resolvedParams.id}`, { cache: 'no-store' });
    if (response.ok) {
      tour = await response.json();
    }
  } catch (error) {
    console.error("Lỗi lấy thông tin tour:", error);
  }

  if (!tour) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-slate-50 min-h-screen">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Tour không tồn tại</h1>
        <Link href="/tours" className="text-blue-600 font-medium hover:underline">Quay lại danh sách tour</Link>
      </div>
    )
  }

  return <CheckoutClient tour={tour} />
}
