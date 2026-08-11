import { DownloadPDFButton } from './InvoicePDF';
import React, { useState, useEffect } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { InvoicePDFDocument } from './InvoicePDF';

const INITIAL_STATE = {
  invoiceType: 'TYPE_1', 
  vendorCode: '50073304',
  contractRef: 'RFQ/LOG/NGN/002/2019',
  invoiceDate: new Date().toISOString().split('T')[0],
  invoiceNumber: '',
  poNumber: '',
  summaryText: 'Transport and Handling',
  
  stoItems: [
    { stoNo: '', description: 'Transport', origin: 'Kano', destination: '', rate: 0, qty: 0 }
  ],
  
  waybills: [
    { wbNo: '', commodity: '', destination: '', packageType: 'Bag', qtyBag: 0, qtyCar: 0, qtyMT: 0, rate: 0, amount: 0 }
  ],

  grandTotal: 0,
  amountInWords: ''
};

export default function InvoiceForm() {
  // Retrieve draft from localStorage on initial render
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('wfp_invoice_draft');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });

  // Save current form state to localStorage on every change
  useEffect(() => {
    localStorage.setItem('wfp_invoice_draft', JSON.stringify(formData));
  }, [formData]);

  // Recalculate totals on backend request without infinite re-render loops
  useEffect(() => {
    let isMounted = true;
    
    const calculateTotals = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        
        if (isMounted) {
          setFormData((prev) => {
            if (prev.grandTotal === data.grandTotal && prev.amountInWords === data.amountInWords) {
              return prev;
            }
            return {
              ...prev,
              grandTotal: data.grandTotal,
              amountInWords: data.amountInWords,
            };
          });
        }
      } catch (err) {
        console.error("Calculation error:", err);
      }
    };

    calculateTotals();

    return () => {
      isMounted = false;
    };
  }, [formData.stoItems, formData.waybills, formData.invoiceType]);
  const handleTypeChange = (e) => {
    const type = e.target.value;
    setFormData((prev) => ({
      ...prev,
      invoiceType: type,
      stoItems: type === 'TYPE_2' 
        ? [
            { stoNo: '', description: 'Transport', origin: 'Kano', destination: "N'djamena", rate: 0, qty: 0 },
            { stoNo: '', description: 'Custom clearance and Documentation', origin: 'Kano', destination: "N'djamena", rate: 0, qty: 1 },
            { stoNo: '', description: 'Escort Services', origin: 'Kano', destination: "N'djamena", rate: 0, qty: 1 }
          ]
        : [{ stoNo: '', description: 'Transport', origin: '', destination: '', rate: 0, qty: 0 }]
    }));
  };

  const handleSTOChange = (index, field, value) => {
    const updated = [...formData.stoItems];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, stoItems: updated }));
  };

 const handleWBChange = (index, field, value) => {
    const updated = [...formData.waybills];
    updated[index][field] = value;

    // Automatically sum BAG Qty and CAR Qty into QTY MT for all invoice types
    const bag = parseFloat(updated[index].qtyBag) || 0;
    const car = parseFloat(updated[index].qtyCar) || 0;
    
    // Only auto-override qtyMT if bag or car quantities are present
    if (bag > 0 || car > 0) {
      updated[index].qtyMT = bag + car;
    }

    setFormData((prev) => ({ ...prev, waybills: updated }));
  };

  const addSTORow = () => {
    setFormData((prev) => ({
      ...prev,
      stoItems: [...prev.stoItems, { stoNo: '', description: 'Transport', origin: '', destination: '', rate: 0, qty: 0 }]
    }));
  };

  const addWBRow = () => {
    setFormData((prev) => ({
      ...prev,
      waybills: [...prev.waybills, { wbNo: '', commodity: '', destination: '', packageType: 'Bag', qtyBag: 0, qtyCar: 0, qtyMT: 0, rate: 0 }]
    }));
  };
