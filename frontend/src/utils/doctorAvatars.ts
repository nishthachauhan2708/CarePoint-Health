/**
 * CareHealth Point – Professional Medical Avatars
 * Self-contained SVG vector avatars for hospital specialists.
 * 100% local, zero external network dependency, always loads reliably.
 */

// Helper to convert SVG string to data URI
const toDataUri = (svgString: string): string => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
};

// 1. Dr. Aarav Sharma – Male Cardiologist Avatar (Teal accent, stethoscope, professional suit/coat)
export const SVG_AARAV_SHARMA = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <linearGradient id="bg_aarav" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E6FFFA" />
      <stop offset="100%" stop-color="#B2F5EA" />
    </linearGradient>
    <linearGradient id="coat_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#F7FAFC" />
    </linearGradient>
    <linearGradient id="skin_aarav" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E8B896" />
      <stop offset="100%" stop-color="#D99B73" />
    </linearGradient>
  </defs>
  <!-- Background Circle -->
  <rect width="200" height="200" fill="url(#bg_aarav)" />
  
  <!-- Subtle Medical Cross watermark in bg -->
  <path d="M92 20h16v16H92zm0 32h16v16H92z" fill="#319795" opacity="0.12" />
  
  <!-- Shoulders & Clinical White Coat -->
  <path d="M30 200c0-38 32-58 70-58s70 20 70 58z" fill="url(#coat_grad)" />
  <path d="M30 200c0-38 32-58 70-58s70 20 70 58z" fill="none" stroke="#CBD5E0" stroke-width="2" />
  
  <!-- Shirt & Tie -->
  <path d="M85 142l15 32 15-32z" fill="#0D9488" />
  <path d="M96 142h8l-4 35z" fill="#0F766E" />
  <path d="M100 142l-10-18h20z" fill="#F0FDFA" />
  
  <!-- Coat Lapels -->
  <path d="M72 144l20 56H45c-8-12-13-26-15-40l42-16z" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" />
  <path d="M128 144l-20 56h47c8-12 13-26 15-40l-42-16z" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" />

  <!-- Stethoscope -->
  <!-- Tubing around neck -->
  <path d="M68 146c-2 20 10 38 24 38s14-12 14-22" fill="none" stroke="#334155" stroke-width="4.5" stroke-linecap="round" />
  <path d="M132 146c2 20-8 34-18 34" fill="none" stroke="#334155" stroke-width="4.5" stroke-linecap="round" />
  <!-- Chestpiece -->
  <circle cx="106" cy="162" r="7" fill="#64748B" stroke="#0F172A" stroke-width="2" />
  <circle cx="106" cy="162" r="3" fill="#94A3B8" />

  <!-- Neck -->
  <path d="M88 118h24v28H88z" fill="#D99B73" />
  
  <!-- Head & Ears -->
  <ellipse cx="68" cy="95" rx="6" ry="10" fill="url(#skin_aarav)" />
  <ellipse cx="132" cy="95" rx="6" ry="10" fill="url(#skin_aarav)" />
  <ellipse cx="100" cy="95" rx="32" ry="38" fill="url(#skin_aarav)" />

  <!-- Professional Short Hair -->
  <path d="M68 90c-1-18 10-36 32-36s33 18 32 36c-4-8-12-14-20-14-12 0-16 6-24 6-9 0-16-3-20 8z" fill="#1E293B" />
  <path d="M68 90c0-6 3-14 8-18 8-7 38-8 48 0 5 4 8 12 8 18 0-12-7-24-24-24s-28 8-32 24z" fill="#0F172A" />

  <!-- Eyes & Eyebrows -->
  <path d="M80 82c3-2 8-2 11 0" fill="none" stroke="#0F172A" stroke-width="2.5" stroke-linecap="round" />
  <path d="M109 82c3-2 8-2 11 0" fill="none" stroke="#0F172A" stroke-width="2.5" stroke-linecap="round" />
  <circle cx="85" cy="92" r="3.5" fill="#1E293B" />
  <circle cx="115" cy="92" r="3.5" fill="#1E293B" />
  <circle cx="86" cy="91" r="1" fill="#FFFFFF" />
  <circle cx="116" cy="91" r="1" fill="#FFFFFF" />

  <!-- Nose & Gentle Smile -->
  <path d="M100 93v10l4 2" fill="none" stroke="#C28258" stroke-width="2" stroke-linecap="round" />
  <path d="M91 114c5 5 13 5 18 0" fill="none" stroke="#9C5D36" stroke-width="2.5" stroke-linecap="round" />
  
  <!-- Medical Badge -->
  <rect x="52" y="165" width="16" height="10" rx="2" fill="#0D9488" />
  <rect x="55" y="168" width="10" height="2" fill="#FFFFFF" />
  <rect x="55" y="171" width="6" height="1.5" fill="#CCFBF1" />
