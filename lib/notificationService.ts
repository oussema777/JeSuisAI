// lib/notificationService.ts

import { getSupabaseBrowserClient } from './supabase/client';
import { Notification } from '@/app/types/notifications';

export class NotificationService {
  private supabase;

  constructor() {
    this.supabase = getSupabaseBrowserClient();
  }

  /**
   * Subscribe to real-time notification updates
   */
  subscribeToNotifications(
    userId: string,
    onNotification: (notification: Notification) => void,
    onUpdate: (notification: Notification) => void
  ) {
    const channel = this.supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          onNotification(payload.new as Notification);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          onUpdate(payload.new as Notification);
        }
      )
      .subscribe();

    return () => {
      this.supabase.removeChannel(channel);
    };
  }

  /**
   * Fetch all notifications for a user
   */
  async getNotifications(userId: string, limit = 50) {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data as Notification[];
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Mark a single notification as read (scoped to user for security)
   */
  async markAsRead(notificationId: string, userId: string) {
    const { error } = await this.supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string) {
    const { error } = await this.supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification (scoped to user for security)
   */
  async deleteNotification(notificationId: string, userId: string) {
    const { error } = await this.supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Delete all read notifications
   */
  async deleteAllRead(userId: string) {
    const { error } = await this.supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .eq('read', true);

    if (error) {
      console.error('Error deleting read notifications:', error);
      throw error;
    }
  }

  /**
   * Notify admins — filtered by annonceur_id for tenant isolation.
   *
   * - If annonceur_id is provided: notifies admins of that annonceur + all Superadmins
   * - If annonceur_id is null/undefined: notifies only Superadmins (platform-wide events)
   */
  async notifyAdmins(params: {
    type: 'candidature_received' | 'profile_submitted' | 'project_submitted' | 'pre_inscription_received' | 'contact_message_received' | 'new_opportunity' | 'system_message';
    title: string;
    message: string;
    data?: any;
    annonceur_id?: string | null;
    annonceur_ids?: string[];
  }) {
    const targetUserIds: string[] = [];

    // 1. Always notify Superadmins (they see everything)
    const { data: superadmins, error: saError } = await this.supabase
      .from('profiles')
      .select('id')
      .eq('role', 'Superadmin');

    if (saError) {
      console.error('Error fetching superadmins for notification:', saError);
      return;
    }
    if (superadmins) {
      targetUserIds.push(...superadmins.map((sa: { id: string }) => sa.id));
    }

    // 2. Collect annonceur IDs from both params
    const allAnnonceurIds: string[] = [];
    if (params.annonceur_id) allAnnonceurIds.push(params.annonceur_id);
    if (params.annonceur_ids) allAnnonceurIds.push(...params.annonceur_ids);
    const uniqueAnnonceurIds = [...new Set(allAnnonceurIds.filter(Boolean))];

    // 3. If annonceur_ids provided, notify Admins & Annonceurs tied to those annonceurs
    if (uniqueAnnonceurIds.length > 0) {
      const { data: annonceurAdmins, error: aaError } = await this.supabase
        .from('profiles')
        .select('id')
        .in('role', ['Admin', 'Annonceur'])
        .in('annonceur_id', uniqueAnnonceurIds);

      if (aaError) {
        console.error('Error fetching annonceur admins for notification:', aaError);
      }
      if (annonceurAdmins) {
        targetUserIds.push(...annonceurAdmins.map((a: { id: string }) => a.id));
      }
    }

    // Deduplicate
    const uniqueUserIds = [...new Set(targetUserIds)];

    if (uniqueUserIds.length === 0) return;

    // 3. Prepare and insert notifications
    const notificationsToInsert = uniqueUserIds.map(userId => ({
      user_id: userId,
      type: params.type,
      title: params.title,
      message: params.message,
      data: params.data || null,
      read: false,
    }));

    const { error: insertError } = await this.supabase
      .from('notifications')
      .insert(notificationsToInsert);

    if (insertError) {
      console.error('Error bulk inserting admin notifications:', insertError);
      throw insertError;
    }
  }
}

// Singleton instance
export const notificationService = new NotificationService();
