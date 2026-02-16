'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAppointments, useProviders, useUpdateAppointment, useCreateAppointment, useDeleteAppointment } from '@/hooks/useApi';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns';
import { formatTime, cn } from '@/lib/utils';
import { Appointment } from '@/types';

export default function SchedulePage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [currentDay, setCurrentDay] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newAppointmentSlot, setNewAppointmentSlot] = useState<{ date: Date; hour: number } | null>(null);
  const [editForm, setEditForm] = useState({
    type: '',
    status: '',
    reason: '',
    notes: '',
  });

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const displayDays = viewMode === 'week' ? weekDays : [currentDay];

  const { data: providers = [] } = useProviders();
  const updateAppointment = useUpdateAppointment();
  const createAppointment = useCreateAppointment();
  const deleteAppointment = useDeleteAppointment();

  // Sync currentDay with currentWeek when switching to day view
  useEffect(() => {
    const today = new Date();
    // If today is within the current week, use today, otherwise use the first day of the week
    const isWithinWeek = weekDays.some(day => isSameDay(day, today));
    if (isWithinWeek) {
      setCurrentDay(today);
    } else {
      setCurrentDay(weekStart);
    }
  }, [currentWeek]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch appointments for the current view
  const startDate = viewMode === 'week' 
    ? format(weekStart, 'yyyy-MM-dd')
    : format(currentDay, 'yyyy-MM-dd');
  const endDate = viewMode === 'week'
    ? format(addDays(weekStart, 7), 'yyyy-MM-dd')
    : format(addDays(currentDay, 1), 'yyyy-MM-dd');
  
  const { data: appointments = [], isLoading } = useAppointments({
    startDate,
    endDate,
    ...(selectedProvider && { providerId: selectedProvider }),
  });

  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

  const getAppointmentsForSlot = (date: Date, hour: number) => {
    return appointments.filter(apt => {
      const aptDate = parseISO(apt.startTime);
      const aptHour = aptDate.getHours();
      return isSameDay(aptDate, date) && aptHour === hour;
    });
  };

  const handlePreviousWeek = () => {
    if (viewMode === 'week') {
      setCurrentWeek(subWeeks(currentWeek, 1));
    } else {
      setCurrentDay(addDays(currentDay, -1));
    }
  };

  const handleNextWeek = () => {
    if (viewMode === 'week') {
      setCurrentWeek(addWeeks(currentWeek, 1));
    } else {
      setCurrentDay(addDays(currentDay, 1));
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentWeek(today);
    setCurrentDay(today);
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    setNewAppointmentSlot({ date, hour });
    setIsCreating(true);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleClosePanel = () => {
    setSelectedAppointment(null);
    setIsCreating(false);
    setIsEditing(false);
    setNewAppointmentSlot(null);
  };

  const handleEditAppointment = () => {
    if (selectedAppointment) {
      setEditForm({
        type: selectedAppointment.type,
        status: selectedAppointment.status,
        reason: selectedAppointment.reason || '',
        notes: selectedAppointment.notes || '',
      });
      setIsEditing(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedAppointment) return;
    
    try {
      await updateAppointment.mutateAsync({
        id: selectedAppointment.id,
        data: editForm,
      });
      setIsEditing(false);
      handleClosePanel();
    } catch (error) {
      alert('Failed to update appointment. Please try again.');
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    
    if (confirm(`Are you sure you want to cancel the appointment for ${selectedAppointment.patientName}?`)) {
      try {
        await deleteAppointment.mutateAsync(selectedAppointment.id);
        handleClosePanel();
      } catch (error) {
        alert('Failed to cancel appointment. Please try again.');
      }
    }
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 border-green-300 text-green-900';
      case 'scheduled':
        return 'bg-blue-100 border-blue-300 text-blue-900';
      case 'in-progress':
        return 'bg-purple-100 border-purple-300 text-purple-900';
      case 'completed':
        return 'bg-gray-100 border-gray-300 text-gray-900';
      case 'cancelled':
        return 'bg-red-100 border-red-300 text-red-900';
      case 'no-show':
        return 'bg-orange-100 border-orange-300 text-orange-900';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-900';
    }
  };

  const today = new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
          <p className="text-gray-600 mt-1">
            {viewMode === 'week' 
              ? `${format(weekStart, 'MMM d')} - ${format(addDays(weekStart, 6), 'MMM d, yyyy')}`
              : format(currentDay, 'MMMM d, yyyy')}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Providers</option>
            {providers.map(p => (
              <option key={p.id} value={p.id}>
                Dr. {p.firstName} {p.lastName}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('week')}
              className={cn(
                'px-4 py-2 rounded-lg transition-colors',
                viewMode === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={cn(
                'px-4 py-2 rounded-lg transition-colors',
                viewMode === 'day'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
            >
              Day
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleNextWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleToday}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
              <span className="text-gray-600">Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
              <span className="text-gray-600">Scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></div>
              <span className="text-gray-600">In Progress</span>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading schedule...</p>
            </div>
          ) : (
            <div className={viewMode === 'day' ? '' : 'min-w-[1000px]'}>
              {/* Header */}
              <div className={cn(
                'border-b border-gray-200',
                viewMode === 'week' ? 'grid grid-cols-8' : 'grid grid-cols-2'
              )}>
                <div className="p-4 border-r border-gray-200">
                  <span className="text-sm font-medium text-gray-600">Time</span>
                </div>
                {displayDays.map(day => (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      'p-4 border-r border-gray-200 text-center',
                      isSameDay(day, today) && 'bg-blue-50'
                    )}
                  >
                    <div className="text-xs font-medium text-gray-600 uppercase">
                      {format(day, 'EEE')}
                    </div>
                    <div className={cn(
                      'text-2xl font-semibold mt-1',
                      isSameDay(day, today) ? 'text-blue-600' : 'text-gray-900'
                    )}>
                      {format(day, 'd')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              <div className="divide-y divide-gray-200">
                {hours.map(hour => (
                  <div key={hour} className={cn(
                    viewMode === 'week' ? 'grid grid-cols-8' : 'grid grid-cols-2'
                  )}>
                    <div className="p-4 border-r border-gray-200 text-sm font-medium text-gray-600">
                      {format(new Date().setHours(hour, 0, 0, 0), 'h:mm a')}
                    </div>
                    {displayDays.map(day => {
                      const slotAppointments = getAppointmentsForSlot(day, hour);
                      const hasConflict = slotAppointments.length > 1;

                      return (
                        <div
                          key={`${day.toISOString()}-${hour}`}
                          onClick={() => handleTimeSlotClick(day, hour)}
                          className={cn(
                            'p-2 border-r border-gray-200 min-h-[80px] cursor-pointer hover:bg-gray-50 transition-colors',
                            isSameDay(day, today) && 'bg-blue-50 hover:bg-blue-100',
                            hasConflict && 'bg-red-50'
                          )}
                        >
                          <div className="space-y-1">
                            {slotAppointments.map(apt => (
                              <div
                                key={apt.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAppointmentClick(apt);
                                }}
                                className={cn(
                                  'p-2 rounded border text-xs cursor-pointer hover:shadow-md transition-shadow',
                                  getStatusColor(apt.status)
                                )}
                              >
                                <div className="font-medium truncate">{apt.patientName}</div>
                                <div className="text-xs opacity-75 truncate">{apt.type}</div>
                                <div className="text-xs opacity-75">{formatTime(apt.startTime)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Side Panel */}
      {(selectedAppointment || isCreating) && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-xl z-50 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {isCreating ? 'New Appointment' : isEditing ? 'Edit Appointment' : 'Appointment Details'}
              </h2>
              <button
                onClick={handleClosePanel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {isCreating && newAppointmentSlot ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date & Time
                  </label>
                  <p className="text-gray-900">
                    {format(newAppointmentSlot.date, 'MMMM d, yyyy')} at{' '}
                    {format(new Date().setHours(newAppointmentSlot.hour, 0, 0, 0), 'h:mm a')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient
                  </label>
                  <input
                    type="text"
                    placeholder="Search patient..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="checkup">Checkup</option>
                    <option value="followup">Follow-up</option>
                    <option value="urgent">Urgent</option>
                    <option value="procedure">Procedure</option>
                    <option value="consultation">Consultation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Reason for visit..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={handleClosePanel}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Appointment
                </button>
              </div>
            ) : selectedAppointment ? (
              <div className="space-y-6">
                {isEditing ? (
                  <>
                    {/* Edit Form */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Patient
                      </label>
                      <p className="text-lg font-medium text-gray-900">{selectedAppointment.patientName}</p>
                      <p className="text-sm text-gray-500 mt-1">Cannot change patient</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date & Time
                      </label>
                      <p className="text-gray-900">
                        {format(parseISO(selectedAppointment.startTime), 'MMMM d, yyyy')}
                      </p>
                      <p className="text-gray-600">
                        {formatTime(selectedAppointment.startTime)} - {formatTime(selectedAppointment.endTime)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Cannot change time</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type *
                      </label>
                      <select 
                        value={editForm.type}
                        onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="checkup">Checkup</option>
                        <option value="followup">Follow-up</option>
                        <option value="urgent">Urgent</option>
                        <option value="procedure">Procedure</option>
                        <option value="consultation">Consultation</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status *
                      </label>
                      <select 
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no-show">No Show</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Provider
                      </label>
                      <p className="text-gray-900">{selectedAppointment.providerName}</p>
                      <p className="text-sm text-gray-500 mt-1">Cannot change provider</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Room
                      </label>
                      <p className="text-gray-900">{selectedAppointment.room}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason *
                      </label>
                      <textarea
                        value={editForm.reason}
                        onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <textarea
                        value={editForm.notes}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                        rows={3}
                        placeholder="Add notes..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="pt-4 border-t border-gray-200 space-y-2">
                      <button 
                        onClick={handleSaveEdit}
                        disabled={updateAppointment.isPending}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updateAppointment.isPending ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button 
                        onClick={() => setIsEditing(false)}
                        className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* View Mode */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Patient
                      </label>
                      <p className="text-lg font-medium text-gray-900">{selectedAppointment.patientName}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date & Time
                      </label>
                      <p className="text-gray-900">
                        {format(parseISO(selectedAppointment.startTime), 'MMMM d, yyyy')}
                      </p>
                      <p className="text-gray-600">
                        {formatTime(selectedAppointment.startTime)} - {formatTime(selectedAppointment.endTime)}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <p className="text-gray-900 capitalize">{selectedAppointment.type}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <span className={cn(
                        'inline-block px-3 py-1 rounded-full text-sm font-medium',
                        getStatusColor(selectedAppointment.status)
                      )}>
                        {selectedAppointment.status}
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Provider
                      </label>
                      <p className="text-gray-900">{selectedAppointment.providerName}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Room
                      </label>
                      <p className="text-gray-900">{selectedAppointment.room}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason
                      </label>
                      <p className="text-gray-900">{selectedAppointment.reason}</p>
                    </div>

                    {selectedAppointment.notes && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <p className="text-gray-900">{selectedAppointment.notes}</p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-200 space-y-2">
                      <button 
                        onClick={handleEditAppointment}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Edit Appointment
                      </button>
                      <button 
                        onClick={handleCancelAppointment}
                        disabled={deleteAppointment.isPending}
                        className="w-full px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleteAppointment.isPending ? 'Cancelling...' : 'Cancel Appointment'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
