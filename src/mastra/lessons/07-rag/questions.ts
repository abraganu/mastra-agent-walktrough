// Fixed retrieval expectations, not model-generated ground truth.
export const questions = [
  { question: 'What is the refund window?', sources: ['billing.md'], contains: '14 days' },
  { question: 'What happens when a bag arrives damaged?', sources: ['shipping.md'], contains: 'replace' },
  { question: 'Can I call support by phone?', sources: ['support.md'], contains: 'phone line' },
  { question: 'Can a damaged bag be refunded instead of replaced?', sources: ['shipping.md', 'billing.md'], contains: null },
  { question: 'Do you sell tea?', sources: [], contains: null },
] as const;
