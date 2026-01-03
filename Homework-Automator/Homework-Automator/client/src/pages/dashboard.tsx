import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateMockBook } from "@/lib/mock-generator"; 
import { Book, Meta, GRADES, MetaSchema } from "@/lib/schema"; 
import { ReadingPage, VocabularyPage, GrammarPage } from "@/components/book/book-renderer";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Loader2, Download, RefreshCw, BookOpen, Settings, Layers, ListTodo } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { WordMemoryLab } from "@/components/word/word-memory-lab";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

const ColorPicker = ({ label, variable, defaultValue }: { label: string, variable: string, defaultValue: string }) => {
  const [value, setValue] = useState(defaultValue);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    document.documentElement.style.setProperty(variable, e.target.value);
  };
  return (
    <div className="flex items-center justify-between">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={handleChange} className="h-6 w-6 rounded cursor-pointer border-none p-0"/>
        <span className="text-[10px] font-mono text-gray-400">{value}</span>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [book, setBook] = useState<Book | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("setup");
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  // --- Form Setup ---
  const form = useForm<Meta>({
    resolver: zodResolver(MetaSchema),
    defaultValues: {
      month: "January",
      grade: "7yr-3",
      title: "HOMEWORK",
      instituteName: "J-US INSTITUTE",
      instituteSub: "Jubilee With US",
      startDay: 1,
      endDay: 20,
      pagesPerDay: 4,
      mode: "daily", // Default to daily for advanced control, but UI will allow toggle
      globalTheme: "Science & Nature",
      globalGrammarFocus: "Past Tense",
      globalVocabularyList: ""
    }
  });

  const mode = form.watch("mode");
  const isMonthlyMode = mode === "monthly";

  // Daily inputs state
  const [dayInputs, setDayInputs] = useState<{day: number, theme: string, grammarFocus: string, words: string}[]>([]);

  // Initialize day inputs when range changes
  useEffect(() => {
    const start = form.getValues("startDay");
    const end = form.getValues("endDay");
    const newInputs = [];
    for (let i = start; i <= end; i++) {
      const existing = dayInputs.find(d => d.day === i);
      newInputs.push(existing || {
        day: i,
        theme: "",
        grammarFocus: "",
        words: ""
      });
    }
    setDayInputs(newInputs);
  }, [form.watch("startDay"), form.watch("endDay")]);


  const handleGenerate = async (data: Meta) => {
    setIsGenerating(true);
    try {
      // If in monthly mode, propagate global settings to days where fields are empty
      // BUT for mock generator, we just pass the 'dailyInputs' and let it handle fallback
      // or we update the dailyInputs here before passing.
      // Let's update inputs here to be explicit.
      
      const effectiveInputs = dayInputs.map(d => ({
        ...d,
        theme: (isMonthlyMode && !d.theme) ? (data.globalTheme || "General") : (d.theme || "General"),
        grammarFocus: (isMonthlyMode && !d.grammarFocus) ? (data.globalGrammarFocus || "Mixed") : (d.grammarFocus || "Mixed"),
        // If monthly mode and no specific words, use global list.
        words: (isMonthlyMode && !d.words && data.globalVocabularyList) 
               ? data.globalVocabularyList.split(",").map(w => w.trim()).filter(Boolean)
               : d.words.split(",").map(w => w.trim()).filter(Boolean)
      }));

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const generatedBook = generateMockBook(data, effectiveInputs);
      setBook(generatedBook);
      setActiveTab("preview");
      toast({ title: "Success", description: "Book content generated successfully." });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to generate book.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = async () => {
    if (!printRef.current) return;
    const pages = Array.from(printRef.current.querySelectorAll('.a4-page'));
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Show a loading toast because PDF generation can be slow
    const loadingToast = toast({ title: "Generating PDF...", description: `Processing ${pages.length} pages. Please wait.` });

    try {
      let isFirst = true;
      for (const page of pages) {
        if (!isFirst) pdf.addPage();
        
        const canvas = await html2canvas(page as HTMLElement, {
          scale: 2, // Higher quality
          useCORS: true,
          logging: false,
          windowWidth: 794, // A4 width in px at 96 DPI
          windowHeight: 1123
        });
        
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
        isFirst = false;
      }
      
      pdf.save(`Homework_Book_${form.getValues("month")}_${form.getValues("grade")}.pdf`);
      loadingToast.dismiss();
      toast({ title: "Download Ready", description: "Your PDF has been downloaded." });
    } catch (err) {
      loadingToast.dismiss();
      toast({ title: "Export Failed", description: "Could not generate PDF.", variant: "destructive" });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="h-14 bg-white border-b flex items-center px-6 justify-between shrink-0 z-10">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <h1 className="font-bold text-lg tracking-tight">Homework Automator</h1>
          <Badge variant="outline" className="ml-2 text-xs font-normal text-gray-500">v1.1</Badge>
        </div>
        <div className="flex items-center gap-2">
          {book && (
            <Button size="sm" onClick={handleExportPDF} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4" /> Download PDF
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Controls */}
        <aside className="w-96 bg-white border-r flex flex-col shrink-0 overflow-y-auto z-20 shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="p-4 border-b bg-gray-50/80 sticky top-0 z-10 backdrop-blur-sm">
               <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="setup">Setup</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="style">Style</TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6 flex-1 space-y-8">
              {/* TAB: SETUP */}
              <TabsContent value="setup" className="space-y-6 mt-0">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Month</Label>
                      <Input {...form.register("month")} placeholder="e.g. January" />
                    </div>
                    <div className="space-y-2">
                      <Label>Grade/Class</Label>
                      <Select 
                        defaultValue={form.getValues("grade")} 
                        onValueChange={(v) => form.setValue("grade", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Book Title</Label>
                    <Input {...form.register("title")} />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                      <Label>Start Day</Label>
                      <Input type="number" {...form.register("startDay", { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <Label>End Day</Label>
                      <Input type="number" {...form.register("endDay", { valueAsNumber: true })} />
                    </div>
                  </div>

                  {/* Mode Toggle */}
                  <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isMonthlyMode ? <Layers className="h-4 w-4 text-blue-600" /> : <ListTodo className="h-4 w-4 text-gray-500" />}
                        <Label className="cursor-pointer font-semibold">Monthly Apply Mode</Label>
                      </div>
                      <Switch 
                        checked={isMonthlyMode} 
                        onCheckedChange={(c) => form.setValue("mode", c ? "monthly" : "daily")} 
                      />
                    </div>
                    <p className="text-xs text-gray-500 leading-snug">
                      {isMonthlyMode 
                        ? "Apply one theme/grammar focus for the whole month. You can still override specific days in the Content tab."
                        : "Manually configure every day individually for maximum control."}
                    </p>
                  </div>

                  {isMonthlyMode && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-blue-600 uppercase">Monthly Global Theme</Label>
                        <Input {...form.register("globalTheme")} placeholder="e.g. Space Exploration" />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-xs font-bold text-blue-600 uppercase">Monthly Grammar Focus</Label>
                         <Input {...form.register("globalGrammarFocus")} placeholder="e.g. Past Perfect Tense" />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-xs font-bold text-blue-600 uppercase">Global Vocabulary List</Label>
                         <Textarea 
                            {...form.register("globalVocabularyList")} 
                            placeholder="Enter words separated by commas..." 
                            className="h-20 text-xs"
                          />
                         <p className="text-[10px] text-gray-400">These words will be used if a day has no specific words.</p>
                      </div>
                    </div>
                  )}

                </div>
              </TabsContent>

              {/* TAB: CONTENT */}
              <TabsContent value="content" className="space-y-6 mt-0">
                <div className="flex items-center justify-between">
                   <Label className="text-gray-500 text-xs uppercase tracking-wider font-bold">Daily Overrides</Label>
                   <span className="text-xs text-gray-400">{dayInputs.length} days</span>
                </div>
                
                <Accordion type="single" collapsible className="w-full">
                  {dayInputs.map((day, idx) => (
                    <AccordionItem key={day.day} value={`day-${day.day}`}>
                      <AccordionTrigger className="text-sm py-2 hover:no-underline hover:bg-gray-50 px-2 rounded group">
                        <div className="flex items-center gap-3 w-full">
                           <Badge variant="outline" className="w-8 h-6 flex justify-center p-0 bg-white">{day.day}</Badge>
                           <div className="flex flex-col items-start text-left flex-1 min-w-0">
                             <span className="truncate w-full font-medium text-xs">
                                {day.theme || (isMonthlyMode ? form.watch("globalTheme") : "") || "Untitled"}
                             </span>
                             <span className="text-[10px] text-gray-400 truncate w-full">
                                {day.grammarFocus || (isMonthlyMode ? form.watch("globalGrammarFocus") : "")}
                             </span>
                           </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-3 space-y-4 bg-gray-50/50 rounded-b border-t">
                         <div className="space-y-1.5">
                           <Label className="text-xs">Daily Theme Override</Label>
                           <Input 
                             value={day.theme} 
                             onChange={(e) => {
                               const newInputs = [...dayInputs];
                               newInputs[idx].theme = e.target.value;
                               setDayInputs(newInputs);
                             }}
                             className="h-8 text-xs bg-white" 
                             placeholder={isMonthlyMode ? `Default: ${form.watch("globalTheme")}` : ""}
                           />
                         </div>
                         <div className="space-y-1.5">
                           <Label className="text-xs">Daily Grammar Override</Label>
                           <Input 
                             value={day.grammarFocus} 
                             onChange={(e) => {
                               const newInputs = [...dayInputs];
                               newInputs[idx].grammarFocus = e.target.value;
                               setDayInputs(newInputs);
                             }}
                             className="h-8 text-xs bg-white" 
                             placeholder={isMonthlyMode ? `Default: ${form.watch("globalGrammarFocus")}` : ""}
                           />
                         </div>
                         <div className="space-y-1.5">
                           <Label className="text-xs">Daily Vocabulary Words</Label>
                           <Textarea 
                             value={day.words} 
                             onChange={(e) => {
                               const newInputs = [...dayInputs];
                               newInputs[idx].words = e.target.value;
                               setDayInputs(newInputs);
                             }}
                             className="h-16 text-xs bg-white resize-none" 
                             placeholder="Comma separated words..."
                           />
                         </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              {/* TAB: STYLE */}
              <TabsContent value="style" className="space-y-6 mt-0">
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm">Template Calibration</CardTitle>
                    <CardDescription className="text-xs">Adjust print colors & sizing</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <ColorPicker label="Theme Blue" variable="--print-blue" defaultValue="#1154c4" />
                    <ColorPicker label="Theme Red" variable="--print-red" defaultValue="#e33030" />
                    <ColorPicker label="Header Gray" variable="--print-header" defaultValue="#333333" />
                    
                    <Separator />
                    
                    <div className="space-y-3">
                       <Label className="text-xs">Font Scaling</Label>
                       <Slider defaultValue={[100]} max={120} min={80} step={5} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>

            <div className="p-4 border-t bg-white sticky bottom-0 z-30">
               <Button 
                 onClick={form.handleSubmit(handleGenerate)} 
                 disabled={isGenerating} 
                 className="w-full bg-blue-600 hover:bg-blue-700 shadow-md transition-all hover:shadow-lg"
                 size="lg"
               >
                 {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                 Generate Book
               </Button>
            </div>
          </Tabs>
        </aside>

        {/* Main Preview Area */}
        <main className="flex-1 bg-gray-200/50 relative overflow-hidden flex flex-col">
          <div className="p-6 pb-4 bg-white/80 backdrop-blur border-b border-gray-200 overflow-y-auto">
            <WordMemoryLab />
          </div>
          <div className="flex-1 min-h-0">
            {!book ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                  <Settings className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="font-bold text-gray-600 text-lg">Setup Your Book</h3>
                <p className="max-w-xs text-sm mt-2 text-gray-500">
                  Configure global themes or daily topics in the sidebar, then click Generate.
                </p>
              </div>
            ) : (
              <ScrollArea className="flex-1 w-full h-full p-8 bg-gray-200/50">
                <div className="max-w-[210mm] mx-auto pb-20 origin-top" ref={printRef}>
                  {book.days.map(day => (
                    <div key={day.day} className="mb-8">
                       {/* Explicit 4-Page Structure */}
                       
                       {/* Page 1: Non-Fiction */}
                       <ReadingPage day={day.day} data={day.page1} meta={book.meta} />
                       
                       {/* Page 2: Fiction */}
                       <ReadingPage day={day.day} data={day.page2} meta={book.meta} />
                       
                       {/* Page 3: Vocabulary */}
                       <VocabularyPage day={day.day} data={day.page3} meta={book.meta} />
                       
                       {/* Page 4: Grammar */}
                       <GrammarPage day={day.day} data={day.page4} meta={book.meta} />
                    </div>
                  ))}
               </div>
            </ScrollArea>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
