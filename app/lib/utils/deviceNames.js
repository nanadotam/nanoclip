const adjectives = ['Curious', 'Clever', 'Bright', 'Swift', 'Gentle', 'Nimble', 'Wise', 'Brave', 'Noble', 'Radiant', 'Agile', 'Daring', 'Eager', 'Graceful', 'Humble'];
const nouns = ['Messenger', 'Explorer', 'Pioneer', 'Voyager', 'Navigator', 'Wanderer', 'Seeker', 'Pathfinder', 'Adventurer', 'Discoverer', 'Traveler', 'Guardian', 'Scholar', 'Ranger', 'Guide'];

export function generateDeviceName(existingNames = []) {
  let deviceName;
  do {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const uniqueSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    deviceName = `${adjective} ${noun} ${uniqueSuffix}`;
  } while (existingNames.includes(deviceName));
  
  return deviceName;
}

export function detectDeviceType() {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android/i.test(ua)) return 'phone';
  return 'laptop';
}

export function getDetailedDeviceInfo(existingNames = []) {
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  
  // Enhanced device type detection
  let deviceType = 'laptop';
  let deviceBrand = 'Unknown';
  let osName = 'Unknown';
  let osVersion = 'Unknown';

  // Detect OS
  if (ua.includes('Windows')) {
    osName = 'Windows';
    osVersion = ua.match(/Windows NT (\d+\.\d+)/) ? ua.match(/Windows NT (\d+\.\d+)/)[1] : '';
  } else if (ua.includes('Mac OS')) {
    osName = 'macOS';
    osVersion = ua.match(/Mac OS X (\d+[._]\d+)/) ? ua.match(/Mac OS X (\d+[._]\d+)/)[1].replace('_', '.') : '';
  } else if (ua.includes('Linux')) {
    osName = 'Linux';
  } else if (ua.includes('iOS')) {
    osName = 'iOS';
    deviceType = ua.includes('iPad') ? 'tablet' : 'phone';
  } else if (ua.includes('Android')) {
    osName = 'Android';
    deviceType = ua.includes('Mobile') ? 'phone' : 'tablet';
  }

  // Detect device brand
  if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('Mac')) {
    deviceBrand = 'Apple';
  } else if (ua.includes('Samsung')) {
    deviceBrand = 'Samsung';
  } else if (ua.includes('Huawei')) {
    deviceBrand = 'Huawei';
  } else if (ua.includes('Pixel')) {
    deviceBrand = 'Google';
  }

  const deviceInfo = {
    name: generateDeviceName(existingNames),
    type: deviceType,
    brand: deviceBrand,
    os: {
      name: osName,
      version: osVersion
    },
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