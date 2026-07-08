export const colorPresets = [
  { color: '#667eea', label: 'Ungu' },
  { color: '#10b981', label: 'Hijau' },
  { color: '#ef4444', label: 'Merah' },
  { color: '#3b82f6', label: 'Biru' },
  { color: '#f59e0b', label: 'Kuning' },
  { color: '#ec4899', label: 'Pink' },
  { color: '#06b6d4', label: 'Cyan' },
  { color: '#8b5cf6', label: 'Violet' },
  { color: '#14b8a6', label: 'Teal' },
  { color: '#f97316', label: 'Orange' },
  { color: '#84cc16', label: 'Lime' },
  { color: '#6366f1', label: 'Indigo' }
]

export const gradientPresets = [
  { start: '#667eea', end: '#764ba2', label: 'Ungu Klasik' },
  { start: '#10b981', end: '#14b8a6', label: 'Hijau Fresh' },
  { start: '#ef4444', end: '#ec4899', label: 'Merah Pink' },
  { start: '#3b82f6', end: '#06b6d4', label: 'Biru Ocean' },
  { start: '#f59e0b', end: '#fbbf24', label: 'Kuning Cerah' },
  { start: '#ec4899', end: '#a855f7', label: 'Pink Violet' },
  { start: '#fbbf24', end: '#84cc16', label: 'Kuning Hijau' },
  { start: '#6366f1', end: '#8b5cf6', label: 'Indigo Purple' }
]

