import { severityClass } from "../../utils/formatters";

export default function SeverityBadge({ severity }) {
  return (
    <span className={`severity-badge ${severityClass(severity)}`}>
      {severity || "UNKNOWN"}
    </span>
  );
}
