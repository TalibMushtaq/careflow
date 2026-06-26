import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Stethoscope, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  // Check if we were redirected due to an expired token
  const queryParams = new URLSearchParams(location.search);
  const sessionExpired = queryParams.get('expired') === 'true';

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitting(true);
    const result = await login(values.email, values.password);
    setSubmitting(false);

    if (result.success) {
      toast.success('Welcome back to CareFlow!');
      const redirectPath = result.data.user.role === 'doctor' ? '/doctor' : '/patient';
      navigate(redirectPath, { replace: true });
    } else {
      toast.error(result.message || 'Login failed. Please check credentials.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Left Column: Visual branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-tr from-hospital-800 to-hospital-500 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Background glow effects */}
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
            Now Live
          </span>
          <h2 className="text-4xl font-extrabold font-outfit leading-tight">
            Streamlining Doctor Appointments & Queue Management
          </h2>
          <p className="text-hospital-100 font-medium">
            An intelligent healthcare flow manager facilitating seamless, real-time queues for medical centers, doctors, and patients.
          </p>
        </div>

        <div className="text-xs text-hospital-200 relative z-10 font-medium">
          &copy; 2026 CareFlow Medical Suite. All rights reserved.
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8 bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-premium transition-colors duration-200">
          <div className="text-center md:text-left space-y-2">
            <div className="md:hidden flex justify-center mb-4">
              <div className="p-3 bg-hospital-500 rounded-2xl text-white shadow-premium">
                <Stethoscope size={28} />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold font-outfit text-slate-800 dark:text-white leading-tight">
              Sign In
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Access your medical dashboard and queue status.
            </p>
          </div>

          {sessionExpired && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-300 rounded-2xl text-sm font-medium">
              Your session has expired. Please sign in again.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                  placeholder="patient@careflow.com or doctor1@careflow.com"
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-hospital-500 hover:bg-hospital-600 active:bg-hospital-700 text-white rounded-2xl font-semibold text-sm shadow-premium hover:shadow-glow disabled:opacity-75 transition-all duration-200"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-hospital-500 hover:underline font-semibold">
                Register as Patient
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
