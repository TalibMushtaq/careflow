import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Mail, Shield, Stethoscope, MapPin } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h2 className="text-3xl font-extrabold font-outfit text-slate-800 dark:text-white">Profile</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your credentials and details for the CareFlow medical workspace.</p>
      </div>

      {/* Profile Details Card */}
      <div className="max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-soft transition-all relative overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-hospital-500/5 rounded-full blur-2xl"></div>

        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-850">
          <div className="w-20 h-20 bg-hospital-500 rounded-3xl text-white font-extrabold text-3xl font-outfit flex items-center justify-center shadow-premium shrink-0">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="text-center sm:text-left space-y-1">
            <h3 className="text-2xl font-bold font-outfit text-slate-800 dark:text-white leading-tight">{user.full_name}</h3>
            <span className="inline-block px-3 py-1 bg-hospital-50 dark:bg-hospital-950/20 text-hospital-600 dark:text-hospital-450 border border-hospital-100 dark:border-hospital-900/30 rounded-full text-xs font-bold uppercase tracking-wider">
              {user.role} Member
            </span>
          </div>
        </div>

        {/* Profile Info Details List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl shrink-0">
              <Mail size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Email Address</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl shrink-0">
              <Shield size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Workspace Role</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-white capitalize">{user.role}</p>
            </div>
          </div>

          {user.role === 'doctor' && (
            <>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl shrink-0">
                  <Stethoscope size={18} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Medical Specialty</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">General Cardiology</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Consultation Room</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">Room 203</p>
                </div>
              </div>
            </>
          )}

          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl shrink-0">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Account Created</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                {new Date().toLocaleDateString(undefined, { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
