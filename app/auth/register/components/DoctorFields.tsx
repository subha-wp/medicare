import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/file-upload";
import { UseFormReturn } from "react-hook-form";

interface DoctorFieldsProps {
  form: UseFormReturn<any>;
}

export function DoctorFields({ form }: DoctorFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="profile.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter your name" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="profile.phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter your phone number" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="profile.address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter your address" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="profile.specialization"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Specialization</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter your specialization" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="profile.qualification"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Qualification</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter your qualification" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="profile.experience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Experience (years)</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="number"
                placeholder="Enter years of experience"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="profile.about"
        render={({ field }) => (
          <FormItem>
            <FormLabel>About</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Enter a brief description about yourself"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="profile.licenseNo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>License Number</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter your license number" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="profile.aadhaarNo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Aadhaar Number</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter your Aadhaar number" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="profile.documents.licenseDoc"
        render={({ field }) => (
          <FormItem>
            <FormLabel>License Document</FormLabel>
            <FormControl>
              <FileUpload
                value={field.value}
                onChange={field.onChange}
                label="License Document"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="profile.documents.aadhaarDoc"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Aadhaar Document</FormLabel>
            <FormControl>
              <FileUpload
                value={field.value}
                onChange={field.onChange}
                label="Aadhaar Document"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
