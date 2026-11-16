// CareHealth Point – Professional Hospital Assets & Doctor Visuals
import { getDoctorAvatar, DOCTOR_AVATARS } from './doctorAvatars';

export const HOSPITAL_IMAGES = {
  heroBanner: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=1200',
  clinicalTeam: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1000',
  hospitalFacility: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000',
  operatingTheater: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=1000',
  laboratory: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&q=80&w=1000',
  emergencyAmbulance: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&q=80&w=1000',
};

// Professional vector physician portraits
export const DOCTOR_PORTRAITS = DOCTOR_AVATARS;

/**
 * Returns a clean, high-resolution vector avatar for doctors.
 * 100% reliable, self-contained SVG, zero external CDN dependency.
 */
export const getDoctorPhoto = (doctorName?: string, specialization?: string): string => {
  return getDoctorAvatar(doctorName, specialization);
};
