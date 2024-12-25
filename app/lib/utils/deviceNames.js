const adjectives = ['Curious', 'Clever', 'Bright', 'Swift', 'Gentle', 'Nimble', 'Wise', 'Brave', 'Noble', 'Radiant', 'Agile', 'Daring', 'Eager', 'Graceful', 'Humble'];
const nouns = ['Messenger', 'Explorer', 'Pioneer', 'Voyager', 'Navigator', 'Wanderer', 'Seeker', 'Pathfinder', 'Adventurer', 'Discoverer', 'Traveler', 'Guardian', 'Scholar', 'Ranger', 'Guide'];

export function generateDeviceName() {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective} ${noun}`;
}

export function detectDeviceType() {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android/i.test(ua)) return 'phone';
  return 'laptop';
}

export function getDetailedDeviceInfo() {
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  
  const deviceInfo = {
    type: detectDeviceType(),
    name: generateDeviceName(),
    platform: platform,
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      pixelRatio: window.devicePixelRatio
    },
    browser: detectBrowser(),
    capabilities: {
      webrtc: 'RTCPeerConnection' in window,
      websocket: 'WebSocket' in window,
      fileShare: 'FileReader' in window && 'Blob' in window
    }
  };

  return deviceInfo;
}

function detectBrowser() {
  const ua = navigator.userAgent;
  let browser = 'unknown';
  let version = 'unknown';

  if (ua.includes('Chrome')) {
    browser = 'Chrome';
  } else if (ua.includes('Firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Safari';
  } else if (ua.includes('Edge')) {
    browser = 'Edge';
  }

  return { name: browser, version };
} 