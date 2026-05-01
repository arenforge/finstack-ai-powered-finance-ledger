export default function Spinner({ fullPage }) {
  return (
    <div className={fullPage ? "spinner-container full-page" : "spinner-container"}>
      <div className="spinner"></div>
    </div>
  );
}
