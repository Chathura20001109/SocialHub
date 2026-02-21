// client/assets/js/components/notifications.js
const NotificationComponent = {
    async showModal() {
        const modalContent = document.createElement('div');
        modalContent.className = 'notifications-modal';
        modalContent.innerHTML = '<div class="text-center p-lg"><div class="spinner"></div></div>';

        const modal = Utils.createModal('Notifications', modalContent);

        try {
            const response = await API.getNotifications(1, 20);
            const notifications = response.data.notifications;

            if (notifications.length === 0) {
                modalContent.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">🔔</div>
                        <h3 class="empty-state-title">No notifications yet</h3>
                        <p class="empty-state-text">When people interact with you, you'll see it here.</p>
                    </div>
                `;
            } else {
                modalContent.innerHTML = '';
                const list = document.createElement('div');
                list.className = 'notifications-list';

                notifications.forEach(notif => {
                    const item = document.createElement('div');
                    item.className = `notification-item ${notif.isRead ? '' : 'unread'}`;

                    const senderAvatar = notif.sender.profileImage || `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzFmMjkzNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkeT0iLjM1ZW0iIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM2MzY2ZjEiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWkiPlNIPC90ZXh0Pjwvc3ZnPg==`;
                    const senderName = notif.sender.username || 'Someone';

                    item.innerHTML = `
                        <div class="notification-avatar">
                            <img src="${senderAvatar}" alt="${senderName}" class="avatar avatar-sm">
                        </div>
                        <div class="notification-body">
                            <p class="notification-text">
                                <strong>${Utils.escapeHtml(senderName)}</strong> 
                                ${Utils.escapeHtml(notif.message || this.getNotificationText(notif))}
                            </p>
                            <span class="notification-time">${Utils.formatTimeAgo(notif.createdAt)}</span>
                        </div>
                    `;

                    item.onclick = () => this.handleNotificationClick(notif, modal);
                    list.appendChild(item);
                });

                modalContent.appendChild(list);

                // Add "Mark all as read" button if there are unread notifications
                const hasUnread = notifications.some(n => !n.isRead);
                if (hasUnread) {
                    const markAllBtn = document.createElement('button');
                    markAllBtn.className = 'btn btn-secondary btn-sm btn-full mt-md';
                    markAllBtn.textContent = 'Mark all as read';
                    markAllBtn.onclick = async (e) => {
                        e.stopPropagation();
                        await API.markAllAsRead();
                        this.showModal(); // Refresh modal
                        if (typeof loadNotificationCount === 'function') loadNotificationCount();
                    };
                    modalContent.appendChild(markAllBtn);
                }
            }
        } catch (error) {
            modalContent.innerHTML = '<p class="text-center p-lg text-muted">Failed to load notifications</p>';
            Utils.handleError(error);
        }
    },

    getNotificationText(notif) {
        if (notif.message) return notif.message;
        switch (notif.type) {
            case 'like': return 'liked your post';
            case 'comment': return 'commented on your post';
            case 'follow': return 'started following you';
            case 'mention': return 'mentioned you in a post';
            default: return 'interacted with you';
        }
    },

    async handleNotificationClick(notif, modal) {
        if (!notif.isRead) {
            await API.markAsRead(notif._id);
            if (typeof loadNotificationCount === 'function') loadNotificationCount();
        }

        modal.remove();

        // Redirect based on type
        if (notif.type === 'like' || notif.type === 'comment' || notif.type === 'mention') {
            window.location.href = `feed.html#post-${notif.post}`;
        } else if (notif.type === 'follow') {
            window.location.href = `profile.html?user=${notif.sender._id}`;
        }
    }
};

window.NotificationComponent = NotificationComponent;
