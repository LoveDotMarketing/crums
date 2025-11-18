import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatBotProps {
  userType: "admin" | "customer" | "mechanic";
}

export const ChatBot = ({ userType }: ChatBotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: userType === "admin" 
        ? "Hello! I'm your AI assistant. I can help you manage tolls, customers, and fleet operations. Try asking me to 'mark toll #142 as paid' or 'show me unpaid tolls'."
        : userType === "mechanic"
        ? "Hello! I'm your AI assistant. I can help you with trailer maintenance, service tracking, and fleet status. Ask me about trailers needing service or maintenance costs!"
        : "Hello! I'm your AI assistant. I can help you with toll information, payment links, and account questions. Ask me anything!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAdminCommand = async (message: string): Promise<string> => {
    const lowerMsg = message.toLowerCase();

    // Handle toll payment updates
    const tollPaymentMatch = message.match(/(?:mark|paid|pay).*toll\s*#?(\d+)/i);
    if (tollPaymentMatch) {
      const tollNumber = tollPaymentMatch[1];
      try {
        const { data: toll, error } = await supabase
          .from("tolls")
          .select("*")
          .eq("id", tollNumber)
          .single();

        if (error || !toll) {
          return `I couldn't find toll #${tollNumber}. Please verify the toll number and try again.`;
        }

        const { error: updateError } = await supabase
          .from("tolls")
          .update({ status: "paid", payment_date: new Date().toISOString() })
          .eq("id", tollNumber);

        if (updateError) {
          return `I encountered an error updating toll #${tollNumber}. Please try again.`;
        }

        return `✅ I've marked toll #${tollNumber} as paid and updated the payment date. The customer will no longer receive reminders.`;
      } catch (error) {
        return `I encountered an error processing that request. Please try again.`;
      }
    }

    // Handle showing unpaid tolls
    if (lowerMsg.includes("unpaid") && lowerMsg.includes("toll")) {
      try {
        const { data: tolls, error } = await supabase
          .from("tolls")
          .select("id, amount, toll_date, customer_id")
          .eq("status", "pending")
          .order("toll_date", { ascending: false })
          .limit(5);

        if (error || !tolls || tolls.length === 0) {
          return "There are currently no unpaid tolls in the system.";
        }

        const tollList = tolls.map(t => `• Toll #${t.id.slice(0, 8)} - $${t.amount} (${new Date(t.toll_date).toLocaleDateString()})`).join("\n");
        return `Here are the most recent unpaid tolls:\n\n${tollList}\n\nWould you like me to update any of these?`;
      } catch (error) {
        return "I had trouble retrieving the unpaid tolls. Please try again.";
      }
    }

    // Generic admin responses
    if (lowerMsg.includes("customer") || lowerMsg.includes("user")) {
      return "I can help you manage customers. Try asking me to 'show customer details' or 'list recent customers'.";
    }

    if (lowerMsg.includes("fleet") || lowerMsg.includes("trailer")) {
      return "I can help with fleet management. Try asking 'show available trailers' or 'list trailers in maintenance'.";
    }

    return "I understand you need help with that. As a demo, I can currently help you mark tolls as paid (try 'mark toll #142 as paid') or show unpaid tolls. More features coming soon!";
  };

  const handleCustomerCommand = async (message: string): Promise<string> => {
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes("toll") && (lowerMsg.includes("pay") || lowerMsg.includes("payment"))) {
      return `To pay your toll, please visit one of these toll authority websites:\n\n• E-ZPass: https://www.e-zpassny.com\n• SunPass: https://www.sunpass.com\n• FasTrak: https://www.bayareafastrak.org\n\nOnce you've made payment, you can mark it as paid in your dashboard to stop email reminders.`;
    }

    if (lowerMsg.includes("toll") && lowerMsg.includes("my")) {
      return "You can view all your tolls in the dashboard above. Click on any toll to see details and mark it as paid once you've contacted the toll authority.";
    }

    if (lowerMsg.includes("email") || lowerMsg.includes("notification")) {
      return "You can manage email notifications in your Profile settings. You'll find an option to turn off email reminders for paid tolls.";
    }

    if (lowerMsg.includes("rental") || lowerMsg.includes("trailer")) {
      return "For rental information, please check the 'My Rentals' section or submit a new rental request. Need help with a specific trailer?";
    }

    return "I'm here to help! You can ask me about:\n• Paying tolls\n• Viewing your toll history\n• Managing email notifications\n• Rental information\n\nWhat would you like to know?";
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = userType === "admin" 
        ? await handleAdminCommand(input)
        : await handleCustomerCommand(input);

      const assistantMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast.error("Failed to process your message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50",
          "bg-primary hover:bg-primary/90 transition-all duration-200",
          isOpen && "scale-0"
        )}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Window */}
      <Card
        className={cn(
          "fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col",
          "transition-all duration-300 origin-bottom-right",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <div>
              <h3 className="font-semibold">AI Assistant</h3>
              <p className="text-xs opacity-90">
                {userType === "admin" ? "Admin Support" : "Customer Support"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg p-3 whitespace-pre-wrap",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};
