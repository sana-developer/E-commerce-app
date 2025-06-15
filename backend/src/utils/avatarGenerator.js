// Generate initials avatar (for full names)
export const generateInitialsAvatar = (name, size = 100) => {
  if (!name || typeof name !== 'string') {
    return generateAvatarUrl('User', size);
  }

  const nameParts = name.trim().split(' ');
  let initials = '';
  
  if (nameParts.length >= 2) {
    initials = nameParts[0].charAt(0) + nameParts[1].charAt(0);
  } else {
    initials = nameParts[0].charAt(0);
  }
  
  initials = initials.toUpperCase();

  const colorCombos = [
    { bg: 'A7F3D0', color: '047857' },
    { bg: 'BFDBFE', color: '1D4ED8' },
    { bg: 'FDE68A', color: 'D97706' },
    { bg: 'F3E8FF', color: '7C3AED' },
    { bg: 'FECACA', color: 'DC2626' },
    { bg: 'FFE4E6', color: 'E11D48' },
    { bg: 'D1FAE5', color: '059669' },
    { bg: 'DBEAFE', color: '2563EB' },
    { bg: 'FEF3C7', color: 'F59E0B' },
    { bg: 'E0E7FF', color: '6366F1' },
  ];

  const colorIndex = initials.charCodeAt(0) % colorCombos.length;
  const selectedCombo = colorCombos[colorIndex];

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size}&background=${selectedCombo.bg}&color=${selectedCombo.color}&rounded=true&bold=true`;
};