</svg>`;

// 2. Dr. Priya Nair – Female Senior Neurologist Avatar (Polished professional female physician with coat & stethoscope)
export const SVG_PRIYA_NAIR = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <linearGradient id="bg_priya" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F0FDFA" />
      <stop offset="100%" stop-color="#CCFBF1" />
    </linearGradient>
    <linearGradient id="skin_priya" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F2C4A2" />
      <stop offset="100%" stop-color="#E5AF87" />
    </linearGradient>
  </defs>
  <!-- Background Circle -->
  <rect width="200" height="200" fill="url(#bg_priya)" />

  <!-- Long Professional Hair Back Layer -->
  <path d="M62 85c0 35 6 62 16 70h44c10-8 16-35 16-70 0-25-14-40-38-40s-38 15-38 40z" fill="#1E1B18" />

  <!-- Shoulders & Clinical White Coat -->
  <path d="M32 200c0-36 30-56 68-56s68 20 68 56z" fill="#FFFFFF" stroke="#CBD5E0" stroke-width="2" />

  <!-- Teal Inner Scrub / Top -->
  <path d="M84 144l16 28 16-28z" fill="#0F766E" />
  <path d="M100 144l-12-16h24z" fill="#14B8A6" />

  <!-- Coat Lapels -->
  <path d="M72 144l18 56H46c-7-12-12-25-14-38l40-18z" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />
  <path d="M128 144l-18 56h44c7-12 12-25 14-38l-40-18z" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />

  <!-- Stethoscope -->
  <path d="M70 146c-2 18 8 36 22 36s18-12 18-24" fill="none" stroke="#1E293B" stroke-width="4" stroke-linecap="round" />
  <path d="M130 146c2 18-8 30-16 32" fill="none" stroke="#1E293B" stroke-width="4" stroke-linecap="round" />
  <circle cx="112" cy="158" r="6.5" fill="#475569" stroke="#0F172A" stroke-width="2" />
  <circle cx="112" cy="158" r="2.5" fill="#94A3B8" />

  <!-- Neck -->
  <path d="M90 120h20v24H90z" fill="#E5AF87" />

  <!-- Head & Ears -->
  <ellipse cx="69" cy="98" rx="5" ry="9" fill="url(#skin_priya)" />
  <ellipse cx="131" cy="98" rx="5" ry="9" fill="url(#skin_priya)" />
  <!-- Small Pearl Earrings -->
  <circle cx="69" cy="102" r="2" fill="#FFFFFF" />
  <circle cx="131" cy="102" r="2" fill="#FFFFFF" />

  <ellipse cx="100" cy="98" rx="30" ry="36" fill="url(#skin_priya)" />

  <!-- Front Hair Style -->
  <path d="M66 90c0-22 14-38 34-38s34 16 34 38c-8-12-20-18-34-18s-26 6-34 18z" fill="#292524" />
  <path d="M68 90c2-10 10-18 22-20-8 8-10 18-10 26 0 6 1 12 2 16-6-6-14-14-14-22z" fill="#1C1917" />
  <path d="M132 90c-2-10-10-18-22-20 8 8 10 18 10 26 0 6-1 12-2 16 6-6 14-14 14-22z" fill="#1C1917" />

  <!-- Eyes & Elegant Eyebrows -->
  <path d="M81 87c3-2 7-2 10 0" fill="none" stroke="#1C1917" stroke-width="2.2" stroke-linecap="round" />
  <path d="M109 87c3-2 7-2 10 0" fill="none" stroke="#1C1917" stroke-width="2.2" stroke-linecap="round" />
  <circle cx="86" cy="96" r="3.2" fill="#1E293B" />
  <circle cx="114" cy="96" r="3.2" fill="#1E293B" />
  <circle cx="87" cy="95" r="1" fill="#FFFFFF" />
  <circle cx="115" cy="95" r="1" fill="#FFFFFF" />

  <!-- Nose & Warm Physician Smile -->
  <path d="M100 97v8l3 1.5" fill="none" stroke="#C88E67" stroke-width="1.8" stroke-linecap="round" />
  <path d="M92 116c4 4 12 4 16 0" fill="none" stroke="#B45309" stroke-width="2.5" stroke-linecap="round" />
  <path d="M94 116c3 2 9 2 12 0" fill="#BE123C" opacity="0.4" />

  <!-- Doctor ID Card -->
  <rect x="52" y="165" width="15" height="10" rx="2" fill="#0D9488" />
  <rect x="55" y="168" width="9" height="2" fill="#FFFFFF" />
</svg>`;

