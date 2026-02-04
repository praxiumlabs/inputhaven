"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CopyButton } from "@/components/shared/copy-button";
import { createApiKey, getApiKeys, deleteApiKey } from "@/actions/api-keys";
import { formatDate } from "@/lib/utils";
import { Plus, Trash2, Key } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface ApiKeyDisplay {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsed: Date | null;
  createdAt: Date;
}

export default function ApiKeysPage() {
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKeyDisplay[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getApiKeys().then((k) => setKeys(k as ApiKeyDisplay[]));
  }, []);

  const handleCreate = async () => {
    if (!newKeyName) return;
    setLoading(true);
    const result = await createApiKey({ name: newKeyName });
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else if (result.key) {
      setNewKey(result.key);
      getApiKeys().then((k) => setKeys(k as ApiKeyDisplay[]));
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this API key? Any applications using it will stop working.")) return;
    await deleteApiKey(id);
    setKeys(keys.filter((k) => k.id !== id));
    toast({ title: "API key deleted" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-muted-foreground">
            Manage API keys for programmatic access.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) { setNewKey(null); setNewKeyName(""); }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            {newKey ? (
              <>
                <DialogHeader>
                  <DialogTitle>API Key Created</DialogTitle>
                  <DialogDescription>
                    Copy this key now. It will not be shown again.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center gap-2 rounded-md bg-muted p-3">
                  <code className="flex-1 break-all text-sm">{newKey}</code>
                  <CopyButton text={newKey} />
                </div>
                <DialogFooter>
                  <Button onClick={() => { setDialogOpen(false); setNewKey(null); setNewKeyName(""); }}>
                    Done
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Create API Key</DialogTitle>
                  <DialogDescription>
                    Give your API key a name to identify it.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="keyName">Name</Label>
                  <Input
                    id="keyName"
                    placeholder="My App"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button onClick={handleCreate} disabled={loading || !newKeyName}>
                    {loading ? "Creating..." : "Create"}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {keys.length === 0 ? (
            <div className="py-12 text-center">
              <Key className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No API keys yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <code className="text-sm">{key.keyPrefix}...****</code>
                    </TableCell>
                    <TableCell>{formatDate(key.createdAt)}</TableCell>
                    <TableCell>{key.lastUsed ? formatDate(key.lastUsed) : "Never"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(key.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
