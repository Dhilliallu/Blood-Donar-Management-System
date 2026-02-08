// API helper function
async function apiCall(url, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Request failed');
    }

    return result;
}

// Check authentication
async function checkAuth() {
    try {
        const user = await apiCall('/api/auth/me');
        return user;
    } catch (error) {
        return null;
    }
}

// Logout function
async function logout() {
    try {
        await apiCall('/api/auth/logout', 'POST');
        window.location.href = '/';
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();
}

// WebSocket connection
let ws = null;

function connectWebSocket(onMessage) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);
            if (onMessage) {
                onMessage(message);
            }
        } catch (error) {
            console.error('WebSocket message error:', error);
        }
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
        console.log('WebSocket disconnected. Reconnecting...');
        setTimeout(() => connectWebSocket(onMessage), 3000);
    };
}

function disconnectWebSocket() {
    if (ws) {
        ws.close();
        ws = null;
    }
}

// Show notification
function showNotification(title, message, type = 'info') {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: message,
            icon: '/favicon.ico'
        });
    }
}

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}
