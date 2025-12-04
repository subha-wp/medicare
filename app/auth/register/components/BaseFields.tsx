"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { User, Mail, Lock, Phone, MapPin, Gift } from "lucide-react";

interface BaseFieldsProps {
  form: UseFormReturn<any>;
}

export function BaseFields({ form }: BaseFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Name Field */}
      <FormField
        control={form.control}
        name="profile.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              Full Name *
            </FormLabel>
            <FormControl>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  {...field}
                  placeholder="Enter your full name"
                  className="pl-10 h-12 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Email Field */}
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              Email Address *
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  {...field}
                  type="email"
                  placeholder="Enter your email address"
                  className="pl-10 h-12 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Password Field */}
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              Password *
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  {...field}
                  type="password"
                  placeholder="Create a strong password"
                  className="pl-10 h-12 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Phone Field - Optional */}
      <FormField
        control={form.control}
        name="profile.phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              Phone Number
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  {...field}
                  type="tel"
                  placeholder="Enter your phone number (optional)"
                  className="pl-10 h-12 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Address Field - Optional */}
      <FormField
        control={form.control}
        name="profile.address"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              Address
            </FormLabel>
            <FormControl>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  {...field}
                  placeholder="Enter your address (optional)"
                  className="pl-10 h-12 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Referral Code Field - Optional */}
      <FormField
        control={form.control}
        name="referralCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              Referral Code (Optional)
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Gift className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  {...field}
                  placeholder="Enter referral code to get ₹50 credit"
                  className="pl-10 h-12 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </FormControl>
            <FormMessage />
            <p className="text-xs text-gray-500">
              Get ₹50 credit when you book your first appointment
            </p>
          </FormItem>
        )}
      />
    </div>
  );
}
