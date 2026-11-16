// CareHealth Point – Professional Hospital Assets & Doctor Visuals

export const HOSPITAL_IMAGES = {
  heroBanner: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=1200',
  clinicalTeam: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1000',
  hospitalFacility: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000',
  operatingTheater: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=1000',
  laboratory: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&q=80&w=1000',
  emergencyAmbulance: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&q=80&w=1000',
};

// Curated physician portraits mapped by doctor specialization or ID
export const DOCTOR_PORTRAITS: Record<string, string> = {
  // Dr. Aarav Sharma (Cardiology)
  'aarav': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
  // Dr. Priya Nair (Neurology)
  'priya': 'https://images.unsplash.com/photo-1594824813583-11b302c11458?auto=format&fit=crop&q=80&w=600',
  // Dr. Vikram Malhotra (Pediatrics)
  'vikram': 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600',
  // Dr. Ananya Roy / Female specialist (Internal Medicine / Orthopedics)
  'ananya': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
  // Default senior male consultant
  'default_male': 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600',
  // Default senior female consultant
  'default_female': 'https://images.unsplash.com/photo-1594824813583-11b302c11458?auto=format&fit=crop&q=80&w=600',
};

export const getDoctorPhoto = (doctorName?: string, specialization?: string): string => {
  if (!doctorName) return DOCTOR_PORTRAITS.default_male;
  const lower = doctorName.toLowerCase();
  if (lower.includes('aarav') || lower.includes('sharma')) return DOCTOR_PORTRAITS.aarav;
  if (lower.includes('priya') || lower.includes('nair')) return DOCTOR_PORTRAITS.priya;
  if (lower.includes('vikram') || lower.includes('malhotra')) return DOCTOR_PORTRAITS.vikram;
  if (lower.includes('ananya') || lower.includes('roy') || lower.includes('sunita') || lower.includes('pooja')) return DOCTOR_PORTRAITS.ananya;
  if (lower.includes('dr. k') || lower.includes('alok') || lower.includes('rajesh')) return DOCTOR_PORTRAITS.default_male;
  
  // By specialization
  const specLower = (specialization || '').toLowerCase();
  if (specLower.includes('cardio')) return DOCTOR_PORTRAITS.aarav;
  if (specLower.includes('neuro')) return DOCTOR_PORTRAITS.priya;
  if (specLower.includes('pedia')) return DOCTOR_PORTRAITS.vikram;
  
  return DOCTOR_PORTRAITS.default_male;
};
