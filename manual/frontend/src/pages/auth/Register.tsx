import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Stethoscope, Lock, Mail, User as UserIcon, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

const COMMON_SPECIALTIES = [
  "Cardiology", "Pediatrics", "Dermatology", "Orthopedics", "Neurology",
  "General Medicine", "Ophthalmology", "Psychiatry", "Gynecology", "ENT"
];

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['patient', 'doctor']),
  specialtySelect: z.string().optional(),
  specialty: z.string().optional(),
  room_number: z.string().optional(),
}).refine((data) => {
  if (data.role === 'doctor') {
    const spec = data.specialtySelect === 'other' ? data.specialty : data.specialtySelect;
    return !!spec && spec.trim() !== '' && !!data.room_number && data.room_number.trim() !== '';
  }
  return true;
}, {
  message: 'Specialty and Room Number are required for doctors',
  path: ['specialtySelect'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor'>('patient');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'patient',
    }
  });

  const watchRole = watch('role');
  const watchSpecialtySelect = watch('specialtySelect');

  React.useEffect(() => {
    if (watchRole) {
      setSelectedRole(watchRole);
    }
  }, [watchRole]);

  const onSubmit = async (values: RegisterFormValues) => {
    setSubmitting(true);
    const resolvedSpecialty = values.specialtySelect === 'other' ? values.specialty : values.specialtySelect;
    // Clean up empty optional fields for patients
    const payload = {
      name: values.name,
      email: values.email,
      password: values.password,
      role: values.role,
      ...(values.role === 'doctor' ? {
        specialty: resolvedSpecialty,
        room_number: values.room_number,
      } : {})
    };

    const result = await registerUser(payload);
    setSubmitting(false);

    if (result.success) {
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } else {
      toast.error(result.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Left Column: Visual branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-hospital-800 to-hospital-500 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-hospital-950/20 rounded-full blur-3xl -ml-20 -mb-20"></div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl text-white">
            <Stethoscope size={24} />
          </div>
          <h1 className="font-outfit font-extrabold text-xl tracking-wide uppercase">CareFlow</h1>
        </div>

        <div className="space-y-4 relative z-10 max-w-lg">
          <span className="px-3.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider">
            Patient Portal
          </span>
          <h2 className="text-4xl font-extrabold font-outfit leading-tight">
            Take Control of Your Medical Appointments
          </h2>
          <p className="text-hospital-100 font-medium">
            Register as a patient to book appointments, view your daily queue position, and follow doctor worklists in real time.
          </p>
        </div>

        <div className="text-xs text-hospital-200 relative z-10 font-medium">
          &copy; 2026 CareFlow Medical Suite. All rights reserved.
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-lg space-y-8 bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-premium transition-colors duration-200">
          <div className="flex items-center justify-between">
            <Link to="/login" className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors uppercase tracking-wider">
              <ArrowLeft size={14} />
              Back to Sign In
            </Link>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold font-outfit text-slate-800 dark:text-white leading-tight">
              Create Account
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Register for CareFlow to begin booking appointments.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Account Role Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center justify-center gap-2 p-3.5 border rounded-2xl cursor-pointer font-medium text-sm transition-all ${
                  selectedRole === 'patient'
                    ? 'border-hospital-500 bg-hospital-50/50 dark:bg-hospital-950/20 text-hospital-700 dark:text-hospital-400 ring-2 ring-hospital-500'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}>
                  <input
                    type="radio"
                    value="patient"
                    className="sr-only"
                    {...register('role')}
                  />
                  Patient
                </label>

                <label className={`flex items-center justify-center gap-2 p-3.5 border rounded-2xl cursor-pointer font-medium text-sm transition-all ${
                  selectedRole === 'doctor'
                    ? 'border-hospital-500 bg-hospital-50/50 dark:bg-hospital-950/20 text-hospital-700 dark:text-hospital-400 ring-2 ring-hospital-500'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}>
                  <input
                    type="radio"
                    value="doctor"
                    className="sr-only"
                    {...register('role')}
                  />
                  Medical Doctor
                </label>
              </div>
            </div>

            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <UserIcon size={16} />
                </div>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:bg-white dark:focus:bg-slate-900 transition-all ${
                    errors.name 
                      ? 'border-red-500 ring-1 ring-red-500' 
                      : 'border-slate-200 dark:border-slate-800 focus:border-hospital-500'
                  }`}
                  {...register('name')}
                />
              </div>
              {errors.name && (
                <span className="text-xs text-red-500 font-medium pl-1">{errors.name.message}</span>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:bg-white dark:focus:bg-slate-900 transition-all ${
                    errors.email 
                      ? 'border-red-500 ring-1 ring-red-500' 
                      : 'border-slate-200 dark:border-slate-800 focus:border-hospital-500'
                  }`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <span className="text-xs text-red-500 font-medium pl-1">{errors.email.message}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:bg-white dark:focus:bg-slate-900 transition-all ${
                    errors.password 
                      ? 'border-red-500 ring-1 ring-red-500' 
                      : 'border-slate-200 dark:border-slate-800 focus:border-hospital-500'
                  }`}
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <span className="text-xs text-red-500 font-medium pl-1">{errors.password.message}</span>
              )}
            </div>

            {/* Doctor-only Fields */}
            {selectedRole === 'doctor' && (
              <div className="grid grid-cols-2 gap-4 border-t border-dashed border-slate-200 dark:border-slate-800 pt-5 mt-2 animate-in slide-in-from-top-4 duration-200">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Specialty
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-700 dark:text-slate-250 font-medium"
                    {...register('specialtySelect')}
                  >
                    <option value="">-- Select Specialty --</option>
                    {COMMON_SPECIALTIES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                    <option value="other">Other (Type custom specialty...)</option>
                  </select>
                  {watchSpecialtySelect === 'other' && (
                    <input
                      type="text"
                      placeholder="Type custom specialty..."
                      className="w-full mt-2 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-700 dark:text-slate-250 animate-in slide-in-from-top-2 duration-100 font-medium"
                      {...register('specialty')}
                    />
                  )}
                  {errors.specialtySelect && (
                    <span className="text-xs text-red-500 font-medium pl-1">{errors.specialtySelect.message}</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Room Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 101"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                    {...register('room_number')}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-hospital-500 hover:bg-hospital-600 active:bg-hospital-700 text-white rounded-2xl font-semibold text-sm shadow-premium hover:shadow-glow disabled:opacity-75 transition-all duration-200"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Register
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-hospital-500 hover:underline font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
