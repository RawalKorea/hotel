import { GeminiSpinner } from "@/components/ui/gemini-spinner";

export default function AdminLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <GeminiSpinner className="h-10 w-10" />
    </div>
  );
}
