import DefensePanel from "@/components/DefensePanel";
import ActivityLog from "@/components/ActivityLog";

export default function BlueDashboard() {
  return (
    <div className="p-6 grid grid-cols-2 gap-6">
      <DefensePanel />

      <ActivityLog />
    </div>
  );
}
