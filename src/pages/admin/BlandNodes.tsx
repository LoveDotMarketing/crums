import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { Loader2, RefreshCw, Save, Plus, Trash2, Edit, Phone, Rocket } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { formatDistanceToNow } from "date-fns";

interface BlandNode {
  id: string;
  label: string;
  pathway_id: string;
  node_id: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface BlandNodeEdit {
  id: string;
  node_record_id: string;
  edited_by: string | null;
  previous_prompt: string | null;
  new_prompt: string;
  created_at: string;
}

interface BlandPathwayPublish {
  id: string;
  pathway_id: string;
  version_number: number | null;
  version_name: string | null;
  environment: string;
  published_by: string | null;
  created_at: string;
}

export default function BlandNodes() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [versionName, setVersionName] = useState("");
  const [manageOpen, setManageOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<BlandNode | null>(null);
  const [form, setForm] = useState({ label: "", pathway_id: "", node_id: "", description: "" });

  const { data: nodes, isLoading: nodesLoading } = useQuery({
    queryKey: ["bland-pathway-nodes"],
    queryFn: async (): Promise<BlandNode[]> => {
      const { data, error } = await supabase
        .from("bland_pathway_nodes")
        .select("*")
        .order("label");
      if (error) throw error;
      return data || [];
    },
  });

  const selectedNode = nodes?.find((n) => n.id === selectedId) || null;

  const {
    data: nodeData,
    isLoading: promptLoading,
    refetch: refetchPrompt,
    isFetching: promptFetching,
  } = useQuery({
    queryKey: ["bland-node-prompt", selectedId],
    enabled: !!selectedId,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("bland-get-node", {
        body: { node_record_id: selectedId },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      return data as { prompt: string; nodeName: string | null };
    },
  });

  useEffect(() => {
    if (nodeData) {
      setDraft(nodeData.prompt || "");
      setOriginalPrompt(nodeData.prompt || "");
    }
  }, [nodeData]);

  const { data: edits } = useQuery({
    queryKey: ["bland-node-edits", selectedId],
    enabled: !!selectedId,
    queryFn: async (): Promise<BlandNodeEdit[]> => {
      const { data, error } = await supabase
        .from("bland_node_edits")
        .select("*")
        .eq("node_record_id", selectedId!)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: publishes } = useQuery({
    queryKey: ["bland-pathway-publishes", selectedNode?.pathway_id],
    enabled: !!selectedNode?.pathway_id,
    queryFn: async (): Promise<BlandPathwayPublish[]> => {
      const { data, error } = await (supabase as any)
        .from("bland_pathway_publishes")
        .select("*")
        .eq("pathway_id", selectedNode!.pathway_id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data as BlandPathwayPublish[]) || [];
    },
  });

  const lastPublish = publishes?.[0] || null;

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("bland-update-node", {
        body: { node_record_id: selectedId, new_prompt: draft },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      return data;
    },
    onSuccess: () => {
      toast.success("Draft saved", {
        description: "Click 'Publish to Production' to make it live for callers.",
      });
      setOriginalPrompt(draft);
      qc.invalidateQueries({ queryKey: ["bland-node-edits", selectedId] });
      qc.invalidateQueries({ queryKey: ["bland-pathway-nodes"] });
      setConfirmOpen(false);
    },
    onError: (e: any) => {
      toast.error(e?.message || "Failed to update Bland");
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!selectedNode) throw new Error("No node selected");
      const { data, error } = await supabase.functions.invoke("bland-publish-pathway", {
        body: {
          pathway_id: selectedNode.pathway_id,
          version_name: versionName.trim() || undefined,
          environment: "production",
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      return data as { version_number: number; version_name: string; environment: string };
    },
    onSuccess: (data) => {
      toast.success(`Published version #${data.version_number} to ${data.environment}`, {
        description: "Callers will hear the new prompt on their next call.",
      });
      setPublishOpen(false);
      setVersionName("");
      qc.invalidateQueries({ queryKey: ["bland-pathway-publishes", selectedNode?.pathway_id] });
    },
    onError: (e: any) => toast.error(e?.message || "Failed to publish"),
  });

  const upsertNodeMutation = useMutation({
    mutationFn: async () => {
      if (editingNode) {
        const { error } = await supabase
          .from("bland_pathway_nodes")
          .update(form)
          .eq("id", editingNode.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("bland_pathway_nodes").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingNode ? "Node updated" : "Node added");
      qc.invalidateQueries({ queryKey: ["bland-pathway-nodes"] });
      setManageOpen(false);
      setEditingNode(null);
      setForm({ label: "", pathway_id: "", node_id: "", description: "" });
    },
    onError: (e: any) => toast.error(e?.message || "Failed to save"),
  });

  const deleteNodeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bland_pathway_nodes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Node removed from registry");
      qc.invalidateQueries({ queryKey: ["bland-pathway-nodes"] });
      if (selectedId && !nodes?.find((n) => n.id === selectedId)) setSelectedId(null);
    },
    onError: (e: any) => toast.error(e?.message || "Failed to delete"),
  });

  const isDirty = draft !== originalPrompt;

  const openEdit = (node: BlandNode) => {
    setEditingNode(node);
    setForm({
      label: node.label,
      pathway_id: node.pathway_id,
      node_id: node.node_id,
      description: node.description || "",
    });
    setManageOpen(true);
  };

  const openAdd = () => {
    setEditingNode(null);
    setForm({ label: "", pathway_id: "", node_id: "", description: "" });
    setManageOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <main className="flex-1 p-6 overflow-x-hidden">
          <div className="flex items-center gap-4 mb-6">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Phone className="h-6 w-6" />
                Bland AI Nodes
              </h1>
              <p className="text-sm text-muted-foreground">
                Edit pathway node prompts and push them live to Bland.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
            {/* Node list */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Registered Nodes</CardTitle>
                <Button size="sm" variant="outline" onClick={openAdd}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {nodesLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
                {!nodesLoading && (nodes?.length ?? 0) === 0 && (
                  <p className="text-sm text-muted-foreground">No nodes registered yet.</p>
                )}
                {nodes?.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-md border cursor-pointer transition-colors ${
                      selectedId === n.id
                        ? "border-primary bg-accent"
                        : "border-border hover:bg-accent/50"
                    }`}
                    onClick={() => setSelectedId(n.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{n.label}</p>
                        <p className="text-xs text-muted-foreground">
                          Updated {formatDistanceToNow(new Date(n.updated_at), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(n);
                          }}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Remove "${n.label}" from the registry? Bland is not affected.`)) {
                              deleteNodeMutation.mutate(n.id);
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Editor */}
            <Card className="min-w-0">
              {!selectedNode ? (
                <CardContent className="p-12 text-center text-muted-foreground">
                  Select a node from the left to edit its prompt.
                </CardContent>
              ) : (
                <>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="min-w-0">
                        <CardTitle>{selectedNode.label}</CardTitle>
                        {selectedNode.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedNode.description}
                          </p>
                        )}
                        <p className="text-xs font-mono text-muted-foreground mt-2 break-all">
                          pathway: {selectedNode.pathway_id} · node: {selectedNode.node_id}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => refetchPrompt()}
                          disabled={promptFetching}
                        >
                          {promptFetching ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-1" />
                          )}
                          Refresh from Bland
                        </Button>
                        <Button
                          size="sm"
                          disabled={!isDirty || saveMutation.isPending}
                          onClick={() => setConfirmOpen(true)}
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Save & Push to Bland
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {promptLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground py-12 justify-center">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading prompt from Bland…
                      </div>
                    ) : (
                      <Tabs defaultValue="edit">
                        <TabsList>
                          <TabsTrigger value="edit">Edit</TabsTrigger>
                          <TabsTrigger value="preview">Preview</TabsTrigger>
                        </TabsList>
                        <TabsContent value="edit">
                          <Textarea
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            rows={28}
                            className="font-mono text-sm"
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            {draft.length.toLocaleString()} characters
                            {isDirty && " · unsaved changes"}
                          </p>
                        </TabsContent>
                        <TabsContent value="preview">
                          <div className="prose prose-sm dark:prose-invert max-w-none border rounded-md p-4 min-h-[400px]">
                            <ReactMarkdown>{draft || "*Empty prompt*"}</ReactMarkdown>
                          </div>
                        </TabsContent>
                      </Tabs>
                    )}

                    {/* Edit history */}
                    <Accordion type="single" collapsible>
                      <AccordionItem value="history">
                        <AccordionTrigger>
                          Edit history ({edits?.length || 0})
                        </AccordionTrigger>
                        <AccordionContent>
                          {(!edits || edits.length === 0) && (
                            <p className="text-sm text-muted-foreground">
                              No edits logged yet.
                            </p>
                          )}
                          <div className="space-y-3">
                            {edits?.map((edit) => (
                              <div key={edit.id} className="border rounded-md p-3 text-sm">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(edit.created_at), {
                                      addSuffix: true,
                                    })}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setDraft(edit.previous_prompt || "");
                                      toast.info("Previous version loaded into editor. Save to push.");
                                    }}
                                    disabled={!edit.previous_prompt}
                                  >
                                    Restore previous
                                  </Button>
                                </div>
                                <details>
                                  <summary className="cursor-pointer text-xs text-muted-foreground">
                                    Show previous version
                                  </summary>
                                  <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap">
                                    {edit.previous_prompt || "(empty)"}
                                  </pre>
                                </details>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </>
              )}
            </Card>
          </div>

          {/* Confirm save dialog */}
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Push to Bland?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will overwrite the live Bland node prompt immediately. The previous version
                  will be saved in edit history so you can restore it.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    saveMutation.mutate();
                  }}
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  )}
                  Yes, push to Bland
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Manage node dialog */}
          <Dialog open={manageOpen} onOpenChange={setManageOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingNode ? "Edit Node" : "Add Node"}</DialogTitle>
                <DialogDescription>
                  Register a Bland pathway node so it shows up in the editor list.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Label *</Label>
                  <Input
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    placeholder="e.g. Greeting Node"
                  />
                </div>
                <div>
                  <Label>Pathway ID *</Label>
                  <Input
                    value={form.pathway_id}
                    onChange={(e) => setForm({ ...form, pathway_id: e.target.value })}
                    placeholder="From Bland dashboard URL"
                  />
                </div>
                <div>
                  <Label>Node ID *</Label>
                  <Input
                    value={form.node_id}
                    onChange={(e) => setForm({ ...form, node_id: e.target.value })}
                    placeholder="UUID of the node"
                    className="font-mono text-sm"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setManageOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => upsertNodeMutation.mutate()}
                  disabled={
                    !form.label ||
                    !form.pathway_id ||
                    !form.node_id ||
                    upsertNodeMutation.isPending
                  }
                >
                  {upsertNodeMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  )}
                  {editingNode ? "Save changes" : "Add node"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </SidebarProvider>
  );
}
