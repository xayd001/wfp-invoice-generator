import React from 'react';
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 8, fontFamily: 'Helvetica', color: '#000' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#000', paddingBottom: 6, marginBottom: 10 },
  companyTitle: { fontSize: 12, fontWeight: 'bold' },
  addressBlock: { fontSize: 7, lineHeight: 1.2 },
  logoImage: { width: 70, height: 70, marginBottom: 5 },
  stampImage: { width: 110, height: 50, alignSelf: 'center', marginBottom: 2 },
  table: { width: '100%', borderStyle: 'solid', borderWidth: 1, borderColor: '#000', marginBottom: 10 },
  tableRow: { flexDirection: 'row' },
  tableColHeader: { backgroundColor: '#e5e7eb', borderBottomWidth: 1, borderRightWidth: 1, borderColor: '#000', padding: 3, fontWeight: 'bold', fontSize: 7 },
  tableCol: { borderBottomWidth: 1, borderRightWidth: 1, borderColor: '#000', padding: 3, fontSize: 7 },
  totalBox: { marginTop: 5, padding: 5, borderStyle: 'solid', borderWidth: 1, borderColor: '#000', marginBottom: 10 },
  bankDetails: { fontSize: 7, marginTop: 10 },
  footerSection: { marginTop: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }
});

