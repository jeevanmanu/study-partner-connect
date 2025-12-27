import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFriendRequests } from '@/hooks/useFriendRequests';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Clock, Check, X, MessageCircle, Loader2 } from 'lucide-react';

interface FriendRequestButtonProps {
  userId: string;
  className?: string;
}

export function FriendRequestButton({ userId, className }: FriendRequestButtonProps) {
  const { sendRequest, acceptRequest, rejectRequest, cancelRequest, getRequestStatus, getRequestForUser } = useFriendRequests();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const status = getRequestStatus(userId);
  const request = getRequestForUser(userId);

  const handleSendRequest = async () => {
    setLoading(true);
    const { error } = await sendRequest(userId);
    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Request Sent",
        description: "Friend request sent successfully!",
      });
    }
  };

  const handleAccept = async () => {
    if (!request) return;
    setLoading(true);
    const { error } = await acceptRequest(request.id);
    setLoading(false);

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

  const handleReject = async () => {
    if (!request) return;
    setLoading(true);
    const { error } = await rejectRequest(request.id);
    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive",
      });
    }
  };

  const handleCancel = async () => {
    if (!request) return;
    setLoading(true);
    const { error } = await cancelRequest(request.id);
    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to cancel request",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Button className={className} disabled>
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  switch (status) {
    case 'accepted':
      return (
        <Button
          className={className}
          onClick={() => navigate(`/messages/${userId}`)}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Message
        </Button>
      );

    case 'pending_sent':
      return (
        <Button className={className} variant="outline" onClick={handleCancel}>
          <Clock className="w-4 h-4 mr-2" />
          Pending
        </Button>
      );

    case 'pending_received':
      return (
        <div className="flex gap-2">
          <Button size="sm" onClick={handleAccept}>
            <Check className="w-4 h-4 mr-1" />
            Accept
          </Button>
          <Button size="sm" variant="outline" onClick={handleReject}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      );

    case 'rejected':
    case 'none':
    default:
      return (
        <Button className={className} variant="outline" onClick={handleSendRequest}>
          <UserPlus className="w-4 h-4 mr-2" />
          Connect
        </Button>
      );
  }
}
