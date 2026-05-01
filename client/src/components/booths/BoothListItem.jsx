import { ExternalLink } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * BoothListItem — Individual row in the polling booth list sidebar.
 * @param {Object} props - Component props
 * @param {Object} props.booth - Booth data
 * @param {boolean} props.isSelected - Whether this booth is currently selected
 * @param {Function} props.onClick - Click handler
 * @returns {JSX.Element}
 */
const BoothListItem = ({ booth, isSelected, onClick }) => {
  return (
    <div
      className="px-4 py-3 cursor-pointer transition-all hover:bg-white/[0.03]"
      style={{
        background: isSelected ? 'rgba(255,153,51,0.07)' : 'transparent',
        borderLeft: isSelected ? '3px solid #FF9933' : '3px solid transparent',
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Select booth: ${booth.name}`}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p
            className="font-semibold text-xs leading-tight mb-1"
            style={{ color: isSelected ? '#FF9933' : '#e6edf3' }}
          >
            {booth.name}
          </p>
          <p className="text-xs leading-relaxed mb-1" style={{ color: '#8b949e' }}>
            {booth.address}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: '#6e7681' }}>
              Booth #{booth.boothNo}
            </span>
            {booth.distance && (
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(255,153,51,0.1)', color: '#FF9933' }}
              >
                📍 {booth.distance}
              </span>
            )}
          </div>
        </div>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${booth.lat},${booth.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          aria-label={`Get directions to ${booth.name}`}
          className="flex-shrink-0 p-1.5 rounded-lg transition-all hover:bg-saffron-500/10"
          style={{ color: '#8b949e' }}
        >
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
};

BoothListItem.propTypes = {
  booth: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    boothNo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    distance: PropTypes.string,
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default BoothListItem;
