export const medicalCodeTypes = ['CPT', 'ICD10', 'HCPCS'] as const;

export type MedicalCodeTypeName = (typeof medicalCodeTypes)[number];
