import React from 'react';
import './AvatarSkeletonInspector.css';

const AvatarSkeletonInspector = ({ boneData, avatarName }) => {
  if (!boneData || boneData.length === 0) return null;

  return (
    <div className="skeleton-inspector glass-panel">
      <h4>Skeleton Inspector: {avatarName}</h4>
      <div className="bone-list">
        {boneData.map((bone, index) => (
          <div key={index} className={`bone-item ${bone.mappedTo ? 'mapped' : 'unmapped'}`}>
            <span className="bone-name">{bone.name}</span>
            {bone.mappedTo ? (
              <span className="bone-mapped"> → {bone.mappedTo}</span>
            ) : (
              <span className="bone-unmapped"> (ignored)</span>
            )}
            <div className="bone-parent">Parent: {bone.parent}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvatarSkeletonInspector;
