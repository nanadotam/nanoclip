const adjectives = [
  'Swift', 'Bright', 'Clever', 'Daring', 'Eager',
  'Fierce', 'Gentle', 'Happy', 'Jolly', 'Kind',
  'Lively', 'Mighty', 'Noble', 'Proud', 'Quick',
  'Radiant', 'Smart', 'Brave', 'Wise', 'Zesty'
];

const animals = [
  'Dolphin', 'Eagle', 'Fox', 'Gazelle', 'Hawk',
  'Jaguar', 'Koala', 'Lion', 'Meerkat', 'Owl',
  'Panther', 'Rabbit', 'Tiger', 'Wolf', 'Zebra',
  'Bear', 'Deer', 'Falcon', 'Lynx', 'Puma'
];

export function generateDeviceName(existingNames = []) {
  let name;
  do {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    name = `${adjective}${animal}`;
  } while (existingNames.includes(name));
  
  return name;
}

export function detectDeviceType() {
  const ua = navigator.userAgent;
  let deviceType = 'Unknown';
  let brand = 'Unknown';
  let os = 'Unknown';

  // Detect OS
  if (/(iPhone|iPad|iPod)/i.test(ua)) {
    os = 'iOS';
    brand = 'Apple';
    deviceType = /(iPad)/i.test(ua) ? 'Tablet' : 'Mobile';
  } else if (/Android/i.test(ua)) {
    os = 'Android';
    deviceType = /Mobile/i.test(ua) ? 'Mobile' : 'Tablet';
    
    // Try to detect Android brand
    const brandMatch = ua.match(/(Samsung|Huawei|Xiaomi|OnePlus|LG|Sony|HTC|Google)/i);
    if (brandMatch) {
      brand = brandMatch[1];
    }
  } else if (/Windows/i.test(ua)) {
    os = 'Windows';
    brand = 'PC';
    deviceType = 'Desktop';
  } else if (/Macintosh/i.test(ua)) {
    os = 'macOS';
    brand = 'Apple';
    deviceType = 'Desktop';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
    brand = 'PC';
    deviceType = 'Desktop';
  }

  return {
    type: deviceType,
    brand,
    os,
    userAgent: ua
  };
}

export function getDetailedDeviceInfo(existingNames = []) {
  const deviceInfo = detectDeviceType();
  return {
    name: generateDeviceName(existingNames),
    ...deviceInfo,
    id: Math.random().toString(36).substr(2, 9)
  };
} 