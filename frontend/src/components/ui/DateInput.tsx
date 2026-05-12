import { DatePicker } from './DatePicker';

interface DateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function DateInput({ label, value, onChange, required }: DateInputProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      <DatePicker value={value} onChange={onChange} />
    </div>
  );
}
