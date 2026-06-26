import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { Appointment, ApiResponse } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorComponent } from '../components/ErrorComponent';
import { 
  Calendar, 
  Clock, 
  User as UserIcon, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  MapPin,
  ClipboardList
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

export const PatientDashboard: React.FC = () => {
  const { data: response, isLoading, error, refetch } = useQuery<ApiResponse<Appointment[]>>({
    queryKey: ['my-appointments'],
    queryFn: async () => {
      const res = await apiClient.get('/appointments/me');
      return res.data;
    },
  });

  const appointments = response?.data || [];

  // 1. Get the closest upcoming scheduled or serving appointment
  const upcomingAppointment = useMemo(() => {
    return appointments
      .filter(a => a.status === 'scheduled' || a.status === 'serving')
      .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())[0];
  }, [appointments]);

  // 2. Compute statistics for summary cards
  const stats = useMemo(() => {
    const total = appointments.length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;
    const absent = appointments.filter(a => a.status === 'absent').length;
    return { total, completed, cancelled, absent };
  }, [appointments]);

  // 3. Prepare chart data (aggregated appointments count by date)
  const chartData = useMemo(() => {
    const countsByDate: { [key: string]: { completed: number; missed: number; total: number } } = {};
    
    // Process last 10 appointments to avoid cluttering
    const sorted = [...appointments]
      .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
      .slice(-10);

    sorted.forEach(appt => {
      const dateStr = appt.appointment_date;
      if (!countsByDate[dateStr]) {
        countsByDate[dateStr] = { completed: 0, missed: 0, total: 0 };
      }
      
      countsByDate[dateStr].total += 1;
      if (appt.status === 'completed') {
        countsByDate[dateStr].completed += 1;
      } else if (appt.status === 'absent' || appt.status === 'cancelled') {
        countsByDate[dateStr].missed += 1;
      }
    });

    return Object.entries(countsByDate).map(([date, counts]) => ({
      date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      'Completed': counts.completed,
      'Missed/Cancelled': counts.missed,
      'Total Booked': counts.total
    }));
  }, [appointments]);

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

  // Define status badge helper
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'serving':
        return 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30 animate-pulse';
      case 'completed':
        return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
      case 'absent':
        return 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30';
      case 'cancelled':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default:
        return 'bg-hospital-50 dark:bg-hospital-950/20 text-hospital-600 dark:text-hospital-400 border-hospital-100 dark:border-hospital-900/30';
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold font-outfit text-slate-800 dark:text-white">Patient Dashboard</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">View your active queue status, upcoming appointments, and booking history.</p>
      </div>

      {/* Main Grid: Upcoming Card & Live Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Upcoming Appointment details */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-soft relative overflow-hidden transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold font-outfit text-slate-800 dark:text-white flex items-center gap-2">
              <ClipboardList className="text-hospital-500" size={20} />
              Upcoming Appointment
            </h3>
            {upcomingAppointment && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusStyle(upcomingAppointment.status)}`}>
                {upcomingAppointment.status}
              </span>
            )}
          </div>

          {upcomingAppointment ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-300">
                    <UserIcon size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Assigned Doctor</p>
                    <p className="text-base font-bold text-slate-800 dark:text-white">{upcomingAppointment.doctor_name}</p>
                    <p className="text-xs text-hospital-500 font-medium">{upcomingAppointment.specialty}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-300">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Consultation Room</p>
                    <p className="text-base font-bold text-slate-800 dark:text-white">{upcomingAppointment.room_number}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-300">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Appointment Date</p>
                    <p className="text-base font-bold text-slate-800 dark:text-white">
                      {new Date(upcomingAppointment.appointment_date).toLocaleDateString(undefined, { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-300">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Time Slot</p>
                    <p className="text-base font-bold text-slate-800 dark:text-white">{upcomingAppointment.time_slot}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-full mb-3">
                <Calendar size={32} />
              </div>
              <h4 className="text-base font-bold text-slate-800 dark:text-white">No Upcoming Appointments</h4>
              <p className="text-sm text-slate-400 max-w-xs mt-1">Book an appointment in the Doctors directory to get started.</p>
            </div>
          )}
        </div>

        {/* Right Side: Live Queue Badge */}
        <div className="bg-gradient-to-br from-hospital-600 to-hospital-800 text-white rounded-3xl p-6 sm:p-8 shadow-premium relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <h3 className="text-md font-bold uppercase tracking-wider text-hospital-100">Live Queue Position</h3>
            {upcomingAppointment?.status === 'serving' && (
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            )}
          </div>

          <div className="relative z-10 py-6 text-center">
            {upcomingAppointment ? (
              <div className="space-y-1">
                <span className="text-7xl font-extrabold font-outfit tracking-tight block drop-shadow-md">
                  #{upcomingAppointment.queue_number}
                </span>
                <span className="text-xs font-semibold text-hospital-150 uppercase tracking-widest block pt-2">
                  {upcomingAppointment.status === 'serving' ? 'Your Turn: Being Served Now!' : 'Estimated Queue Number'}
                </span>
              </div>
            ) : (
              <div className="text-center space-y-1 py-4">
                <span className="text-5xl font-extrabold font-outfit block">-</span>
                <span className="text-xs font-semibold text-hospital-200 uppercase tracking-wider block">
                  No Active Queue
                </span>
              </div>
            )}
          </div>

          <div className="relative z-10 flex items-center gap-2.5 bg-white/10 backdrop-blur-md rounded-2xl p-3 text-xs border border-white/10">
            <Info size={16} className="shrink-0 text-hospital-200" />
            <p className="text-hospital-100 font-medium">
              {upcomingAppointment?.status === 'serving' 
                ? 'Please proceed directly inside the doctor\'s room now.' 
                : 'Queue numbers reset daily. Please arrive 10 minutes before your slot.'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Statistics & History Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats Column */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-soft flex items-center gap-4 transition-colors">
            <div className="p-3.5 bg-hospital-50 dark:bg-hospital-950/20 text-hospital-500 dark:text-hospital-400 rounded-xl">
              <ClipboardList size={22} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Consultations</p>
              <h4 className="text-2xl font-bold text-slate-800 dark:text-white font-outfit">{stats.total}</h4>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-soft flex items-center gap-4 transition-colors">
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 dark:text-emerald-400 rounded-xl">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Completed Visits</p>
              <h4 className="text-2xl font-bold text-slate-800 dark:text-white font-outfit">{stats.completed}</h4>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-soft flex items-center gap-4 transition-colors">
            <div className="p-3.5 bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 rounded-xl">
              <AlertCircle size={22} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Missed / Absent</p>
              <h4 className="text-2xl font-bold text-slate-800 dark:text-white font-outfit">{stats.absent}</h4>
            </div>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-soft transition-colors flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-md font-bold font-outfit text-slate-800 dark:text-white">Appointment History</h3>
              <p className="text-xs text-slate-400">Chronological history of your bookings and check-in statuses.</p>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-hospital-500 bg-hospital-50 dark:bg-hospital-950/20 border border-hospital-100 dark:border-hospital-900/30 px-2 py-0.5 rounded-full">
              <TrendingUp size={12} />
              Live Activity
            </span>
          </div>

          <div className="h-48 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0c85eb" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0c85eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none', 
                      borderRadius: '16px', 
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                      fontSize: '11px',
                      color: '#1e293b'
                    }} 
                  />
                  <Area type="monotone" dataKey="Total Booked" stroke="#0c85eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-xs text-slate-400">
                No past appointment data to display.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
