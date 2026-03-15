export default function Unauthorized() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#020902",
        fontFamily: "monospace",
      }}
    >
      <p style={{ color: "#ef4444", fontSize: "12px", letterSpacing: "0.2em" }}>
        ACCESS DENIED
      </p>
      <p style={{ color: "#2a5a2a", fontSize: "11px" }}>
        You do not have admin privileges.
      </p>
      <a
        href="/dashboard"
        style={{ color: "#22c55e", fontSize: "11px", marginTop: "1rem" }}
      >
        ← Go back
      </a>
    </div>
  );
}
