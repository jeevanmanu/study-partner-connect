import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFriendRequests } from '@/hooks/useFriendRequests';
import { useToast } from '@/components/ui/use-toast';
import { Bell, User, Check, X, Loader2 } from 'lucide-react';

export function FriendRequestsDropdown() {
  const { pendingReceivedRequests, acceptRequest, rejectRequest } = useFriendRequests();
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAccept = async (requestId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoadingId(requestId);
    const { error } = await acceptRequest(requestId);
    setLoadingId(null);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to accept request",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Accepted!",
        description: "You are now friends!",
      });
    }
  };

  const handleReject = async (requestId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoadingId(requestId);
    const { error } = await rejectRequest(requestId);
    setLoadingId(null);

    if (!error) {
      toast({
        title: "Request rejected",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {pendingReceivedRequests.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {pendingReceivedRequests.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Friend Requests</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {pendingReceivedRequests.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No pending requests
          </div>
        ) : (
          pendingReceivedRequests.map(request => (
            <DropdownMenuItem key={request.id} className="p-3 cursor-default" onSelect={(e) => e.preventDefault()}>
              <div className="flex items-center justify-between w-full gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {request.sender_profile?.full_name || 'Anonymous'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Wants to connect
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {loadingId === request.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
                        onClick={(e) => handleAccept(request.id, e)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => handleReject(request.id, e)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
