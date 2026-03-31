// types/notifications.ts

export type NotificationType = 
  | 'candidature_received'
  | 'candidature_status_change'
  | 'candidature_reminder'
  | 'new_opportunity'
  | 'profile_submitted'
  | 'project_submitted'
  | 'pre_inscription_received'
  | 'contact_message_received'
  | 'system_message';

export interface NotificationData {
  candidature_id?: string;
  opportunite_id?: string;
  candidat_name?: string;
  candidat_email?: string;
  opportunity_title?: string;
  old_status?: string;
  new_status?: string;
  [key: string]: any;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: NotificationData | null;
  read: boolean;
  created_at: string;
  read_at: string | null;
}

export interface NotificationWithActions extends Notification {
  actionUrl?: string;
  actionLabel?: string;
}