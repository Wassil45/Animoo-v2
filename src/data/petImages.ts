// Pixel-perfect SVG vector pet portraits encoded as Data URIs (no external dependencies, 100% offline-ready)

function createPetSvgDataUrl(bgFrom: string, bgTo: string, emoji: string, badgeEmoji: string, label: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgFrom}" />
        <stop offset="100%" stop-color="${bgTo}" />
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0.2" />
      </radialGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.3" />
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)" />
    <rect width="100%" height="100%" fill="url(#glow)" />
    <circle cx="200" cy="230" r="130" fill="#ffffff" fill-opacity="0.15" />
    <circle cx="200" cy="230" r="105" fill="#ffffff" fill-opacity="0.2" />
    <g filter="url(#shadow)">
      <text x="200" y="275" font-size="120" text-anchor="middle" dominant-baseline="central">${emoji}</text>
    </g>
    <circle cx="280" cy="140" r="28" fill="#ffffff" filter="url(#shadow)" />
    <text x="280" y="148" font-size="28" text-anchor="middle">${badgeEmoji}</text>
    <rect x="50" y="410" width="300" height="44" rx="22" fill="#ffffff" fill-opacity="0.25" backdrop-filter="blur(10px)" />
    <text x="200" y="438" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="18" fill="#ffffff" text-anchor="middle" letter-spacing="1">${label.toUpperCase()}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function createUserSvgDataUrl(bgFrom: string, bgTo: string, emoji: string, name: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <defs>
      <linearGradient id="userBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgFrom}" />
        <stop offset="100%" stop-color="${bgTo}" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#userBg)" rx="100" />
    <circle cx="100" cy="100" r="80" fill="#ffffff" fill-opacity="0.2" />
    <text x="100" y="115" font-size="64" text-anchor="middle" dominant-baseline="central">${emoji}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const PET_IMAGES = {
  milo: [
    createPetSvgDataUrl('#3B82F6', '#1E3A8A', '🐶', '🎾', 'Milo • Berger Australien'),
    createPetSvgDataUrl('#2563EB', '#1D4ED8', '🐕', '⚡', 'Milo en pleine course'),
    createPetSvgDataUrl('#60A5FA', '#1E40AF', '🦮', '🦴', 'Milo prêt à jouer'),
  ],
  nala: [
    createPetSvgDataUrl('#F59E0B', '#B45309', '🦮', '🎾', 'Nala • Golden Retriever'),
    createPetSvgDataUrl('#FBBF24', '#D97706', '🐶', '☀️', 'Nala au soleil'),
    createPetSvgDataUrl('#FCD34D', '#B45309', '🐕', '💖', 'Nala très joueuse'),
  ],
  rocky: [
    createPetSvgDataUrl('#10B981', '#065F46', '🐕', '🥏', 'Rocky • Bouledogue'),
    createPetSvgDataUrl('#34D399', '#047857', '🐶', '🧀', 'Rocky rigolo'),
  ],
  lunaDog: [
    createPetSvgDataUrl('#8B5CF6', '#4C1D95', '🐕‍🦺', '🏃‍♀️', 'Luna • Border Collie'),
    createPetSvgDataUrl('#A78BFA', '#5B21B6', '🐶', '🧠', 'Luna agility'),
  ],
  simbaCat: [
    createPetSvgDataUrl('#EC4899', '#9D174D', '🐱', '🐆', 'Simba • Bengal'),
    createPetSvgDataUrl('#F472B6', '#BE185D', '🐈', '🦮', 'Simba en balade'),
  ],
  lunaCat: [
    createPetSvgDataUrl('#6366F1', '#3730A3', '🐈‍⬛', '💤', 'Luna • British Shorthair'),
    createPetSvgDataUrl('#818CF8', '#312E81', '🐱', '✨', 'Luna câline'),
  ],
  barney: [
    createPetSvgDataUrl('#D97706', '#78350F', '🐕', '🧸', 'Barney • Bouvier Bernois'),
    createPetSvgDataUrl('#F59E0B', '#92400E', '🐶', '🏔️', 'Barney géant doux'),
  ],
  maya: [
    createPetSvgDataUrl('#0EA5E9', '#0369A1', '🐶', '🌊', 'Maya • Berger Australien'),
    createPetSvgDataUrl('#38BDF8', '#075985', '🐕', '🐾', 'Maya nageuse'),
  ],
};

export const USER_AVATARS = {
  wassil: createUserSvgDataUrl('#3B82F6', '#1E40AF', '👨🏻‍💻', 'Wassil'),
  alexandre: createUserSvgDataUrl('#EF4444', '#991B1B', '👑', 'Alexandre Admin'),
  sophie: createUserSvgDataUrl('#EC4899', '#BE185D', '👩🏼', 'Sophie'),
  thomas: createUserSvgDataUrl('#10B981', '#047857', '🧔🏻', 'Thomas'),
  antoine: createUserSvgDataUrl('#8B5CF6', '#5B21B6', '👱🏻‍♂️', 'Antoine'),
  camille: createUserSvgDataUrl('#F59E0B', '#B45309', '👩🏻', 'Camille'),
};
