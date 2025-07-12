import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import StarRating from '../Common/StarRating';

const StoreCard = ({ store }) => {
  const { getStoreRating, getUserRatingForStore, submitRating } = useAuth();
  const [isRating, setIsRating] = useState(false);

  const overallRating = getStoreRating(store.id);
  const userRating = getUserRatingForStore(store.id);

  const handleRatingSubmit = (rating) => {
    submitRating(store.id, rating);
    setIsRating(false);
  };

  return (
    <div className="card">
      <div className="card-body">
        <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>{store.name}</h3>
        <p style={{ color: '#6b7280', marginBottom: '15px', fontSize: '14px' }}>
          {store.address}
        </p>

        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Overall Rating:</span>
            <div className="rating-display">
              <StarRating rating={overallRating} size="small" readOnly />
              <span style={{ fontSize: '14px', color: '#6b7280' }}>
                ({overallRating > 0 ? overallRating.toFixed(1) : 'No ratings'})
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Your Rating:</span>
            {userRating > 0 ? (
              <div className="rating-display">
                <StarRating rating={userRating} size="small" readOnly />
                <span style={{ fontSize: '14px', color: '#6b7280' }}>({userRating})</span>
              </div>
            ) : (
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Not rated</span>
            )}
          </div>
        </div>

        {!isRating ? (
          <button
            onClick={() => setIsRating(true)}
            className="btn btn-primary btn-small"
          >
            {userRating > 0 ? 'Update Rating' : 'Submit Rating'}
          </button>
        ) : (
          <div>
            <p style={{ fontSize: '14px', marginBottom: '10px', fontWeight: '500' }}>
              {userRating > 0 ? 'Update your rating:' : 'Rate this store:'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <StarRating
                rating={userRating}
                onRatingChange={handleRatingSubmit}
                size="medium"
              />
              <button
                onClick={() => setIsRating(false)}
                className="btn btn-secondary btn-small"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreCard;