import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  sender_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  receiver_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function useFriendRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      if (error) throw error;

      // Fetch profiles for all requests
      const userIds = new Set<string>();
      data?.forEach(req => {
        userIds.add(req.sender_id);
        userIds.add(req.receiver_id);
      });

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', Array.from(userIds));

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

      const enrichedRequests = (data || []).map(req => ({
        ...req,
        sender_profile: profileMap.get(req.sender_id),
        receiver_profile: profileMap.get(req.receiver_id),
      })) as FriendRequest[];

      setRequests(enrichedRequests);

      // Extract friends (accepted requests)
      const friendIds = enrichedRequests
        .filter(r => r.status === 'accepted')
        .map(r => r.sender_id === user.id ? r.receiver_id : r.sender_id);
      setFriends(friendIds);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRequests();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('friend-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_requests',
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRequests]);

  const sendRequest = async (receiverId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('friend_requests')
      .insert({ sender_id: user.id, receiver_id: receiverId });

    if (!error) fetchRequests();
    return { error };
  };

  const acceptRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('friend_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    if (!error) fetchRequests();
    return { error };
  };

  const rejectRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('friend_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);

    if (!error) fetchRequests();
    return { error };
  };

  const cancelRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('friend_requests')
      .delete()
      .eq('id', requestId);

    if (!error) fetchRequests();
    return { error };
  };

  const getRequestStatus = (userId: string): 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'rejected' => {
    const request = requests.find(
      r => (r.sender_id === userId || r.receiver_id === userId) && 
           (r.sender_id === user?.id || r.receiver_id === user?.id)
    );

    if (!request) return 'none';
    if (request.status === 'accepted') return 'accepted';
    if (request.status === 'rejected') return 'rejected';
    if (request.sender_id === user?.id) return 'pending_sent';
    return 'pending_received';
  };

  const getRequestForUser = (userId: string) => {
    return requests.find(
      r => (r.sender_id === userId || r.receiver_id === userId) && 
           (r.sender_id === user?.id || r.receiver_id === user?.id)
    );
  };

  const pendingReceivedRequests = requests.filter(
    r => r.receiver_id === user?.id && r.status === 'pending'
  );

  return {
    requests,
    friends,
    loading,
    sendRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    getRequestStatus,
    getRequestForUser,
    pendingReceivedRequests,
    refetch: fetchRequests,
  };
}
