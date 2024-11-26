import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface AppointmentSlotProps {
  date: Date;
  totalSlots: number;
  bookedSlots: number;
  isSelected: boolean;
  onSelect: () => void;
}

export function AppointmentSlot({
  date,
  totalSlots,
  bookedSlots,
  isSelected,
  onSelect,
}: AppointmentSlotProps) {
  const availableSlots = totalSlots - bookedSlots;

  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">{format(date, "EEEE")}</span>
        <Badge variant={availableSlots > 0 ? "secondary" : "destructive"}>
          {availableSlots} slots left
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">{format(date, "PPP")}</p>
    </div>
  );
}
