/**
 * SANGAM — Invoice Engine (IN-1, IN-2)
 * Generates structured, compliant invoices for learner purchases.
 */

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface InvoiceData {
  invoiceNumber: string
  date: string
  dueDate: string
  transactionReference: string
  learnerName: string
  learnerEmail: string
  packageName: string
  currency: string
  subtotal: number
  taxAmount: number
  taxRatePercent: number
  totalAmount: number
  status: 'PAID' | 'PENDING' | 'REFUNDED'
  companyDetails: {
    name: string
    address: string
    taxId: string
    email: string
  }
  items: InvoiceItem[]
}

export function generateInvoiceData(params: {
  invoiceNumber: string
  transactionReference: string
  learnerName: string
  learnerEmail: string
  packageName: string
  amount: number
  currency?: string
  paymentStatus?: string
  createdAt?: string
}): InvoiceData {
  const {
    invoiceNumber,
    transactionReference,
    learnerName,
    learnerEmail,
    packageName,
    amount,
    currency = 'USD',
    paymentStatus = 'paid',
    createdAt = new Date().toISOString(),
  } = params

  const subtotal = amount
  const taxRatePercent = 0 // 0% educational / digital service exemption
  const taxAmount = (subtotal * taxRatePercent) / 100
  const totalAmount = subtotal + taxAmount

  return {
    invoiceNumber,
    date: new Date(createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    dueDate: new Date(createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    transactionReference,
    learnerName,
    learnerEmail,
    packageName,
    currency,
    subtotal,
    taxRatePercent,
    taxAmount,
    totalAmount,
    status: paymentStatus.toUpperCase() === 'PAID' ? 'PAID' : 'PENDING',
    companyDetails: {
      name: 'SANGAM Security Architecture Learning Platform',
      address: 'CloudWire Technologies Inc., Security Operations Division',
      taxId: 'US-EIN-94-2849102',
      email: 'billing@sangam.internal',
    },
    items: [
      {
        description: `SANGAM ${packageName.toUpperCase()} Learning Package Access (Curriculum, Quizzes & Lab Scenarios)`,
        quantity: 1,
        unitPrice: amount,
        total: amount,
      },
    ],
  }
}
