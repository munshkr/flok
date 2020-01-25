class SessionManager {
  constructor(ctx) {
    const { webSocketsUrl } = ctx;
    this.webSocketsUrl = webSocketsUrl;
  }
}

export default SessionManager;
