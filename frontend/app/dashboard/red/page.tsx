import AttackPanel from "@/components/AttackPanel";
import ActivityLog from "@/components/ActivityLog";

export default function RedDashboard() {
  return (
    <div className="p-6 grid grid-cols-2 gap-6">
      <AttackPanel />

      <ActivityLog />
    </div>
  );
}
