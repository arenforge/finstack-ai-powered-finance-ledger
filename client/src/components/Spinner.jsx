export default function Spinner({ fullPage, message = "Loading..." }) {
  return (
    <div className={fullPage ? "spinner-container full-page" : "spinner-container"}>
      <div className="spinner-wrapper">
        <svg className="spinner-svg" viewBox="0 0 50 50">
          <circle className="spinner-track" cx="25" cy="25" r="20" />
          <circle className="spinner-circle" cx="25" cy="25" r="20" />
        </svg>
      </div>
      {message && <p className="loading-text">{message}</p>}
    </div>
  );
}
