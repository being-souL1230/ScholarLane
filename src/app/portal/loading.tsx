export default function PortalLoading() {
  return (
    <div className="loading-stage" role="status">
      <div>
        <div className="pulse-ring" aria-hidden />
        <p>Gathering your path…</p>
      </div>
    </div>
  );
}
