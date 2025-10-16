import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Instagram, Trash2, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { useEffect } from "react";

export default function InstagramAccounts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch Instagram accounts
  const { data: accountsData, isLoading } = useQuery({
    queryKey: ['/api/instagram/accounts'],
    queryFn: async () => {
      const response = await fetch('/api/instagram/accounts');
      return response.json();
    }
  });

  // Ensure we have an array
  const accounts = Array.isArray(accountsData) ? accountsData : [];

  // Handle OAuth connection success/error from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const connected = urlParams.get('connected');
    const username = urlParams.get('username');
    
    if (connected === 'success' && username) {
      toast({
        title: "Instagram Account Connected! 🎉",
        description: `Successfully connected @${username} to your account`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/instagram/accounts'] });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (connected === 'updated' && username) {
      toast({
        title: "Instagram Account Updated! ✅",
        description: `Updated connection for @${username}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/instagram/accounts'] });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast, queryClient]);

  // Connect account mutation
  const connectAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/instagram/auth/connect');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initiate Instagram connection');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Redirect to Instagram OAuth
      window.location.href = data.authUrl;
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect Instagram account",
        variant: "destructive",
      });
    }
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async (accountId: number) => {
      const response = await fetch(`/api/instagram/accounts/${accountId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete account');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/instagram/accounts'] });
      toast({
        title: "Account Disconnected",
        description: "Instagram account has been removed",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to disconnect Instagram account",
        variant: "destructive",
      });
    }
  });

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Instagram className="h-7 w-7 text-purple-600" />
          Instagram Accounts
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Manage your connected Instagram Business accounts
        </p>
      </div>

      {/* Info Card */}
      <Card className="mb-6 border-purple-200 bg-purple-50">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-purple-900">How to Connect Instagram:</h3>
            <ol className="text-sm text-purple-800 space-y-2 list-decimal list-inside">
              <li>Ensure your Instagram account is connected to a Facebook Page</li>
              <li>Make sure your Instagram account is a Business account</li>
              <li>Click "Connect Instagram Account" below</li>
              <li>Authorize the app on Facebook/Instagram</li>
              <li>Your account will be automatically connected!</li>
            </ol>
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded">
              <p className="text-sm text-orange-800">
                <strong>⚠️ Important:</strong> Each Instagram Business account can publish up to 25 posts per 24 hours via the API.
                For 1000-2000 posts/day, you'll need 40-80 connected accounts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accounts List */}
      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-500">Loading Instagram accounts...</p>
        </div>
      ) : accounts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Instagram className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Instagram Accounts Connected
            </h3>
            <p className="text-gray-500 mb-4">
              Connect your Instagram Business account to start publishing
            </p>
            <Button 
              onClick={() => connectAccountMutation.mutate()}
              disabled={connectAccountMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Instagram className="mr-2 h-4 w-4" />
              {connectAccountMutation.isPending ? "Connecting..." : "Connect Instagram Account"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account: any) => (
            <Card key={account.id} className="border-purple-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Instagram className="h-5 w-5 text-purple-600" />
                    @{account.username}
                  </div>
                  {account.isActive ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Daily Posts</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${Math.min(((account.dailyPostCount || 0) / 25) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-purple-900">
                        {account.dailyPostCount || 0}/25
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteAccountMutation.mutate(account.id)}
                      disabled={deleteAccountMutation.isPending}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Disconnect
                    </Button>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Connected: {new Date(account.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