export const availableIcons = [
  // Belanja & Makanan
  { name: 'shopping-cart', label: 'Belanja', category: 'shopping', path: 'M9 2l-1 4h12l-1-4H9z', path2: 'M6 6v13a2 2 0 002 2h8a2 2 0 002-2V6' },
  { name: 'shopping-bag', label: 'Tas Belanja', category: 'shopping', path: 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z', path2: 'M3 6h18 M16 10a4 4 0 01-8 0' },
  { name: 'coffee', label: 'Kopi', category: 'food', path: 'M18 8h1a4 4 0 010 8h-1', path2: 'M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z M6 1v3 M10 1v3 M14 1v3' },
  { name: 'utensils', label: 'Restoran', category: 'food', path: 'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2 M7 2v20 M21 15V2 M17 21v-8' },
  { name: 'pizza', label: 'Pizza', category: 'food', path: 'M12 2a10 10 0 1010 10 M12 2L2 12l10 10' },

  // Transport
  { name: 'car', label: 'Mobil', category: 'transport', path: 'M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 002 12v4c0 .6.4 1 1 1h2', path2: 'M7 17a2 2 0 100-4 2 2 0 000 4z M17 17a2 2 0 100-4 2 2 0 000 4z' },
  { name: 'bus', label: 'Bus/Angkot', category: 'transport', path: 'M8 6v6 M16 6v6 M2 18h20 M4 18v3 M20 18v3', path2: 'M4 6h16a2 2 0 012 2v10H2V8a2 2 0 012-2z' },
  { name: 'train', label: 'Kereta', category: 'transport', path: 'M4 15l2 2 M18 15l-2 2', path2: 'M8 12h8 M4 10h16a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2v-6a2 2 0 012-2z M8 6h8a2 2 0 012 2v2H6V8a2 2 0 012-2z' },
  { name: 'bicycle', label: 'Sepeda', category: 'transport', path: 'M5 19a4 4 0 100-8 4 4 0 000 8z M19 19a4 4 0 100-8 4 4 0 000 8z', path2: 'M12 11l-3 4 M12 11l3 4 M9 11l3-8 M15 5h-3' },
  { name: 'plane', label: 'Pesawat', category: 'transport', path: 'M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z' },
  { name: 'fuel', label: 'Bensin', category: 'transport', path: 'M3 2h10v18H3z M6 18h4', path2: 'M13 6h3a2 2 0 012 2v10 M18 12h2 M13 2v4' },

  // Rumah & Utilitas
  { name: 'home', label: 'Rumah', category: 'home', path: 'm3 9 9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z', path2: 'M9 22V12h6v10' },
  { name: 'zap', label: 'Listrik', category: 'utilities', path: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
  { name: 'wifi', label: 'Internet', category: 'utilities', path: 'M5 12.55a11 11 0 0114.08 0 M1.42 9a16 16 0 0121.16 0 M8.53 16.11a6 6 0 016.95 0', path2: 'M12 20h.01' },
  { name: 'droplet', label: 'Air', category: 'utilities', path: 'M12 2.69l5.66 5.66a8 8 0 11-11.31 0z' },
  { name: 'flame', label: 'Gas', category: 'utilities', path: 'M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z' },

  // Teknologi
  { name: 'smartphone', label: 'HP/Pulsa', category: 'tech', path: 'M17 2H7a2 2 0 00-2 2v16c0 1.1.9 2 2 2h10a2 2 0 002-2V4a2 2 0 00-2-2z', path2: 'M12 18h.01' },
  { name: 'laptop', label: 'Laptop', category: 'tech', path: 'M20 16V7a2 2 0 00-2-2H6a2 2 0 00-2 2v9', path2: 'M2 20h20' },
  { name: 'tv', label: 'TV/Streaming', category: 'tech', path: 'M20 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z', path2: 'M17 2l-5 5-5-5' },
  { name: 'headphones', label: 'Audio', category: 'tech', path: 'M3 18v-6a9 9 0 0118 0v6', path2: 'M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z' },

  // Kesehatan & Olahraga
  { name: 'heart', label: 'Kesehatan', category: 'health', path: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z' },
  { name: 'pill', label: 'Obat', category: 'health', path: 'M4.5 16.5a7 7 0 1110-10l-10 10z', path2: 'M14.5 9.5a7 7 0 11-10 10l10-10z M8.5 15.5l7-7' },
  { name: 'hospital', label: 'Rumah Sakit', category: 'health', path: 'M11 2h2v20h-2z M2 13h20 M5 2h14a2 2 0 012 2v16a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2z' },
  { name: 'dumbbell', label: 'Gym/Fitness', category: 'health', path: 'M6.5 6L3 12l3.5 6 M17.5 6L21 12l-3.5 6', path2: 'M12 4v16 M6.5 12h11' },

  // Pendidikan & Pekerjaan
  { name: 'book', label: 'Buku', category: 'education', path: 'M4 19.5A2.5 2.5 0 016.5 17H20', path2: 'M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z' },
  { name: 'graduation-cap', label: 'Pendidikan', category: 'education', path: 'M22 10l-10-5-10 5 10 5z', path2: 'M6 12v5c3 3 9 3 12 0v-5' },
  { name: 'briefcase', label: 'Pekerjaan', category: 'work', path: 'M16 20V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v16', path2: 'M8 6H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-4' },
  { name: 'file-text', label: 'Dokumen', category: 'work', path: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z', path2: 'M14 2v6h6 M16 13H8 M16 17H8 M10 9H8' },

  // Hiburan
  { name: 'film', label: 'Film', category: 'entertainment', path: 'M19.82 2H4.18A2.18 2.18 0 002 4.18v15.64A2.18 2.18 0 004.18 22h15.64A2.18 2.18 0 0022 19.82V4.18A2.18 2.18 0 0019.82 2z', path2: 'M7 2v20 M17 2v20 M2 12h20 M2 7h5 M2 17h5 M17 17h5 M17 7h5' },
  { name: 'music', label: 'Musik', category: 'entertainment', path: 'M9 18V5l12-2v13', path2: 'M9 18a3 3 0 11-6 0 3 3 0 016 0z M21 16a3 3 0 11-6 0 3 3 0 016 0z' },
  { name: 'gamepad', label: 'Game', category: 'entertainment', path: 'M6 12h4 M8 10v4', path2: 'M15.5 12h.01 M18.5 12h.01 M6 15l-3 2a3 3 0 01-3-3V9a3 3 0 013-3h18a3 3 0 013 3v5a3 3 0 01-3 3l-3-2' },
  { name: 'palette', label: 'Seni/Hobi', category: 'entertainment', path: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z', path2: 'M7.5 10.5h.01 M12 7.5h.01 M16.5 10.5h.01 M12 16.5h.01' },

  // Keuangan
  { name: 'dollar', label: 'Gaji', category: 'finance', path: 'M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
  { name: 'credit-card', label: 'Kartu Kredit', category: 'finance', path: 'M1 10h22 M3 6h18a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2z' },
  { name: 'bank', label: 'Bank', category: 'finance', path: 'M3 21h18 M3 10h18', path2: 'M5 10V21 M9 10v11 M15 10v11 M19 10v11 M2 10l10-8 10 8' },
  { name: 'trending-up', label: 'Investasi', category: 'finance', path: 'M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6' },
  { name: 'wallet', label: 'Dompet', category: 'finance', path: 'M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5', path2: 'M16 12h5' },

  // Lain-lain
  { name: 'gift', label: 'Hadiah', category: 'other', path: 'M20 12v10H4V12', path2: 'M2 7h20v5H2z M12 22V7 M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z' },
  { name: 'users', label: 'Keluarga', category: 'other', path: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2', path2: 'M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75' },
  { name: 'paw', label: 'Hewan Peliharaan', category: 'other', path: 'M11 21a16 16 0 001.891-9.96', path2: 'M8.5 10.5l1.5 2.5 M6 7a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z M15.5 10.5L14 13 M18 7a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z M8.5 3.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z M15.5 3.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' },
  { name: 'scissors', label: 'Perawatan', category: 'other', path: 'M6 17a3 3 0 100-6 3 3 0 000 6z M18 17a3 3 0 100-6 3 3 0 000 6z', path2: 'M20 4L8.12 15.88 M14.47 14.48L20 20 M8.12 8.12L12 12' },
  { name: 'umbrella', label: 'Asuransi', category: 'other', path: 'M23 12a11.05 11.05 0 00-22 0z M12 12v8a2 2 0 004 0' },
  { name: 'tool', label: 'Perbaikan', category: 'other', path: 'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z' },
  { name: 'send', label: 'Transfer', category: 'finance', path: 'M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z' }
]
