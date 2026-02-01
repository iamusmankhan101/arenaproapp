import { DEV_CONFIG } from '../config/devConfig';
import { store } from '../store/store';
import { fetchDashboardStats, updateBookingStatus, updateVenueStatus, updateCustomerStatus } from '../store/slices/adminSlice';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000; // 5 seconds
    this.isConnected = false;
    this.messageQueue = [];
  }

  // Connect to WebSocket server
  connect(token) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = DEV_CONFIG.API_BASE_URL.replace('http', 'ws').replace('/api', '/ws');
    
    try {
      this.ws = new WebSocket(`${wsUrl}?token=${token}`);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Send queued messages
        this.processMessageQueue();
        
        // Subscribe to admin events
        this.subscribe('admin_updates');
      };
      
      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.attemptReconnect(token);
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnected = false;
      };
      
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.attemptReconnect(token);
    }
  }

  // Disconnect from WebSocket
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
    }
  }

  // Attempt to reconnect
  attemptReconnect(token) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect(token);
    }, this.reconnectInterval);
  }

  // Send message to server
  send(message) {
    if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for later
      this.messageQueue.push(message);
    }
  }

  // Process queued messages
  processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  // Subscribe to specific events
  subscribe(eventType) {
    this.send({
      type: 'subscribe',
      event: eventType
    });
  }

  // Unsubscribe from events
  unsubscribe(eventType) {
    this.send({
      type: 'unsubscribe',
      event: eventType
    });
  }

  // Handle incoming messages
  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      console.log('WebSocket message received:', message);
      
      switch (message.type) {
        case 'booking_updated':
          this.handleBookingUpdate(message.data);
          break;
          
        case 'venue_updated':
          this.handleVenueUpdate(message.data);
          break;
          
        case 'customer_updated':
          this.handleCustomerUpdate(message.data);
          break;
          
        case 'new_booking':
          this.handleNewBooking(message.data);
          break;
          
        case 'stats_updated':
          this.handleStatsUpdate();
          break;
          
        case 'notification':
          this.handleNotification(message.data);
          break;
          
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  // Handle booking updates
  handleBookingUpdate(data) {
    const dispatch = store.dispatch;
    dispatch(updateBookingStatus({
      bookingId: data.bookingId,
      status: data.status
    }));
  }

  // Handle venue updates
  handleVenueUpdate(data) {
    const dispatch = store.dispatch;
    dispatch(updateVenueStatus({
      venueId: data.venueId,
      status: data.status
    }));
  }

  // Handle customer updates
  handleCustomerUpdate(data) {
    const dispatch = store.dispatch;
    dispatch(updateCustomerStatus({
      customerId: data.customerId,
      status: data.status
    }));
  }

  // Handle new bookings
  handleNewBooking(data) {
    // Refresh dashboard stats and bookings list
    const dispatch = store.dispatch;
    dispatch(fetchDashboardStats());
    
    // Show notification if available
    if (global.showNotification) {
      global.showNotification({
        title: 'New Booking',
        message: `New booking from ${data.customerName}`,
        type: 'success'
      });
    }
  }

  // Handle stats updates
  handleStatsUpdate() {
    const dispatch = store.dispatch;
    dispatch(fetchDashboardStats());
  }

  // Handle notifications
  handleNotification(data) {
    if (global.showNotification) {
      global.showNotification({
        title: data.title,
        message: data.message,
        type: data.type || 'info'
      });
    }
  }

  // Get connection status
  getStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length
    };
  }
}

// Create singleton instance
export const wsService = new WebSocketService();

// Initialize WebSocket connection for admin
export const initializeAdminWebSocket = (token) => {
  if (DEV_CONFIG.ENABLE_WEBSOCKET !== false) {
    wsService.connect(token);
  }
};

// Close WebSocket connection
export const closeAdminWebSocket = () => {
  wsService.disconnect();
};

export default wsService;