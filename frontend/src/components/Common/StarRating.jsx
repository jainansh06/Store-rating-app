import { useState } from 'react';

const StarRating = ({ rating = 0, onRatingChange, readOnly = false, size = 'medium' }) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  const sizes = {
    small: '16px',
    medium: '20px',
    large: '24px'
  };

  const handleStarClick = (selectedRating) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(selectedRating);
    }
  };

  const handleStarHover = (selectedRating) => {
    if (!readOnly) {
      setHoveredRating(selectedRating);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoveredRating(0);
    }
  };

  const getStarClass = (starNumber) => {
    const currentRating = hoveredRating || rating;
    return starNumber <= currentRating ? 'star filled' : 'star empty';
  };

  return (
    <div 
      className="rating" 
      onMouseLeave={handleMouseLeave}
      style={{ cursor: readOnly ? 'default' : 'pointer' }}
    >
      {[1, 2, 3, 4, 5].map(starNumber => (
        <span
          key={starNumber}
          className={getStarClass(starNumber)}
          onClick={() => handleStarClick(starNumber)}
          onMouseEnter={() => handleStarHover(starNumber)}
          style={{ 
            fontSize: sizes[size],
            cursor: readOnly ? 'default' : 'pointer'
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;