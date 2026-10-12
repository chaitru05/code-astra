import { AlertTriangle } from "lucide-react";

export default function DemoNotice({ message }) {
  return (
    <div className="demo-notice">
      <AlertTriangle size={16} className="demo-notice-icon" />
      <div>
        <strong>STATIC DEMO DATA</strong>
        {message ? ` — ${message}` : " — The backend is unavailable. Showing illustrative demo records. These are not live incidents."}
      </div>
    </div>
  );
}