// 3. Dr. Rohit Verma – Male Senior Orthopedic Surgeon Avatar
export const SVG_ROHIT_VERMA = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <linearGradient id="bg_rohit" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EFF6FF" />
      <stop offset="100%" stop-color="#DBEAFE" />
    </linearGradient>
    <linearGradient id="skin_rohit" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EAB390" />
      <stop offset="100%" stop-color="#DB9A72" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg_rohit)" />

  <!-- Shoulders & Surgical Scrub / Lab Coat -->
  <path d="M30 200c0-38 32-58 70-58s70 20 70 58z" fill="#FFFFFF" stroke="#CBD5E0" stroke-width="2" />
  <!-- Blue Surgical Scrub Neckline -->
  <path d="M82 142l18 30 18-30z" fill="#0284C7" />
  <path d="M100 142l-12-16h24z" fill="#38BDF8" />

  <!-- Coat Front -->
  <path d="M72 144l20 56H45c-8-12-13-26-15-40l42-16z" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" />
  <path d="M128 144l-20 56h47c8-12 13-26 15-40l-42-16z" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" />

  <!-- Stethoscope (Navy/Blue) -->
  <path d="M68 146c-2 20 10 38 24 38s14-12 14-22" fill="none" stroke="#0369A1" stroke-width="4.5" stroke-linecap="round" />
  <path d="M132 146c2 20-8 34-18 34" fill="none" stroke="#0369A1" stroke-width="4.5" stroke-linecap="round" />
  <circle cx="106" cy="162" r="7" fill="#64748B" stroke="#075985" stroke-width="2" />
  <circle cx="106" cy="162" r="3" fill="#BAE6FD" />

  <!-- Neck -->
  <path d="M88 118h24v28H88z" fill="#DB9A72" />

  <!-- Head & Ears -->
  <ellipse cx="68" cy="95" rx="6" ry="10" fill="url(#skin_rohit)" />
  <ellipse cx="132" cy="95" rx="6" ry="10" fill="url(#skin_rohit)" />
  <ellipse cx="100" cy="95" rx="32" ry="38" fill="url(#skin_rohit)" />

  <!-- Hair (Distinguished dark hair with slight side parting) -->
  <path d="M68 88c-1-18 10-34 32-34s33 16 32 34c-4-8-12-12-20-12-14 0-18 6-26 6-8 0-14-3-18 6z" fill="#334155" />
  <path d="M68 88c0-5 3-12 8-16 8-6 36-7 46 0 5 4 8 11 8 16 0-10-7-22-22-22s-28 7-32 22z" fill="#1E293B" />

  <!-- Eyes & Glasses (Sophisticated surgeon frames) -->
  <rect x="76" y="86" width="18" height="13" rx="3" fill="none" stroke="#0F172A" stroke-width="2" />
  <rect x="106" y="86" width="18" height="13" rx="3" fill="none" stroke="#0F172A" stroke-width="2" />
  <path d="M94 92h12" stroke="#0F172A" stroke-width="2" />
  <path d="M68 91h8M124 91h8" stroke="#0F172A" stroke-width="1.5" />
  <circle cx="85" cy="92.5" r="3" fill="#1E293B" />
  <circle cx="115" cy="92.5" r="3" fill="#1E293B" />

  <!-- Nose & Smile -->
  <path d="M100 94v9l3.5 1.5" fill="none" stroke="#BD805A" stroke-width="2" stroke-linecap="round" />
  <path d="M91 114c5 5 13 5 18 0" fill="none" stroke="#9A5C35" stroke-width="2.5" stroke-linecap="round" />
  
  <!-- Hospital Badge -->
  <rect x="52" y="165" width="16" height="10" rx="2" fill="#0284C7" />
  <rect x="55" y="168" width="10" height="2" fill="#FFFFFF" />