export const InvoicePDFDocument = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header with Logo */}
      <View style={styles.headerContainer}>
        <View style={{ width: '50%' }}>
          {/* Company Logo rendering */}
          {data.logoUrl ? (
            <Image style={styles.logoImage} src={data.logoUrl} />
          ) : (
            <Image style={styles.logoImage} src="/logo.png" />
          )}
          <Text style={styles.companyTitle}>HOWDAH INVESTMENT NIG. LTD</Text>
          <Text style={styles.addressBlock}>RC: 748463 | Email: howdahinvestment.ng@gmail.com</Text>
          <Text style={styles.addressBlock}>HEAD OFFICE: Synuhu Plastic Store, Gamboru Market, Maiduguri, Borno State</Text>
          <Text style={styles.addressBlock}>CORPORATE ADDRESS: No. 22 Ngeleruma Street, Limanti Ward, Maiduguri, Borno State</Text>
        </View>
        <View style={{ width: '40%', textAlign: 'right' }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold' }}>INVOICE</Text>
          <Text>Vendor Code: {data.vendorCode}</Text>
          <Text>Contract Ref: {data.contractRef}</Text>
          <Text>Invoice Date: {data.invoiceDate}</Text>
          <Text>Invoice Number: {data.invoiceNumber}</Text>
          <Text>PO Number: {data.poNumber}</Text>
        </View>
      </View>

      <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 6 }}>
        To: World Food Programme, Nigeria
      </Text>
      <Text style={{ fontSize: 8, fontStyle: 'italic', marginBottom: 8 }}>
        Invoice Summary: {data.summaryText}
      </Text>

      {/* STO Table */}
      <Text style={{ fontWeight: 'bold', marginBottom: 3 }}>1. STO Summary</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableColHeader, { width: '18%' }]}>STO NO.</Text>
          <Text style={[styles.tableColHeader, { width: '22%' }]}>Description</Text>
          <Text style={[styles.tableColHeader, { width: '15%' }]}>Origin</Text>
          <Text style={[styles.tableColHeader, { width: '15%' }]}>Destination</Text>
          <Text style={[styles.tableColHeader, { width: '15%' }]}>Rate (NGN)</Text>
          <Text style={[styles.tableColHeader, { width: '15%' }]}>
            {data.invoiceType === 'TYPE_2' ? 'Qty / Truck' : 'MT Dispatched'}
          </Text>
        </View>

        {data.stoItems.map((item, idx) => (
          <View style={styles.tableRow} key={idx}>
            <Text style={[styles.tableCol, { width: '18%' }]}>{item.stoNo || '-'}</Text>
            <Text style={[styles.tableCol, { width: '22%' }]}>{item.description || '-'}</Text>
            <Text style={[styles.tableCol, { width: '15%' }]}>{item.origin || '-'}</Text>
            <Text style={[styles.tableCol, { width: '15%' }]}>{item.destination || '-'}</Text>
            <Text style={[styles.tableCol, { width: '15%' }]}>{(parseFloat(item.rate) || 0).toLocaleString()}</Text>
            <Text style={[styles.tableCol, { width: '15%' }]}>{item.qty || 0}</Text>
          </View>
        ))}
      </View>

      {/* Waybill Table */}
      <Text style={{ fontWeight: 'bold', marginBottom: 3 }}>2. Invoice Detail (Waybills)</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableColHeader, { width: '18%' }]}>WB NO.</Text>
          <Text style={[styles.tableColHeader, { width: '22%' }]}>Commodity</Text>
          <Text style={[styles.tableColHeader, { width: '18%' }]}>Destination</Text>
          <Text style={[styles.tableColHeader, { width: '11%' }]}>BAG</Text>
          <Text style={[styles.tableColHeader, { width: '11%' }]}>CAR</Text>
          <Text style={[styles.tableColHeader, { width: '20%' }]}>QTY MT</Text>
        </View>

        {data.waybills.map((wb, idx) => (
          <View style={styles.tableRow} key={idx}>
            <Text style={[styles.tableCol, { width: '18%' }]}>{wb.wbNo || '-'}</Text>
            <Text style={[styles.tableCol, { width: '22%' }]}>{wb.commodity || '-'}</Text>
            <Text style={[styles.tableCol, { width: '18%' }]}>{wb.destination || '-'}</Text>
            <Text style={[styles.tableCol, { width: '11%' }]}>{wb.qtyBag || 0}</Text>
            <Text style={[styles.tableCol, { width: '11%' }]}>{wb.qtyCar || 0}</Text>
            <Text style={[styles.tableCol, { width: '20%' }]}>{wb.qtyMT || 0}</Text>
          </View>
        ))}
      </View>

      {/* Amount in Words */}
      <View style={styles.totalBox}>
        <Text style={{ fontSize: 9, fontWeight: 'bold' }}>
          Payable Amount: NGN {data.grandTotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </Text>
        <Text style={{ fontStyle: 'italic', marginTop: 2 }}>
          Amount in words: {data.amountInWords || 'Zero Naira'}
        </Text>
      </View>

      {/* Bank & Signature Block */}
      <View style={styles.footerSection}>
        <View style={styles.bankDetails}>
          <Text style={{ fontWeight: 'bold' }}>BANK DETAILS:</Text>
          <Text>Account Name: HOWDAH INVESTMENT NIGERIA LIMITED</Text>
          <Text>Account No: 1011980204</Text>
          <Text>Bank Name: ZENITH BANK PLC</Text>
          <Text>Branch / Swift: SIR KASHIM IBRAHIM WAY, MAIDUGURI | ZEIBNGLA</Text>
        </View>

        {/* Signature & Stamp Section */}
        <View style={{ textAlign: 'center', width: '38%' }}>
          {data.stampUrl ? (
            <Image style={styles.stampImage} src={data.stampUrl} />
          ) : (
            <Image style={styles.stampImage} src="/stamp.png" />
          )}
          <Text style={{ borderBottomWidth: 1, borderColor: '#000', marginBottom: 4 }}> </Text>
          <Text style={{ fontSize: 7, fontWeight: 'bold' }}>AUTHORIZED SIGNATURE & STAMP</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export const DownloadPDFButton = ({ formData }) => (
  <PDFDownloadLink
    document={<InvoicePDFDocument data={formData} />}
    fileName={`Invoice_${formData.invoiceNumber || 'Draft'}.pdf`}
    className="inline-block px-6 py-2.5 bg-green-600 text-white font-semibold rounded shadow hover:bg-green-700 transition-colors"
  >
    {({ loading }) => (loading ? 'Preparing Document...' : 'Download Official PDF')}
  </PDFDownloadLink>
);