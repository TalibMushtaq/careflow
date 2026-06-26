import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { Appointment, ApiResponse } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorComponent } from '../components/ErrorComponent';
import toast from 'react-hot-toast';
import { Calendar, Clock, MapPin, Trash2 } from 'lucide-react';

export const MyBookings: React.FC = () => {
  const queryClient = useQueryClient();
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: response, isLoading, error, refetch } = useQuery<ApiResponse<Appointment[]>>({
    queryKey: ['my-appointments'],
    queryFn: async () => {
      const res = await apiClient.get('/appointments/me');
      return res.data;
    },
  });

  const appointments = response?.data || [];

  // Mutation to cancel an appointment
  const cancelMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.patch(`/appointments/${id}/status`, { status: 'cancelled' });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Appointment cancelled successfully.');
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to cancel appointment.');
    }
  });

  const handleCancel = (id: number) => {
    if (window.confirm('Are you sure you want to cancel this appointment? This cannot be undone.')) {
      cancelMutation.mutate(id);
    }
  };

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appt => {
      const matchesDate = !dateFilter || appt.appointment_date === dateFilter;
      const matchesStatus = statusFilter === 'all' || appt.status === statusFilter;
      return matchesDate && matchesStatus;
    });
  }, [appointments, dateFilter, statusFilter]);

  const getStatusBadge = (status: string) => {
    const base = "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ";
    switch (status) {
      case 'serving':
        return base + "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30 animate-pulse";
      case 'completed':
        return base + "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30";
      case 'absent':
        return base + "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30";
      case 'cancelled':
        return base + "bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-450 border-slate-200 dark:border-slate-700";
      default:
        return base + "bg-hospital-50 dark:bg-hospital-950/20 text-hospital-600 dark:text-hospital-400 border-hospital-100 dark:border-hospital-900/30";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorComponent message={error instanceof Error ? error.message : "Failed to load appointments"} onRetry={refetch} />;
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold font-outfit text-slate-800 dark:text-white">My Bookings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">View and manage your scheduled consultations and check-in history.</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft transition-colors flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {/* Date Filter */}
          <div className="space-y-1 w-full sm:w-44">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider">Filter Date</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-hospital-500 text-slate-700 dark:text-slate-350"
            />
          </div>

          {/* Status Filter */}
          <div className="space-y-1 w-full sm:w-44">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider">Filter Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-hospital-500 text-slate-700 dark:text-slate-350"
            >
              <option value="all">All Bookings</option>
              <option value="scheduled">Scheduled</option>
              <option value="serving">Serving</option>
              <option value="completed">Completed</option>
              <option value="absent">Absent</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(dateFilter || statusFilter !== 'all') && (
          <button
            onClick={() => { setDateFilter(''); setStatusFilter('all'); }}
            className="w-full sm:w-auto text-xs text-hospital-500 hover:text-hospital-600 font-bold px-4 py-2 hover:bg-hospital-50 dark:hover:bg-hospital-950/20 rounded-xl transition"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Bookings List / Empty State */}
      {filteredAppointments.length === 0 ? (
        <div className="py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center shadow-soft transition-colors">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-full inline-block mb-3">
            <Calendar size={32} />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">No Appointments Found</h3>
          <p className="text-sm text-slate-450 max-w-xs mx-auto mt-1">Try clearing filters or schedule an appointment from the Doctor Directory.</p>
        </div>
      ) : (
        /* Appointment Table - Desktop */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-850/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-5">Doctor / Specialty</th>
                  <th className="p-5">Date & Slot</th>
                  <th className="p-5">Queue No.</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-sm text-slate-700 dark:text-slate-300">
                {filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-850/20 transition-colors">
                    {/* Doctor Info */}
                    <td className="p-5">
                      <div className="font-bold text-slate-800 dark:text-white font-outfit">{appt.doctor_name}</div>
                      <div className="text-xs text-hospital-500 font-medium">{appt.specialty}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <MapPin size={10} />
                        {appt.room_number}
                      </div>
                    </td>

                    {/* Date/Slot */}
                    <td className="p-5">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-white text-xs">
                        <Calendar size={13} className="text-slate-400" />
                        {new Date(appt.appointment_date).toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-455 text-[11px] mt-1 font-medium">
                        <Clock size={13} className="text-slate-400" />
                        {appt.time_slot}
                      </div>
                    </td>

                    {/* Queue */}
                    <td className="p-5">
                      <span className="font-bold text-slate-800 dark:text-white font-outfit text-sm">
                        #{appt.queue_number}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-5">
                      <span className={getStatusBadge(appt.status)}>
                        {appt.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="p-5 text-right">
                      {appt.status === 'scheduled' ? (
                        <button
                          onClick={() => handleCancel(appt.id)}
                          disabled={cancelMutation.isPending}
                          className="p-2 bg-red-50 hover:bg-red-650 dark:bg-red-950/20 text-red-600 hover:text-white rounded-xl transition-all duration-150 inline-flex items-center gap-1 text-xs font-bold"
                          title="Cancel Appointment"
                        >
                          <Trash2 size={14} />
                          Cancel
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium italic">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