</svg>`;

// 4. Dr. Ananya Sen – Female Consultant Pediatrician Avatar (Gentle, friendly female doctor with cheerful stethoscope)
export const SVG_ANANYA_SEN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <linearGradient id="bg_ananya" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF3C7" />
      <stop offset="100%" stop-color="#FDE68A" />
    </linearGradient>
    <linearGradient id="skin_ananya" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F5CBA7" />
      <stop offset="100%" stop-color="#EBB38A" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg_ananya)" />

  <!-- Hair Back Layer (Neat medical bun / ponytail) -->
  <path d="M60 85c0 30 8 55 18 64h44c10-9 18-34 18-64 0-25-14-40-40-40s-40 15-40 40z" fill="#2D241E" />
  <circle cx="100" cy="45" r="14" fill="#2D241E" />

  <!-- Shoulders & Coat -->
  <path d="M32 200c0-36 30-56 68-56s68 20 68 56z" fill="#FFFFFF" stroke="#CBD5E0" stroke-width="2" />

  <!-- Pediatric Soft Coral/Teal scrub top -->
  <path d="M84 144l16 28 16-28z" fill="#0D9488" />
  <path d="M100 144l-12-16h24z" fill="#5EEAD4" />

  <!-- Coat Front -->
  <path d="M72 144l18 56H46c-7-12-12-25-14-38l40-18z" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />
  <path d="M128 144l-18 56h44c7-12 12-25 14-38l-40-18z" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />

  <!-- Cheerful Pediatric Stethoscope (Bright teal with child-friendly bell) -->
  <path d="M70 146c-2 18 8 36 22 36s18-12 18-24" fill="none" stroke="#0D9488" stroke-width="4.5" stroke-linecap="round" />
  <path d="M130 146c2 18-8 30-16 32" fill="none" stroke="#0D9488" stroke-width="4.5" stroke-linecap="round" />
  <circle cx="112" cy="158" r="7" fill="#F59E0B" stroke="#B45309" stroke-width="2" />
  <circle cx="112" cy="158" r="3" fill="#FEF3C7" />

  <!-- Neck -->
  <path d="M90 120h20v24H90z" fill="#EBB38A" />

  <!-- Head & Ears -->
  <ellipse cx="69" cy="98" rx="5" ry="9" fill="url(#skin_ananya)" />
  <ellipse cx="131" cy="98" rx="5" ry="9" fill="url(#skin_ananya)" />
  <ellipse cx="100" cy="98" rx="30" ry="36" fill="url(#skin_ananya)" />

  <!-- Front Hair -->
  <path d="M66 88c0-20 14-36 34-36s34 16 34 36c-8-10-20-16-34-16s-26 6-34 16z" fill="#3E3228" />

  <!-- Eyes & Friendly Expression -->
  <path d="M81 87c3-2 7-2 10 0" fill="none" stroke="#1C1917" stroke-width="2.2" stroke-linecap="round" />
  <path d="M109 87c3-2 7-2 10 0" fill="none" stroke="#1C1917" stroke-width="2.2" stroke-linecap="round" />
  <circle cx="86" cy="96" r="3.2" fill="#1E293B" />
  <circle cx="114" cy="96" r="3.2" fill="#1E293B" />
  <circle cx="87" cy="95" r="1" fill="#FFFFFF" />
  <circle cx="115" cy="95" r="1" fill="#FFFFFF" />

  <!-- Nose & Warm Smile -->
  <path d="M100 97v8l3 1.5" fill="none" stroke="#C88E67" stroke-width="1.8" stroke-linecap="round" />
  <path d="M91 115c5 5 13 5 18 0" fill="none" stroke="#D97706" stroke-width="2.5" stroke-linecap="round" />

  <!-- Pediatric Bear Pin on coat -->
  <circle cx="56" cy="168" r="5" fill="#F59E0B" />
  <circle cx="53" cy="163" r="2" fill="#F59E0B" />
  <circle cx="59" cy="163" r="2" fill="#F59E0B" />
</svg>`;

