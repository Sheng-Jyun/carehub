'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  usePatient, 
  usePatientAppointments, 
  usePatientVitals, 
  usePatientNotes,
  useCreatePatientNote,
  useUpdatePatient
} from '@/hooks/useApi';
import { 
  ArrowLeft, 
  Edit, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  Activity,
  FileText,
  AlertCircle,
  X,
  Save
} from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatDateTime, calculateAge, cn } from '@/lib/utils';
import { ProviderNote } from '@/types';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState<ProviderNote['type']>('progress');

  const { data: patient, isLoading: patientLoading, error: patientError } = usePatient(resolvedParams.id);
  const { data: appointments = [] } = usePatientAppointments(resolvedParams.id);
  const { data: vitals = [] } = usePatientVitals(resolvedParams.id);
  const { data: notes = [] } = usePatientNotes(resolvedParams.id);

  const createNote = useCreatePatientNote();
  const updatePatient = useUpdatePatient();

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`/patients/${resolvedParams.id}?${params.toString()}`);
  };

  const handleAddNote = async () => {
    if (!noteContent.trim() || !patient) return;

    await createNote.mutateAsync({
      patientId: patient.id,
      data: {
        patientId: patient.id,
        providerId: 'prov-1',
        providerName: 'Dr. Sarah Johnson',
        type: noteType,
        content: noteContent,
        isPrivate: false,
      },
    });

    setNoteContent('');
    setNoteType('progress');
  };

  if (patientLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-64"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
        <div className="h-96 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (patientError || !patient) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Patient</h2>
        <p className="text-red-700">Patient not found or failed to load data.</p>
        <Link href="/patients" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
          ← Back to Patients
        </Link>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(a => 
    new Date(a.startTime) > new Date() && ['scheduled', 'confirmed'].includes(a.status)
  ).slice(0, 3);

  const pastAppointments = appointments.filter(a => 
    new Date(a.startTime) <= new Date() || ['completed', 'cancelled', 'no-show'].includes(a.status)
  );

  const recentVitals = vitals.slice(0, 10);

  // Prepare chart data
  const chartData = vitals.slice(0, 20).reverse().map(v => ({
    date: formatDate(v.date),
    systolic: v.bloodPressureSystolic,
    diastolic: v.bloodPressureDiastolic,
    heartRate: v.heartRate,
    weight: v.weight,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/patients"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Patients
        </Link>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-6">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {patient.firstName[0]}{patient.lastName[0]}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {patient.firstName} {patient.lastName}
                </h1>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="font-medium">MRN:</span> {patient.mrn}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="font-medium">Age:</span> {calculateAge(patient.dateOfBirth)} years
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="font-medium">Gender:</span> {patient.gender}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="font-medium">Status:</span>
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      patient.status === 'active' ? 'bg-green-100 text-green-800' :
                      patient.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    )}>
                      {patient.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    {patient.phone}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    {patient.email}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 col-span-2">
                    <MapPin className="w-4 h-4" />
                    {patient.address}
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>

          {patient.alerts.length > 0 && (
            <div className="mt-6 space-y-2">
              {patient.alerts.map((alert, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <span className="text-sm text-yellow-900">{alert}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex gap-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'appointments', label: 'Appointments', icon: Calendar },
              { id: 'vitals', label: 'Vitals', icon: Activity },
              { id: 'notes', label: 'Notes', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 py-4 border-b-2 transition-colors',
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Last Visit</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {patient.lastVisit ? formatDate(patient.lastVisit) : 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Next Appointment</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {patient.nextAppointment ? formatDate(patient.nextAppointment) : 'None'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Active Medications</p>
                  <p className="text-2xl font-bold text-gray-900">{patient.activeMedications}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h3>
                {upcomingAppointments.length === 0 ? (
                  <p className="text-gray-600">No upcoming appointments</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingAppointments.map((apt) => (
                      <div key={apt.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{formatDateTime(apt.startTime)}</p>
                          <p className="text-sm text-gray-600">{apt.reason} • Dr. {apt.providerName}</p>
                        </div>
                        <span className={cn(
                          'px-3 py-1 rounded-full text-xs font-medium',
                          apt.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        )}>
                          {apt.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Vitals</h3>
                {recentVitals.length === 0 ? (
                  <p className="text-gray-600">No vital signs recorded</p>
                ) : (
                  <div className="space-y-3">
                    {recentVitals.slice(0, 3).map((vital) => (
                      <div key={vital.id} className="p-4 border border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">{formatDate(vital.date)}</p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">BP:</span>
                            <span className="ml-2 font-medium">{vital.bloodPressureSystolic}/{vital.bloodPressureDiastolic}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">HR:</span>
                            <span className="ml-2 font-medium">{vital.heartRate} bpm</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Weight:</span>
                            <span className="ml-2 font-medium">{vital.weight} lbs</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">All Appointments</h3>
              {appointments.length === 0 ? (
                <p className="text-gray-600">No appointments found</p>
              ) : (
                <div className="space-y-4">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{formatDateTime(apt.startTime)}</p>
                          <p className="text-sm text-gray-600 mt-1">{apt.type} • {apt.reason}</p>
                          <p className="text-sm text-gray-600">Room: {apt.room}</p>
                        </div>
                        <span className={cn(
                          'px-3 py-1 rounded-full text-xs font-medium',
                          apt.status === 'completed' ? 'bg-green-100 text-green-800' :
                          apt.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          apt.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                          apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        )}>
                          {apt.status}
                        </span>
                      </div>
                      {apt.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">{apt.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'vitals' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Vital Signs History</h3>
              
              {vitals.length > 0 && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Blood Pressure Trend</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="systolic" stroke="#ef4444" name="Systolic" />
                        <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" name="Diastolic" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Heart Rate Trend</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="heartRate" stroke="#10b981" name="Heart Rate" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-4">All Records</h4>
                <div className="space-y-3">
                  {vitals.map((vital) => (
                    <div key={vital.id} className="p-4 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-600 mb-3">{formatDate(vital.date)}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Blood Pressure:</span>
                          <p className="font-medium">{vital.bloodPressureSystolic}/{vital.bloodPressureDiastolic} mmHg</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Heart Rate:</span>
                          <p className="font-medium">{vital.heartRate} bpm</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Temperature:</span>
                          <p className="font-medium">{vital.temperature.toFixed(1)}°F</p>
                        </div>
                        <div>
                          <span className="text-gray-600">O2 Saturation:</span>
                          <p className="font-medium">{vital.oxygenSaturation}%</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Weight:</span>
                          <p className="font-medium">{vital.weight} lbs</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Height:</span>
                          <p className="font-medium">{vital.height} in</p>
                        </div>
                        <div>
                          <span className="text-gray-600">BMI:</span>
                          <p className="font-medium">{vital.bmi}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Respiratory Rate:</span>
                          <p className="font-medium">{vital.respiratoryRate} /min</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Note</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Note Type
                    </label>
                    <select
                      value={noteType}
                      onChange={(e) => setNoteType(e.target.value as ProviderNote['type'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="progress">Progress Note</option>
                      <option value="admission">Admission Note</option>
                      <option value="discharge">Discharge Note</option>
                      <option value="consultation">Consultation Note</option>
                      <option value="procedure">Procedure Note</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content
                    </label>
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      rows={6}
                      placeholder="Enter note content..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleAddNote}
                    disabled={!noteContent.trim() || createNote.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {createNote.isPending ? 'Saving...' : 'Save Note'}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">All Notes</h3>
                {notes.length === 0 ? (
                  <p className="text-gray-600">No notes found</p>
                ) : (
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <div key={note.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className={cn(
                              'inline-block px-2 py-1 rounded text-xs font-medium',
                              'bg-blue-100 text-blue-800'
                            )}>
                              {note.type}
                            </span>
                            <p className="text-sm text-gray-600 mt-2">{note.providerName} • {formatDateTime(note.date)}</p>
                          </div>
                        </div>
                        <p className="text-gray-900 mt-2 whitespace-pre-wrap">{note.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-gray-900">Edit Patient</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600">Patient editing form would go here...</p>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Import use hook for unwrapping params
import { use } from 'react';
