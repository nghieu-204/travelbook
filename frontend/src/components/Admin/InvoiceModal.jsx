import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function InvoiceModal({ selectedInvoice, setSelectedInvoice, onSendInvoice }) {
    const [isSending, setIsSending] = useState(false);
    const [showToast, setShowToast] = useState(false);

    if (!selectedInvoice) return null;

    const exportInvoicePDF = () => {
        const input = document.getElementById('invoice-preview-box');
        if (!input) return;
        html2canvas(input, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`SkyTravel_Invoice_SKY-${selectedInvoice.id}.pdf`);
        });
    };

    const handleSend = async () => {
        if (!onSendInvoice) return;
        setIsSending(true);
        await onSendInvoice(selectedInvoice.id);
        setIsSending(false);
        
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', padding: '24px', position: 'relative' }}>
                
                {showToast && (
                    <div style={{ position: 'absolute', top: '24px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: 'white', padding: '10px 20px', borderRadius: '30px', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 12px rgba(16,185,129,0.4)', animation: 'fadeInDown 0.3s', zIndex: 1200, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        ✅ Đã gửi hóa đơn qua Email thành công!
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '20px' }}>📧</span>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>
                            Xem Hóa Đơn - #SKY-{selectedInvoice.id}
                        </h3>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={handleSend}
                            disabled={isSending}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '8px 16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', background: isSending ? '#94a3b8' : '#10b981', border: 'none', color: 'white', borderRadius: '8px', cursor: isSending ? 'not-allowed' : 'pointer' }}
                        >
                            {isSending ? (
                                <>
                                    <div style={{ width: '14px', height: '14px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                    Đang gửi...
                                </>
                            ) : (
                                <>✉️ Gửi Khách Hàng</>
                            )}
                        </button>

                        <button
                            onClick={exportInvoicePDF}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '8px 16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            🖨️ In PDF
                        </button>
                        <button
                            onClick={() => setSelectedInvoice(null)}
                            style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* HTML Invoice preview exact render */}
                <div id="invoice-preview-box">
                    <div dangerouslySetInnerHTML={{ __html: selectedInvoice.html }} />
                </div>
            </div>

            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes fadeInDown { from { opacity: 0; transform: translate(-50%, -10px); } to { opacity: 1; transform: translate(-50%, 0); } }
            `}</style>
        </div>
    );
}
