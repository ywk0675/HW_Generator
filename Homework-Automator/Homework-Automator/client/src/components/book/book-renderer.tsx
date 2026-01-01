import React from 'react';
import { cn } from '@/lib/utils';
import { Book, DayContent, ReadingPassageSchema } from '@/lib/schema';
import { z } from "zod";

// --- A4 Container ---
// Fixed height for A4 to prevent overflowing content in PDF
export const PageContainer = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <div 
      className={cn("a4-page relative p-8 flex flex-col justify-between bg-white mx-auto print:mx-0 shadow-lg print:shadow-none mb-8 last:mb-0 box-border overflow-hidden", className)}
      style={{ 
        width: '210mm', 
        height: '297mm',
        pageBreakAfter: 'always' 
      }}
    >
      {children}
    </div>
  );
};

// --- Header/Footer Components ---
const PageHeader = ({ day, title, type }: { day: number, title: string, type?: string }) => (
  <div className="absolute top-6 right-8 flex flex-col items-end z-10">
    <span className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-1">{type || "Homework"}</span>
    <div className="flex items-center gap-2">
      <div className="bg-[hsl(var(--print-header))] text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider shadow-sm">
        DAY {day}
      </div>
    </div>
  </div>
);

const PageFooter = ({ institute, sub }: { institute: string, sub: string }) => (
  <div className="w-full border-t-2 border-gray-100 mt-auto pt-3 flex justify-between items-center text-[10px] text-gray-400 font-sans tracking-wide">
    <span className="font-bold text-[hsl(var(--print-blue))]">{institute}</span>
    <span>{sub}</span>
  </div>
);

// --- Content Components ---

