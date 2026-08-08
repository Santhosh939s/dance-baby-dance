import Avatar from '../Avatar/Avatar';
import './DanceStage.css';

const DanceStage = ({ isPlaying }) => {
  return (
    <div className="dance-stage">
      <div className="stage-floor">
        <div className="stage-glow"></div>
        <div className="grid-lines"></div>
      </div>
      
      <div className="avatars-container">
        <Avatar type="male" role="dancer" isDancing={isPlaying} />
        <Avatar type="female" role="dancer" isDancing={isPlaying} />
      </div>
    </div>
  );
};

export default DanceStage;
