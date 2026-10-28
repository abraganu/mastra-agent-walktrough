// Lesson 07 subject: RAG — answering from documents the model has never seen.
// Guide: docs/learn/07-rag/README.md
//
// The corpus is deliberately fictional: Rill Coffee does not exist, so the
// model cannot answer these questions from memory. Anything the agent gets
// right in this lesson, it got from the vector index — which is the whole
// point of retrieval.
//
// Three short documents, one per topic. Small enough to read in full, long
// enough that chunking does something you can measure. Each one carries a
// `source` and a `topic` so the chunk metadata has something to filter on.
export type HandbookTopic = 'billing' | 'shipping' | 'support';

export type HandbookSource = {
  /** What the agent cites. Trimmed to a filename on purpose: citations should be short. */
  source: string;
  topic: HandbookTopic;
  text: string;
};

export const handbook: HandbookSource[] = [
  {
    source: 'billing.md',
    topic: 'billing',
    text: `Rill Coffee bills on the first of the month for the bag that ships that month.
The Courier plan is 18 EUR a month for one 250 g bag; the Cellar plan is 32 EUR
for two bags, one of them a rotating single origin. Switching plans mid-month
prorates the difference onto the next invoice instead of charging you twice.

You can ask for a refund on any charge within 14 days of the invoice date. After
14 days we stop refunding and credit the amount to your next order instead. We
do not refund gift cards, and we do not refund shipping on orders that already
left the roastery.

Failed payments are retried three times over six days. On the third failure the
subscription pauses rather than cancelling, so the plan and its grandfathered
price survive; resuming from the account page restarts billing on the next
first of the month.`,
  },
  {
    source: 'shipping.md',
    topic: 'shipping',
    text: `We roast on Monday and Thursday mornings and ship the same afternoon, so a
subscription bag reaches most of Europe in two to four business days. Bags are
sealed with a one-way valve and stamped with the roast date; coffee is at its
best between five and twenty days after that date.

If a bag is lost or arrives damaged, we replace it once at no cost, no questions
asked. A second claim on the same address goes to support review, because at
that point we want to look at the carrier rather than the coffee.

Shipping pauses for two weeks over the winter holidays — the last dispatch
before the break is the Monday roast in the second week of December, and
deliveries resume with the first Monday roast in January. Subscriptions are not
billed for the paused weeks.`,
  },
  {
    source: 'support.md',
    topic: 'support',
    text: `Support answers email from 08:00 to 18:00 CET, Monday to Friday, with a
first-reply target of one business day. The account page can change an address,
pause a subscription, and download invoices without a human.

Anything that looks like a billing dispute or a repeated delivery failure goes
to the #rill-escalations channel in Slack, which pages the on-call engineer.
Weekends and public holidays are covered by a volunteer rota: whoever signed up
during Friday's standup takes the pager, and the rota is posted in the channel
on Friday afternoon. Escalations are paged within 15 minutes; if the pager is
not acknowledged in 15 minutes it rolls over to the secondary.

We do not staff a phone line. Press enquiries go to the founders directly and
are not handled by support.`,
  },
];
