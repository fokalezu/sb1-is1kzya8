import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserCircle, Settings, CheckCircle, Crown, BarChart3, Camera, AlertTriangle, Power, Users, Copy, Check, Gift, Tag, Clock, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Add Login History card to the dashboard
const DashboardCard = ({ icon: Icon, title, description, to, disabled = false, className = '', variant = 'default' }: {
  icon: React.ElementType;
  title: string;
  description: string;
  to: string;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'verified' | 'premium';
}) => {
  const baseClasses = "bg-white p-6 rounded-lg shadow-md transition-all duration-200";
  const enabledClasses = "hover:shadow-lg cursor-pointer";
  const disabledClasses = "opacity-50 cursor-not-allowed";
  
  const variantClasses = {
    default: "",
    verified: "bg-green-50 border-2 border-green-500",
    premium: "bg-yellow-50 border-2 border-yellow-500"
  };

  return (
    <Link
      to={disabled ? '#' : to}
      className={`${baseClasses} ${disabled ? disabledClasses : enabledClasses} ${variantClasses[variant]} ${className}`}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault();
        }
      }}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${
          variant === 'verified' ? 'bg-green-100' : 
          variant === 'premium' ? 'bg-yellow-100' : 
          'bg-purple-100'
        }`}>
          <Icon className={`h-6 w-6 ${
            variant === 'verified' ? 'text-green-600' : 
            variant === 'premium' ? 'text-yellow-600' : 
            'text-purple-600'
          }`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  );
};