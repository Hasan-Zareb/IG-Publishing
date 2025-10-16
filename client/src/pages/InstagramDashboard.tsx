import React, { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Instagram, FileSpreadsheet, Upload, BarChart3, Calendar, Users, TrendingUp } from "lucide-react";

export default function InstagramDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [csvImportDialogOpen, setCsvImportDialogOpen] = useState(false);
  const [selectedInstagramAccount, setSelectedInstagramAccount] = useState<string>('');
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  // Fetch Instagram stats
  const { data: stats } = useQuery({
    queryKey: ['/api/instagram/stats'],
    queryFn: async () => {
      const response = await fetch('/api/instagram/stats');
      return response.json();
    }
  });

  // Fetch Instagram accounts
  const { data: instagramAccountsData } = useQuery({
    queryKey: ['/api/instagram/accounts'],
    queryFn: async () => {
      const response = await fetch('/api/instagram/accounts');
      return response.json();
    }
  });

  // Fetch Instagram posts
  const { data: instagramPostsData } = useQuery({
    queryKey: ['/api/instagram/posts'],
    queryFn: async () => {
      const response = await fetch('/api/instagram/posts');
      return response.json();
    }
  });

  // Ensure we have arrays
  const instagramAccounts = Array.isArray(instagramAccountsData) ? instagramAccountsData : [];
  const instagramPosts = Array.isArray(instagramPostsData) ? instagramPostsData : [];

  // Handle CSV file selection
  const handleCsvFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload Excel (.xlsx) or CSV files only.",
        variant: "destructive",
      });
      return;
    }

    setCsvFile(file);
    setSelectedInstagramAccount('multi-account'); // Default to multi-account mode
    setCsvImportDialogOpen(true);
  };

  // CSV Import mutation
  const csvImportMutation = useMutation({
    mutationFn: async (accountId: string) => {
      if (!csvFile) throw new Error('No file selected');
      
      const formData = new FormData();
      formData.append('file', csvFile);
      
      // Only append accountId if it's not "multi-account" (which means use CSV column)
      if (accountId && accountId !== 'multi-account') {
        formData.append('accountId', accountId);
      }
      
      const response = await fetch('/api/instagram/import-csv', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Import failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/instagram/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/instagram/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      
      toast({
        title: "Import Successful!",
        description: `Imported ${data.imported} Instagram posts. ${data.failed > 0 ? `${data.failed} failed.` : ''}`,
      });
      
      setCsvImportDialogOpen(false);
      setCsvFile(null);
      setSelectedInstagramAccount('');
    },
    onError: (error: any) => {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import Instagram posts",
        variant: "destructive",
      });
    }
  });

  // Download template
  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/instagram/template');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'instagram-posts-template.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Template Downloaded",
        description: "Instagram CSV template downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download template",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-xl shadow-lg">
                  <Instagram className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Instagram Publisher
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Schedule and manage Instagram posts, Reels, and stories
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
              <Button variant="outline" onClick={downloadTemplate}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Download Template
              </Button>
              <Button 
                onClick={() => csvFileInputRef.current?.click()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Upload className="mr-2 h-4 w-4" />
                Import Posts
              </Button>
              <input
                ref={csvFileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleCsvFileSelect}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Scheduled Posts</p>
                  <p className="text-3xl font-bold text-purple-900">{stats?.scheduled || 0}</p>
                </div>
                <Calendar className="h-12 w-12 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-200 bg-pink-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-pink-600">Published Today</p>
                  <p className="text-3xl font-bold text-pink-900">{stats?.publishedToday || 0}</p>
                </div>
                <TrendingUp className="h-12 w-12 text-pink-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Connected Accounts</p>
                  <p className="text-3xl font-bold text-blue-900">{stats?.accounts || 0}</p>
                </div>
                <Users className="h-12 w-12 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Posts</p>
                  <p className="text-3xl font-bold text-green-900">{stats?.totalPosts || 0}</p>
                </div>
                <BarChart3 className="h-12 w-12 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Rate Limit Card */}
        {stats && stats.dailyLimitTotal > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Instagram className="h-5 w-5" />
                Instagram API Rate Limit (25 posts per account per day)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-orange-700">Posts today across all accounts:</span>
                  <span className="font-bold text-orange-900">
                    {stats.dailyLimitUsed} / {stats.dailyLimitTotal}
                  </span>
                </div>
                <div className="w-full bg-orange-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((stats.dailyLimitUsed / stats.dailyLimitTotal) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-orange-600">
                  Instagram API allows 25 posts per account per 24 hours. Connect multiple accounts to increase your daily limit.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Start Guide */}
        {instagramAccounts.length === 0 && (
          <Card className="mb-6 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Instagram className="h-5 w-5 text-purple-600" />
                Getting Started with Instagram
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">📝 Setup Checklist:</h4>
                  <ol className="space-y-2 text-sm text-purple-800">
                    <li>✓ Convert your Instagram account to Business or Creator account</li>
                    <li>✓ Connect Instagram to a Facebook Page</li>
                    <li>✓ Get Instagram API credentials from Meta for Developers</li>
                    <li>✓ Add credentials to your .env file (INSTAGRAM_APP_ID, INSTAGRAM_APP_SECRET)</li>
                    <li>✓ Use "Connect Instagram Account" button to link your account</li>
                  </ol>
                </div>
                
                <div className="flex gap-3">
                  <Button variant="outline" onClick={downloadTemplate}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Download CSV Template
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                    disabled
                  >
                    <Instagram className="mr-2 h-4 w-4" />
                    Connect Instagram Account
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500">
                  💡 Tip: After connecting, you can schedule up to 25 posts per account per day
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Connected Accounts */}
        {instagramAccounts.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {instagramAccounts.map((account: any) => (
              <Card key={account.id} className="border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Instagram className="h-5 w-5 text-purple-600" />
                    @{account.username}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Posts today:</span>
                      <span className="font-semibold">{account.dailyPostCount || 0} / 25</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${Math.min(((account.dailyPostCount || 0) / 25) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Status: {account.isActive ? '✅ Active' : '❌ Inactive'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Recent Instagram Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Instagram Posts</CardTitle>
          </CardHeader>
          <CardContent>
            {instagramPosts.length === 0 ? (
              <div className="text-center py-12">
                <Instagram className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No Instagram posts yet</p>
                <Button 
                  onClick={() => csvFileInputRef.current?.click()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import Your First Posts
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {instagramPosts.slice(0, 10).map((post: any) => (
                  <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{post.content.substring(0, 100)}...</p>
                      <div className="flex gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          post.status === 'published' ? 'bg-green-100 text-green-800' :
                          post.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          post.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {post.status}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                          {post.mediaType}
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {post.scheduledFor ? new Date(post.scheduledFor).toLocaleString() : 'No date'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CSV Import Dialog */}
      <Dialog open={csvImportDialogOpen} onOpenChange={setCsvImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-purple-600" />
              Import Instagram Posts
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-800 mb-2">File Selected:</h4>
              <p className="text-sm text-purple-700">{csvFile?.name}</p>
            </div>
            
            <div>
              <Label htmlFor="instagram-account">Select Instagram Account (Optional)</Label>
              <Select value={selectedInstagramAccount} onValueChange={setSelectedInstagramAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Use account from CSV or select here..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multi-account">
                    🎯 Multi-Account (Use accountUsername from CSV)
                  </SelectItem>
                  {instagramAccounts.length > 0 ? (
                    instagramAccounts.map((account: any) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        @{account.username} ({(account.dailyPostCount || 0)}/25 posts today)
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-accounts" disabled>
                      No Instagram accounts connected
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-2">
                💡 Leave as "Multi-Account" to use accountUsername column from CSV, or select a specific account to post all rows to that account
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">🎯 Multi-Account Import</h4>
              <p className="text-sm text-blue-800 mb-2">
                You can now specify different accounts in your CSV file!
              </p>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Option 1:</strong> Add "accountUsername" column to CSV (e.g., account1, account2)</p>
                <p><strong>Option 2:</strong> Select one account above to use for all posts</p>
                <p className="mt-2 pt-2 border-t border-blue-200">
                  <strong>Example CSV:</strong> caption,scheduledFor,mediaUrl,mediaType,<strong className="text-blue-900">accountUsername</strong>
                </p>
              </div>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-800">
                <strong>⚠️ Instagram API Limit:</strong> 25 posts per account per 24 hours
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setCsvImportDialogOpen(false);
                  setCsvFile(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => csvImportMutation.mutate(selectedInstagramAccount)}
                disabled={!selectedInstagramAccount || csvImportMutation.isPending}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {csvImportMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Posts
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