// 1. Reading Page (Generic for Fiction/Non-Fiction)
export const ReadingPage = ({ day, data, meta }: { day: number, data: z.infer<typeof ReadingPassageSchema>, meta: any }) => {
  const isFiction = data.type === 'fiction';
  const borderColor = isFiction ? 'border-[hsl(var(--print-red))]' : 'border-[hsl(var(--print-blue))]';
  const textColor = isFiction ? 'text-[hsl(var(--print-red))]' : 'text-[hsl(var(--print-blue))]';
  const labelBg = isFiction ? 'bg-[hsl(var(--print-red))]' : 'bg-[hsl(var(--print-blue))]';

  return (
    <PageContainer>
      <PageHeader day={day} title="Reading" type={data.type.toUpperCase()} />
      
      <div className="mt-12 flex-1 flex flex-col h-full overflow-hidden">
        <h2 className={cn("text-2xl font-serif font-bold mb-1 truncate", textColor)}>{data.title}</h2>
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 shrink-0">
          <span className="font-semibold">Lexile: {data.lexile}</span>
          <div className="h-1 w-1 bg-gray-300 rounded-full"></div>
          <span>{data.wordCount} words</span>
        </div>

        {/* Passage Box - Flex grow but constrained */}
        <div className={cn("border-2 rounded-2xl p-6 bg-opacity-5 relative mb-6 shrink-0", borderColor, isFiction ? 'bg-red-50' : 'bg-blue-50')}>
           {/* Decorative label */}
           <div className={cn("absolute -top-3 left-6 text-white px-3 py-0.5 text-[10px] font-bold tracking-wider rounded-sm", labelBg)}>
             {isFiction ? 'FICTION PASSAGE' : 'NON-FICTION'}
           </div>
           
           <div className="font-serif leading-relaxed text-justify text-gray-800 text-[10.5pt] space-y-3 h-[380px] overflow-hidden relative">
             {data.content.split('\n\n').map((p, i) => (
               <p key={i}>{p}</p>
             ))}
             {/* Fade out effect for overflow text in mockup */}
             <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white/80 to-transparent"></div>
           </div>
        </div>

        {/* Reading Comprehension Questions */}
        <div className="flex-1 overflow-hidden">
          <h3 className="font-sans font-bold text-xs text-gray-600 uppercase tracking-wider border-b pb-2 mb-3">Comprehension Check</h3>
          <div className="space-y-3">
            {data.questions.map((q, idx) => (
              <div key={idx} className="text-sm">
                <p className="font-semibold mb-1 text-[11px] leading-tight">{idx + 1}. {q.question}</p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 ml-4">
                  {q.options.map((opt, oid) => (
                    <div key={oid} className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded-full border border-gray-300 flex items-center justify-center text-[7px] text-gray-400 shrink-0">
                        {String.fromCharCode(65 + oid)}
                      </div>
                      <span className="text-[10px] truncate">{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PageFooter institute={meta.instituteName} sub={meta.instituteSub} />
    </PageContainer>
  );
};

// 2. Vocabulary Page
export const VocabularyPage = ({ day, data, meta }: { day: number, data: DayContent['page3'], meta: any }) => {
  return (
    <PageContainer>
      <PageHeader day={day} title="Vocabulary" />
      
      <div className="mt-12 flex-1">
         <div className="flex items-baseline justify-between border-b-2 border-[hsl(var(--print-red))] pb-2 mb-6">
            <h2 className="text-xl font-bold text-[hsl(var(--print-red))]">VOCABULARY</h2>
            <span className="text-xs text-gray-500 italic">Daily Words</span>
         </div>

         {/* Word Box */}
         <div className="bg-red-50 border border-[hsl(var(--print-red))] rounded-lg p-4 mb-8">
            <h4 className="text-[hsl(var(--print-red))] font-bold text-xs mb-3 uppercase tracking-wide text-center">Word Box</h4>
            <div className="grid grid-cols-5 gap-3">
              {data.vocabulary.map((v, i) => (
                <div key={i} className="bg-white border border-red-100 rounded px-2 py-1 text-center text-xs font-medium shadow-sm truncate">
                  {v.word}
                </div>
              ))}
            </div>
         </div>

         {/* Exercises */}
         <div className="space-y-5">
           {data.vocabulary.map((v, i) => (
             <div key={i} className="flex gap-3 items-start text-sm">
               <span className="font-bold text-gray-400 w-5 text-right shrink-0">{i + 1}.</span>
               <div className="flex-1 border-b border-gray-200 border-dashed pb-1">
                 {/* Mocking a fill-in-the-blank style */}
                 {v.sentence || <span className="text-gray-500 italic">Define: {v.word}</span>}
               </div>
             </div>
           ))}
         </div>
      </div>

      <PageFooter institute={meta.instituteName} sub={meta.instituteSub} />
    </PageContainer>
  );
};

// 3. Grammar Page
export const GrammarPage = ({ day, data, meta }: { day: number, data: DayContent['page4'], meta: any }) => {
  return (
    <PageContainer>
      <PageHeader day={day} title="Grammar" />
      
      <div className="mt-12 flex-1 flex flex-col h-full">
        <div className="bg-gray-800 text-white px-4 py-2 rounded-t-lg inline-block text-sm font-bold tracking-wider self-start">
          GRAMMAR FOCUS
        </div>
        <div className="border-t-4 border-gray-800 pt-6 mb-4 flex-1">
          <div className="flex justify-between items-baseline mb-6">
            <h2 className="text-xl font-bold text-gray-800">{data.grammarFocus}</h2>
            <p className="text-xs text-gray-500">Choose the best answer.</p>
          </div>
          
          {/* Two column grid that respects strict A4 height */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 content-start">
            {data.grammarExercises?.map((q, i) => (
               <div key={i} className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-100 break-inside-avoid">
                  <div className="font-semibold mb-2 flex gap-2 text-[13px]">
                    <span className="text-gray-400 font-bold">{i + 1}.</span>
                    <span className="leading-tight">{q.question.replace(/^Q\d+: /, "")}</span>
                  </div>
                  <div className="space-y-1.5 ml-5">
                    {q.options.map((opt, oid) => (
                      <div key={oid} className="flex items-center gap-2 relative">
                        <div className="w-3.5 h-3.5 rounded-full border border-gray-400 flex items-center justify-center text-[8px] text-gray-500 shrink-0">
                          {String.fromCharCode(65 + oid)}
                        </div>
                        <span className="text-gray-700 text-[11px]">{opt}</span>
                      </div>
                    ))}
                  </div>
               </div>
            ))}
          </div>
        </div>
      </div>

      <PageFooter institute={meta.instituteName} sub={meta.instituteSub} />
    </PageContainer>
  );
};
