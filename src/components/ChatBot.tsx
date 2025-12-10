import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { trackChatbotOpen, trackChatbotMessage } from "@/lib/analytics"; // GA4 tracking

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatBotProps {
  userType: "admin" | "customer" | "mechanic";
}

// Generate a unique session ID for conversation continuity
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export const ChatBot = ({ userType }: ChatBotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: userType === "admin" 
        ? "Hello! I'm your AI assistant. I can help you manage tolls, customers, and fleet operations. Try asking me to 'mark toll #142 as paid' or 'show me unpaid tolls'."
        : userType === "mechanic"
        ? "Hello! I'm your AI assistant. I can help you with trailer maintenance, service tracking, and fleet status. Ask me about trailers needing service or maintenance costs!"
        : "Hello! I'm your CRUMS AI assistant. I can help you with trailer leasing, rentals, toll information, and account questions. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => generateSessionId());
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

  // Simulate streaming effect for text that arrives all at once
  const simulateStreaming = async (fullText: string): Promise<void> => {
    const words = fullText.split(/(\s+)/); // Split by whitespace, keeping delimiters
    let displayed = "";
    
    for (const word of words) {
      displayed += word;
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastIdx = newMessages.length - 1;
        if (lastIdx >= 0 && newMessages[lastIdx].role === "assistant") {
          newMessages[lastIdx] = {
            ...newMessages[lastIdx],
            content: displayed,
          };
        }
        return newMessages;
      });
      // Small delay between words for streaming effect
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  };

  const handleCustomerStream = async (message: string): Promise<void> => {
    // Add placeholder assistant message that will be updated as stream comes in
    const assistantMessage: Message = {
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-proxy`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            message,
            sessionId,
            userType,
            userId: null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to connect to chat service");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response stream available");
      }

      const decoder = new TextDecoder();
      let fullContent = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process SSE lines
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || trimmedLine.startsWith(":")) continue;

          if (trimmedLine.startsWith("data: ")) {
            const data = trimmedLine.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.output || parsed.text || parsed.delta?.content || "";
              if (content) {
                fullContent += content;
              }
            } catch {
              // Non-JSON data
              if (data && data !== "[DONE]") {
                fullContent += data;
              }
            }
          }
        }
      }

      // Handle remaining buffer
      if (buffer.trim()) {
        const trimmedLine = buffer.trim();
        if (trimmedLine.startsWith("data: ")) {
          const data = trimmedLine.slice(6);
          if (data !== "[DONE]") {
            try {
              const parsed = JSON.parse(data);
              const content = parsed.output || parsed.text || "";
              if (content) fullContent += content;
            } catch {
              if (data) fullContent += data;
            }
          }
        }
      }

      // Simulate streaming display if we got content
      if (fullContent.trim()) {
        await simulateStreaming(fullContent);
      } else {
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIdx = newMessages.length - 1;
          if (lastIdx >= 0 && newMessages[lastIdx].role === "assistant") {
            newMessages[lastIdx] = {
              ...newMessages[lastIdx],
              content: "I apologize, but I couldn't process your request. Please try again.",
            };
          }
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Stream error:", error);
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastIdx = newMessages.length - 1;
        if (lastIdx >= 0 && newMessages[lastIdx].role === "assistant") {
          newMessages[lastIdx] = {
            ...newMessages[lastIdx],
            content: "I'm having trouble connecting right now. Please try again in a moment.",
          };
        }
        return newMessages;
      });
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    trackChatbotMessage();
    
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      if (userType === "customer") {
        // Use n8n agent with streaming for customers
        await handleCustomerStream(currentInput);
      } else {
        // Fallback to local handlers for admin/mechanic (for now)
        await new Promise((resolve) => setTimeout(resolve, 500));
        const response = await handleAdminCommand(currentInput);
        
        const assistantMessage: Message = {
          role: "assistant",
          content: response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
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
        onClick={() => {
          if (!isOpen) trackChatbotOpen();
          setIsOpen(!isOpen);
        }}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50",
          "bg-primary hover:bg-primary/90 transition-all duration-200",
          isOpen && "scale-0"
        )}
        aria-label="Open chat assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Window */}
      <Card
        className={cn(
          "fixed bottom-6 right-6 w-[calc(100vw-3rem)] max-w-96 h-[600px] shadow-2xl z-50 flex flex-col",
          "sm:w-96",
          "transition-all duration-300 origin-bottom-right",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <div>
              <h3 className="font-semibold">CRUMS AI Assistant</h3>
              <p className="text-xs opacity-90">
                {userType === "admin" ? "Admin Support" : userType === "mechanic" ? "Mechanic Support" : "Customer Support"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-primary-foreground hover:bg-primary-foreground/20"
            aria-label="Close chat"
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
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
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
            <Button onClick={handleSend} disabled={isLoading || !input.trim()} aria-label="Send message">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};
