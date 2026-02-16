import { Patient, Provider, Appointment, VitalSigns, ProviderNote, Notification } from '@/types';
import { addDays, subDays, addHours, format, startOfWeek, addWeeks } from 'date-fns';

// Provider Data
export const providers: Provider[] = [
  {
    id: 'prov-1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    specialty: 'Family Medicine',
    email: 'sarah.johnson@carehub.com',
    phone: '(555) 123-4567',
  },
  {
    id: 'prov-2',
    firstName: 'Michael',
    lastName: 'Chen',
    specialty: 'Cardiology',
    email: 'michael.chen@carehub.com',
    phone: '(555) 234-5678',
  },
  {
    id: 'prov-3',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    specialty: 'Pediatrics',
    email: 'emily.rodriguez@carehub.com',
    phone: '(555) 345-6789',
  },
  {
    id: 'prov-4',
    firstName: 'David',
    lastName: 'Williams',
    specialty: 'Internal Medicine',
    email: 'david.williams@carehub.com',
    phone: '(555) 456-7890',
  },
  {
    id: 'prov-5',
    firstName: 'Lisa',
    lastName: 'Anderson',
    specialty: 'Endocrinology',
    email: 'lisa.anderson@carehub.com',
    phone: '(555) 567-8901',
  },
];

// Helper functions
const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle', 'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Dorothy', 'George', 'Melissa', 'Timothy', 'Deborah'];

const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];

const streets = ['Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Elm St', 'Pine Rd', 'Washington Blvd', 'Park Ave', 'Lake Dr', 'Hill St'];

const cities = ['Springfield', 'Riverside', 'Fairview', 'Madison', 'Georgetown', 'Franklin', 'Clinton', 'Arlington', 'Salem', 'Bristol'];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMRN(): string {
  return `MRN${randomInt(100000, 999999)}`;
}

function generatePhone(): string {
  return `(${randomInt(200, 999)}) ${randomInt(200, 999)}-${randomInt(1000, 9999)}`;
}

function generateAddress(): string {
  return `${randomInt(100, 9999)} ${randomElement(streets)}, ${randomElement(cities)}, ${randomElement(['CA', 'NY', 'TX', 'FL', 'IL'])} ${randomInt(10000, 99999)}`;
}

function generateDOB(): string {
  const years = randomInt(18, 85);
  return subDays(new Date(), years * 365 + randomInt(0, 365)).toISOString();
}

// Generate Patients
export const patients: Patient[] = Array.from({ length: 50 }, (_, i) => {
  const provider = randomElement(providers);
  const status = i < 45 ? 'active' : randomElement(['inactive', 'deceased'] as const);
  const riskLevel = randomElement(['low', 'low', 'low', 'medium', 'medium', 'high', 'critical'] as const);
  const hasUpcomingAppointment = Math.random() > 0.4;
  
  const alerts: string[] = [];
  if (riskLevel === 'critical') {
    alerts.push('High blood pressure - requires monitoring');
  }
  if (riskLevel === 'high' || riskLevel === 'critical') {
    alerts.push('Multiple comorbidities');
  }
  if (Math.random() > 0.8) {
    alerts.push('Missed last appointment');
  }

  return {
    id: `patient-${i + 1}`,
    mrn: generateMRN(),
    firstName: randomElement(firstNames),
    lastName: randomElement(lastNames),
    dateOfBirth: generateDOB(),
    gender: randomElement(['male', 'female', 'other'] as const),
    email: `patient${i + 1}@example.com`,
    phone: generatePhone(),
    address: generateAddress(),
    status,
    provider: provider.id,
    providerName: `${provider.firstName} ${provider.lastName}`,
    riskLevel,
    hasUpcomingAppointment,
    lastVisit: subDays(new Date(), randomInt(1, 90)).toISOString(),
    nextAppointment: hasUpcomingAppointment ? addDays(new Date(), randomInt(1, 30)).toISOString() : undefined,
    activeMedications: randomInt(0, 8),
    alerts,
  };
});

// Generate Appointments
export const appointments: Appointment[] = [];

const appointmentTypes: Appointment['type'][] = ['checkup', 'followup', 'urgent', 'procedure', 'consultation'];
const appointmentStatuses: Appointment['status'][] = ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'];
const rooms = ['101', '102', '103', '201', '202', '203', '301', '302'];

