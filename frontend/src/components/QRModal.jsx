import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Download } from 'lucide-react';

export default function QRModal({ url, shortCode, onClose }) {
  const canvasRef = useRef(null);

  const handleDownload = () => {
    const canvas = document.getElementById('qr-canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `snaplink-${shortCode}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">QR Code</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose} id="qr-modal-close">
            <X size={18} />
          </button>
        </div>

        <div className="qr-container">
          <div className="qr-canvas-wrap">
            <QRCodeCanvas
              id="qr-canvas"
              value={url}
              size={220}
              bgColor="#ffffff"
              fgColor="#111827"
              level="H"
              includeMargin={false}
              ref={canvasRef}
            />
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center', wordBreak: 'break-all' }}>
            {url}
          </p>

          <button
            id="qr-download-btn"
            className="btn btn-primary"
            onClick={handleDownload}
          >
            <Download size={16} />
            Download PNG
          </button>
        </div>
      </div>
    </div>
  );
}
