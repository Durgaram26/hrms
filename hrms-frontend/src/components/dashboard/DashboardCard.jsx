import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import './DashboardCard.css';

const DashboardCard = ({ 
  title, 
  subtitle,
  value, 
  icon, 
  color = 'primary', 
  change, 
  changeType = 'positive',
  onClick,
  loading = false,
  footer,
  badge,
  badgeColor = 'primary',
  variant = 'default',
  children
}) => {
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 500);
    return () => clearTimeout(timer);
  }, [value]);

  const colorClasses = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    info: 'bg-info',
    secondary: 'bg-secondary',
    dark: 'bg-dark',
    light: 'bg-light text-dark'
  };

  const changeClasses = {
    positive: 'text-success',
    negative: 'text-danger',
    neutral: 'text-muted'
  };
  
  const badgeClasses = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    info: 'bg-info',
    secondary: 'bg-secondary',
    dark: 'bg-dark',
    light: 'bg-light text-dark'
  };

  const variants = {
    default: '',
    outlined: 'border border-2',
    filled: `${colorClasses[color]} bg-opacity-10`,
    gradient: `bg-gradient`
  };

  return (
    <div 
      className={`card border-0 shadow-sm h-100 ${onClick ? 'cursor-pointer' : ''} ${variants[variant]} transition-all`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {badge && (
        <div className="position-absolute top-0 end-0 mt-2 me-2">
          <span className={`badge ${badgeClasses[badgeColor]}`}>{badge}</span>
        </div>
      )}
      
      <div className="card-body">
        <div className="d-flex align-items-center mb-3">
          <div className={`rounded-circle p-3 ${colorClasses[color]} text-white me-3`}>
            <i className={`${icon} fa-lg`}></i>
          </div>
          <div className="flex-grow-1">
            <h6 className="text-muted mb-1 text-uppercase small">{title}</h6>
            {subtitle && <p className="text-muted small mb-0">{subtitle}</p>}
          </div>
        </div>
        
        <div className="mt-3">
          {loading ? (
            <div className="placeholder-glow">
              <span className="placeholder col-6"></span>
            </div>
          ) : (
            <h3 className={`mb-0 fw-bold ${animate ? 'scale-up' : ''}`} 
                style={{ transition: 'transform 0.3s ease' }}>
              {value}
            </h3>
          )}
          
          {change && (
            <small className={`${changeClasses[changeType]} fw-medium d-block mt-1`}>
              <i className={`fas fa-arrow-${changeType === 'positive' ? 'up' : changeType === 'negative' ? 'down' : 'right'} me-1`}></i>
              {change}
            </small>
          )}
        </div>
        
        {children && (
          <div className="mt-3">
            {children}
          </div>
        )}
      </div>
      
      {footer && (
        <div className="card-footer bg-transparent border-top-0 pt-0">
          <small className="text-muted">{footer}</small>
        </div>
      )}
    </div>
  );
};

DashboardCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.string.isRequired,
  color: PropTypes.oneOf(['primary', 'success', 'warning', 'danger', 'info', 'secondary', 'dark', 'light']),
  change: PropTypes.string,
  changeType: PropTypes.oneOf(['positive', 'negative', 'neutral']),
  onClick: PropTypes.func,
  loading: PropTypes.bool,
  footer: PropTypes.node,
  badge: PropTypes.node,
  badgeColor: PropTypes.oneOf(['primary', 'success', 'warning', 'danger', 'info', 'secondary', 'dark', 'light']),
  variant: PropTypes.oneOf(['default', 'outlined', 'filled', 'gradient']),
  children: PropTypes.node
};

export default DashboardCard;