// Generate appointments for 2 weeks
for (let day = -7; day <= 14; day++) {
  const date = addDays(new Date(), day);
  
  // Each provider has 4-8 appointments per day
  providers.forEach(provider => {
    const numAppointments = randomInt(4, 8);
    
    for (let i = 0; i < numAppointments; i++) {
      const hour = randomInt(8, 16);
      const minute = randomElement([0, 15, 30, 45]);
      const startTime = new Date(date);
      startTime.setHours(hour, minute, 0, 0);
      
      const duration = randomElement([15, 30, 45, 60]);
      const endTime = addHours(startTime, duration / 60);
      
      const patient = randomElement(patients.filter(p => p.provider === provider.id));
      
      let status: Appointment['status'];
      if (day < 0) {
        status = randomElement(['completed', 'no-show', 'cancelled']);
      } else if (day === 0) {
        status = randomElement(['confirmed', 'in-progress']);
      } else {
        status = randomElement(['scheduled', 'confirmed']);
      }
      
      appointments.push({
        id: `appt-${appointments.length + 1}`,
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        providerId: provider.id,
        providerName: `${provider.firstName} ${provider.lastName}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        type: randomElement(appointmentTypes),
        status,
        room: randomElement(rooms),
        notes: Math.random() > 0.7 ? 'Patient requested morning appointment' : undefined,
        reason: randomElement([
          'Annual checkup',
          'Follow-up visit',
          'Medication review',
          'Lab results discussion',
          'New symptoms',
          'Chronic condition management',
          'Preventive care',
        ]),
      });
    }
  });
}

// Generate Vital Signs
export const vitalSigns: VitalSigns[] = [];

patients.forEach(patient => {
  const numReadings = randomInt(5, 15);
  
  for (let i = 0; i < numReadings; i++) {
    const date = subDays(new Date(), randomInt(1, 180));
    const weight = randomInt(100, 250);
    const height = randomInt(60, 76);
    const bmi = (weight / (height * height)) * 703;
    
    vitalSigns.push({
      id: `vital-${vitalSigns.length + 1}`,
      patientId: patient.id,
      date: date.toISOString(),
      bloodPressureSystolic: randomInt(110, 160),
      bloodPressureDiastolic: randomInt(70, 100),
      heartRate: randomInt(60, 100),
      temperature: 96 + Math.random() * 3,
      respiratoryRate: randomInt(12, 20),
      oxygenSaturation: randomInt(95, 100),
      weight,
      height,
      bmi: Math.round(bmi * 10) / 10,
      recordedBy: randomElement(providers).id,
    });
  }
});

// Sort vital signs by date
vitalSigns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

// Generate Provider Notes
export const providerNotes: ProviderNote[] = [];

patients.forEach(patient => {
  const numNotes = randomInt(3, 10);
  
  for (let i = 0; i < numNotes; i++) {
    const provider = providers.find(p => p.id === patient.provider)!;
    const date = subDays(new Date(), randomInt(1, 180));
    
    const contents = [
      'Patient presents with mild symptoms. Vital signs within normal range. Recommended continued monitoring and follow-up in 3 months.',
      'Follow-up visit for chronic condition management. Patient reports improvement with current medication regimen. No changes recommended at this time.',
      'Annual physical examination completed. All screenings up to date. Discussed preventive care and healthy lifestyle modifications.',
      'Patient experiencing new symptoms. Ordered additional lab work and imaging. Will review results and adjust treatment plan as needed.',
      'Medication review completed. Adjusted dosage based on recent lab results. Patient educated on potential side effects and when to seek care.',
    ];
    
    providerNotes.push({
      id: `note-${providerNotes.length + 1}`,
      patientId: patient.id,
      providerId: provider.id,
      providerName: `${provider.firstName} ${provider.lastName}`,
      date: date.toISOString(),
      type: randomElement(['progress', 'admission', 'discharge', 'consultation', 'procedure'] as const),
      content: randomElement(contents),
      isPrivate: Math.random() > 0.8,
    });
  }
});

// Sort notes by date
providerNotes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

// Generate Notifications
export const notifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'alert',
    title: 'Critical Patient Alert',
    message: 'Patient John Doe (MRN123456) has abnormal lab results requiring immediate attention.',
    timestamp: subDays(new Date(), 0.5).toISOString(),
    read: false,
    patientId: 'patient-1',
    priority: 'high',
  },
  {
    id: 'notif-2',
    type: 'appointment',
    title: 'Appointment Cancelled',
    message: 'Patient Mary Smith has cancelled their appointment scheduled for tomorrow at 2:00 PM.',
    timestamp: subDays(new Date(), 1).toISOString(),
    read: false,
    priority: 'medium',
  },
  {
    id: 'notif-3',
    type: 'message',
    title: 'New Message',
    message: 'You have a new message from Dr. Chen regarding patient care coordination.',
    timestamp: subDays(new Date(), 1).toISOString(),
    read: true,
    priority: 'low',
  },
  {
    id: 'notif-4',
    type: 'appointment',
    title: 'Upcoming Appointment',
    message: 'Reminder: You have 5 appointments scheduled for today.',
    timestamp: subDays(new Date(), 0.1).toISOString(),
    read: false,
    priority: 'medium',
  },
  {
    id: 'notif-5',
    type: 'system',
    title: 'System Maintenance',
    message: 'Scheduled system maintenance tonight from 11 PM to 2 AM.',
    timestamp: subDays(new Date(), 2).toISOString(),
    read: true,
    priority: 'low',
  },
];
