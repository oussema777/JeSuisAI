'use client';

import React, { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { Bell, Check, CheckCheck, Trash2, Filter } from 'lucide-react';
import { useNotifications } from '@/app/hooks/useNotifications';
import { Notification } from '@/app/types/notifications';
import { Bouton } from '@/app/components/ds/Bouton';

type FilterType = 'all' | 'unread' | 'read';

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [filter, setFilter] = useState<FilterType>('all');

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} minutes`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} heures`;
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} jours`;

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get notification icon based on type
 // This should already be in your file around line 40-50
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'candidature_received':
      return '📨';
    case 'candidature_status_change':
      return '✅';
    case 'candidature_reminder':
      return '⏰';
    case 'new_opportunity':
      return '🎯';
    case 'profile_submitted':
      return '👤';
    case 'project_submitted':
      return '💡';
    case 'pre_inscription_received':
      return '🏢';
    case 'contact_message_received':
      return '✉️';
    default:
      return '📬';
  }
};

  // Get notification action URL
 // Around line 60-70
const getNotificationAction = (notification: Notification) => {
  switch (notification.type) {
    case 'candidature_received':
    case 'candidature_reminder':
      return `/admin/candidatures/${notification.data?.candidature_id}`;
    case 'candidature_status_change':
      return `/admin/mes-candidatures/${notification.data?.candidature_id}`;
    case 'new_opportunity':
      return `/missions/${notification.data?.opportunite_id}`;
    case 'profile_submitted':
      return '/admin/profilesoumis';
    case 'project_submitted':
      return '/admin/projetsoumis';
    case 'pre_inscription_received':
      return '/admin/inscriptions';
    case 'contact_message_received':
      return '/admin/dashboard'; // No specific contact management page yet, redirect to dashboard
    default:
      return null;
  }
};

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    const actionUrl = getNotificationAction(notification);
    if (actionUrl) {
      router.push(actionUrl);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-bg">
      <div className="max-w-4xl mx-auto px-5 md:px-10 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1
                className="text-neutral-900 mb-2"
                style={{ fontSize: '32px', fontWeight: 600 }}
              >
                Notifications
              </h1>
              <p className="text-neutral-600" style={{ fontSize: '16px' }}>
                {unreadCount > 0
                  ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${
                      unreadCount > 1 ? 's' : ''
                    }`
                  : 'Toutes les notifications sont lues'}
              </p>
            </div>

            {unreadCount > 0 && (
              <Bouton
                variant="primaire"
                size="moyen"
                onClick={markAllAsRead}
                icon={<CheckCheck className="w-4 h-4" />}
              >
                Tout marquer lu
              </Bouton>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-neutral-700 border-neutral-200 hover:border-primary'
              }`}
              style={{ fontSize: '14px', fontWeight: 500 }}
            >
              Toutes ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                filter === 'unread'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-neutral-700 border-neutral-200 hover:border-primary'
              }`}
              style={{ fontSize: '14px', fontWeight: 500 }}
            >
              Non lues ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                filter === 'read'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-neutral-700 border-neutral-200 hover:border-primary'
              }`}
              style={{ fontSize: '14px', fontWeight: 500 }}
            >
              Lues ({notifications.length - unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-neutral-200">
              <Bell className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3
                className="text-neutral-700 mb-2"
                style={{ fontSize: '18px', fontWeight: 600 }}
              >
                Aucune notification
              </h3>
              <p className="text-neutral-500" style={{ fontSize: '14px' }}>
                {filter === 'unread'
                  ? 'Toutes vos notifications sont lues'
                  : filter === 'read'
                  ? 'Aucune notification lue'
                  : 'Vous n\'avez aucune notification pour le moment'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`bg-white rounded-xl p-5 border cursor-pointer transition-all hover:shadow-md ${
                  notification.read
                    ? 'border-neutral-200'
                    : 'border-primary/30 bg-primary/5'
                }`}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                        notification.read ? 'bg-neutral-100' : 'bg-primary/10'
                      }`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3
                        className={`text-neutral-900 ${
                          notification.read ? 'font-medium' : 'font-semibold'
                        }`}
                        style={{ fontSize: '16px' }}
                      >
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div className="w-2.5 h-2.5 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>

                    <p
                      className="text-neutral-600 mb-3"
                      style={{ fontSize: '14px', lineHeight: '1.5' }}
                    >
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400" style={{ fontSize: '13px' }}>
                        {formatDate(notification.created_at)}
                      </span>

                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="text-primary hover:text-primary/80 transition-colors p-1.5"
                            title="Marquer comme lu"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="text-neutral-400 hover:text-accent transition-colors p-1.5"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}