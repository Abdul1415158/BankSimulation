import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is BANKVERSE?",
    answer:
      "BANKVERSE is a commercial banking management simulation platform where you create and operate your own virtual bank. You make real financial decisions — setting interest rates, approving loans, managing employees and AI agents, responding to crises — and see how they affect your bank's performance over simulated quarters and years.",
  },
  {
    question: "Is this a real banking application?",
    answer:
      "No. BANKVERSE is an educational simulation designed to teach commercial banking concepts. No real money is involved, and no real banking operations take place. It's designed for university students, finance professionals, and anyone interested in understanding how banks work.",
  },
  {
    question: "How does the AI vs Human workforce work?",
    answer:
      "When a position becomes vacant (through resignation or new department needs), you choose between hiring a human employee or deploying an AI agent. Humans cost more in salary but offer better judgment, customer relationships, and handle complex cases well. AI agents are cheaper and faster but may miss edge cases, increase cybersecurity risk, and can malfunction. A hybrid approach is also possible.",
  },
  {
    question: "Can I save my progress?",
    answer:
      "Yes. All progress is automatically saved to our secure cloud database. You can close your browser, log out, and return anytime — your banks, employees, financial data, and simulation history will be exactly where you left them.",
  },
  {
    question: "How many banks can I manage?",
    answer:
      "Each account has exactly 3 independent bank simulation slots. Each slot holds a completely separate bank with its own country, currency, employees, customers, financial records, and simulation history. You can delete a bank to free up a slot.",
  },
  {
    question: "Is BANKVERSE free?",
    answer:
      "Yes, BANKVERSE is free to use. Create an account and start building your first bank immediately. All simulation features, reports, and management tools are included at no cost.",
  },
];

export function FAQ() {
  return (
    <section id="about" className="py-24 px-4 bg-background">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-blue-500 mb-2 tracking-wide uppercase">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <Accordion className="w-full space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border border-border rounded-xl px-4 data-[state=open]:bg-muted/30"
            >
              <AccordionTrigger className="text-left font-medium text-sm hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
