'use client';

import React, { useState } from 'react';

// Interface cho dữ liệu từ API
interface FAQFromAPI {
  id: number;
  question: string;
  answer: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interface cho component (chỉ lấy các thuộc tính cần thiết)
interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

interface FAQAccordionProps {
 faqs: FAQFromAPI[];
  title?: string;
}

const FAQAccordion: React.FC<FAQAccordionProps> = ({ 
  faqs, 
  title = "Câu hỏi thường gặp" 
}) => {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  // Map dữ liệu từ API sang dữ liệu cho component
  const mappedFaqs: FAQItem[] = faqs.map(faq => ({
    id: faq.id,
    question: faq.question,
    answer: faq.answer
  }));

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-dark">
          {title}
        </h2>
        
        {mappedFaqs && mappedFaqs.length > 0 ? (
          <div className="max-w-3xl mx-auto">
            {mappedFaqs.map((faq) => (
              <div 
                key={faq.id} 
                className="border-b border-gray-light last:border-b-0"
              >
                <button
                  className="w-full flex justify-between items-center py-6 text-left focus:outline-none"
                  onClick={() => toggleFAQ(faq.id)}
                >
                  <h3 className="text-lg font-semibold text-dark">
                    {faq.question}
                  </h3>
                  <div className="ml-4 flex-shrink-0">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-6 w-6 text-primary transition-transform duration-300 ${openId === faq.id ? 'rotate-45' : ''}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </button>
                
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    openId === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="pb-6 text-gray-medium">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-medium">Chưa có câu hỏi thường gặp nào</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FAQAccordion;