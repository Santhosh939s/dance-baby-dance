import './Avatar.css';

const Avatar = ({ type, role, isDancing, activeMovement }) => {
  // type: 'male' | 'female'
  // role: 'dancer' | 'instructor' | 'mirror'
  
  const getIcon = () => {
    return type === 'male' ? '🕺' : '💃';
  };
  
  const getLabel = () => {
    if (role === 'instructor') return 'INSTRUCTOR';
    if (role === 'mirror') return 'MIRROR';
    return type === 'male' ? 'Male Avatar' : 'Female Avatar';
  };

  return (
    <div className={`avatar-container ${type} ${role}`}>
      <div className="avatar-label">{getLabel()}</div>
      <div className={`avatar-model ${isDancing ? 'dancing' : ''}`}>
        {getIcon()}
      </div>
      {activeMovement && (
        <div className="movement-tooltip">
          {activeMovement}
        </div>
      )}
    </div>
  );
};

export default Avatar;