// Fallbacks
export const SVG_DEFAULT_MALE = SVG_AARAV_SHARMA;
export const SVG_DEFAULT_FEMALE = SVG_PRIYA_NAIR;

// Export all as direct Data URIs for instant rendering
export const DOCTOR_AVATARS: Record<string, string> = {
  aarav: toDataUri(SVG_AARAV_SHARMA),
  priya: toDataUri(SVG_PRIYA_NAIR),
  rohit: toDataUri(SVG_ROHIT_VERMA),
  ananya: toDataUri(SVG_ANANYA_SEN),
  default_male: toDataUri(SVG_DEFAULT_MALE),
  default_female: toDataUri(SVG_DEFAULT_FEMALE),
};

/**
 * Returns a high-resolution, professional SVG avatar for any doctor.
 * Matches specific doctors (Aarav, Priya, Rohit, Ananya) or predicts
 * appropriate professional male/female physician avatar by name and specialization.
 */
export const getDoctorAvatar = (doctorName?: string, specialization?: string): string => {
  if (!doctorName) return DOCTOR_AVATARS.default_male;
  const nameLower = doctorName.toLowerCase();

  // 1. Exact doctor match
  if (nameLower.includes('aarav') || nameLower.includes('sharma')) {
    return DOCTOR_AVATARS.aarav;
  }
  if (nameLower.includes('priya') || nameLower.includes('nair')) {
    return DOCTOR_AVATARS.priya;
  }
  if (nameLower.includes('rohit') || nameLower.includes('verma')) {
    return DOCTOR_AVATARS.rohit;
  }
  if (nameLower.includes('ananya') || nameLower.includes('sen')) {
    return DOCTOR_AVATARS.ananya;
  }

  // 2. Female physician names
  const femaleNames = ['priya', 'ananya', 'sunita', 'pooja', 'sneha', 'kavita', 'meera', 'deepa', 'neha', 'divya', 'rashmi', 'aditi', 'swati'];
  const isFemale = femaleNames.some(fn => nameLower.includes(fn));
  if (isFemale) return DOCTOR_AVATARS.default_female;

  // 3. Specialization fallback
  const specLower = (specialization || '').toLowerCase();
  if (specLower.includes('neuro')) return DOCTOR_AVATARS.priya;
  if (specLower.includes('pedia')) return DOCTOR_AVATARS.ananya;
  if (specLower.includes('ortho')) return DOCTOR_AVATARS.rohit;
  if (specLower.includes('cardio')) return DOCTOR_AVATARS.aarav;

  return DOCTOR_AVATARS.default_male;
};
