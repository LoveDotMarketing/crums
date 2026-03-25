import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackChatbotOpen } from "@/lib/analytics";
import "@n8n/chat/style.css";

interface ChatBotProps {
  userType: "admin" | "customer" | "mechanic";
}

// Generate a fresh session ID on every page load (module re-evaluates on refresh)
const SESSION_ID = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
const getSessionId = (): string => SESSION_ID;

export const ChatBot = ({ userType }: ChatBotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const chatInitialized = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Build the proxy URL from the Supabase project
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const proxyUrl = supabaseUrl ? `${supabaseUrl}/functions/v1/chat-proxy` : undefined;

  const initChat = useCallback(async () => {
    if (chatInitialized.current || !containerRef.current || !proxyUrl) return;
    chatInitialized.current = true;
    setIsLoading(true);
    setHasError(false);

    try {
      const { createChat } = await import("@n8n/chat");
      const sessionId = getOrCreateSessionId();

      createChat({
        webhookUrl: proxyUrl,
        webhookConfig: {
          method: "POST",
          headers: {
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
        },
        target: "#n8n-chat-container",
        mode: "window",
        chatInputKey: "chatInput",
        chatSessionKey: "sessionId",
        showWelcomeScreen: false,
        defaultLanguage: "en",
        initialMessages: [
          userType === "admin"
            ? "Hello! I'm your AI assistant. I can help you manage tolls, customers, and fleet operations."
            : userType === "mechanic"
            ? "Hello! I'm your AI assistant. I can help you with trailer maintenance and fleet status."
            : "Hello! I'm your CRUMS AI assistant. How can I help you today?",
        ],
        metadata: {
          sessionId,
          userType,
        },
      });

      setIsLoading(false);
    } catch (err) {
      console.error("Failed to initialize n8n chat:", err);
      setHasError(true);
      setIsLoading(false);
      chatInitialized.current = false;
    }
  }, [proxyUrl, userType]);

  useEffect(() => {
    if (isOpen && !chatInitialized.current) {
      const timer = setTimeout(initChat, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initChat]);

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
          "fixed bottom-6 right-6 w-[calc(100vw-3rem)] max-w-96 h-[600px] shadow-2xl z-50 flex flex-col overflow-hidden",
          "sm:w-96",
          "transition-all duration-300 origin-bottom-right",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg shrink-0">
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

        {/* n8n Chat Container */}
        <div className="flex-1 relative min-h-0">
          {!proxyUrl ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center gap-3">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm text-muted-foreground">
                Chat is not configured. Please set the chat endpoint URL.
              </p>
            </div>
          ) : hasError ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center gap-3">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm text-muted-foreground">
                Unable to connect to chat service. Please try again later.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  chatInitialized.current = false;
                  initChat();
                }}
              >
                Retry
              </Button>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Connecting...</p>
            </div>
          ) : null}
          <div
            id="n8n-chat-container"
            ref={containerRef}
            className={cn("h-full", (isLoading || hasError || !proxyUrl) && "hidden")}
          />
        </div>
      </Card>
    </>
  );
};