const handleReset = () => {
  if (window.confirm("Are you sure you want to clear this draft and start a new invoice?")) {
    localStorage.removeItem('wfp_invoice_draft');
    setFormData(INITIAL_STATE);
  }
};
  return (
    <div className="p-8 max-w-5xl mx-auto bg-white rounded-lg shadow-md my-6 border border-gray-200">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">WFP Automated Invoice Generator</h1>
      
      {/* Invoice Type Selection */}
      <div className="mb-6 bg-blue-50 p-4 rounded-md border border-blue-200">
        <label className="block text-sm font-bold text-blue-900 mb-2">Select Invoice Template Variant:</label>
        <select 
          value={formData.invoiceType} 
          onChange={handleTypeChange}
          className="w-full p-2.5 bg-white border border-blue-300 rounded font-medium"
        >
          <option value="TYPE_1">Type 1: Standard Route (e.g. Kano to Sokoto)</option>
          <option value="TYPE_2">Type 2: Cross-Border & Multi-Service (Customs, Escorts, Flat Rates)</option>
          <option value="TYPE_3">Type 3: Split Itemized Packaging (Bags / Cartons Breakdown)</option>
        </select>
      </div>

      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Invoice Number</label>
          <input 
            type="text" 
            value={formData.invoiceNumber} 
            onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
            className="w-full p-2 border rounded"
            placeholder="e.g. 0782B"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">PO Number</label>
          <input 
            type="text" 
            value={formData.poNumber} 
            onChange={(e) => setFormData({...formData, poNumber: e.target.value})}
            className="w-full p-2 border rounded"
            placeholder="e.g. 4700803425"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Invoice Date</label>
          <input 
            type="date" 
            value={formData.invoiceDate} 
            onChange={(e) => setFormData({...formData, invoiceDate: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      {/* STO Line Items */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">1. STO Invoice Summary</h2>
        {formData.stoItems.map((item, idx) => (
          <div key={idx} className="grid grid-cols-6 gap-2 mb-2 items-center">
            <input placeholder="STO NO." value={item.stoNo} onChange={(e) => handleSTOChange(idx, 'stoNo', e.target.value)} className="p-2 border rounded text-sm" />
            <input placeholder="Description" value={item.description} onChange={(e) => handleSTOChange(idx, 'description', e.target.value)} className="p-2 border rounded text-sm" />
            <input placeholder="Origin" value={item.origin} onChange={(e) => handleSTOChange(idx, 'origin', e.target.value)} className="p-2 border rounded text-sm" />
            <input placeholder="Destination" value={item.destination} onChange={(e) => handleSTOChange(idx, 'destination', e.target.value)} className="p-2 border rounded text-sm" />
            <input type="number" placeholder="Rate (NGN)" value={item.rate || ''} onChange={(e) => handleSTOChange(idx, 'rate', e.target.value)} className="p-2 border rounded text-sm" />
            <input type="number" placeholder={formData.invoiceType === 'TYPE_2' ? "Qty / Truck" : "MT Dispatched"} value={item.qty || ''} onChange={(e) => handleSTOChange(idx, 'qty', e.target.value)} className="p-2 border rounded text-sm" />
          </div>
        ))}
        <button onClick={addSTORow} className="text-sm text-blue-600 hover:underline mt-1 font-medium">+ Add STO Row</button>
      </div>

      {/* Waybill Detail */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">2. Waybill Invoice Detail</h2>
        {formData.waybills.map((wb, idx) => (
          <div key={idx} className="grid grid-cols-6 gap-2 mb-2 items-center">
            <input placeholder="WB NO." value={wb.wbNo} onChange={(e) => handleWBChange(idx, 'wbNo', e.target.value)} className="p-2 border rounded text-sm" />
            <input placeholder="Commodity" value={wb.commodity} onChange={(e) => handleWBChange(idx, 'commodity', e.target.value)} className="p-2 border rounded text-sm" />
            <input placeholder="Destination" value={wb.destination} onChange={(e) => handleWBChange(idx, 'destination', e.target.value)} className="p-2 border rounded text-sm" />
            {formData.invoiceType === 'TYPE_3' ? (
              <>
                <input type="number" placeholder="BAG Qty" value={wb.qtyBag || ''} onChange={(e) => handleWBChange(idx, 'qtyBag', e.target.value)} className="p-2 border rounded text-sm" />
                <input type="number" placeholder="CAR Qty" value={wb.qtyCar || ''} onChange={(e) => handleWBChange(idx, 'qtyCar', e.target.value)} className="p-2 border rounded text-sm" />
              </>
            ) : (
              <input placeholder="Package Type" value={wb.packageType} onChange={(e) => handleWBChange(idx, 'packageType', e.target.value)} className="p-2 border rounded text-sm" />
            )}
            <input type="number" placeholder="QTY MT" value={wb.qtyMT || ''} onChange={(e) => handleWBChange(idx, 'qtyMT', e.target.value)} className="p-2 border rounded text-sm" />
          </div>
        ))}
        <button onClick={addWBRow} className="text-sm text-blue-600 hover:underline mt-1 font-medium">+ Add Waybill Row</button>
      </div>

      {/* Summary Box */}
      <div className="p-4 bg-gray-100 rounded border border-gray-300">
        <div className="text-xl font-bold text-gray-900">
          Payable Amount: NGN {formData.grandTotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </div>
        <div className="text-sm text-gray-700 italic mt-1">
          <span className="font-semibold">Amount in Words: </span>{formData.amountInWords || 'Zero Naira'}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-end">
        <DownloadPDFButton formData={formData} />
      </div>

      {/* Live Document Preview */}
      <div className="mt-8 border-t border-gray-200 pt-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Live Document Preview</h3>
        <PDFViewer className="w-full h-[650px] border border-gray-300 rounded-lg shadow-inner">
          <InvoicePDFDocument data={formData} />
        </PDFViewer>
      </div>
      {/* Action Buttons */}
<div className="mt-6 flex justify-between items-center">
  <button 
    onClick={handleReset}
    className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded hover:bg-gray-300 transition-colors"
  >
    Reset Form / Clear Draft
  </button>
  <DownloadPDFButton formData={formData} />
</div>

    </div>

  );
}