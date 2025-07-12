import { useAuth } from '../../context/AuthContext';
import StarRating from '../Common/StarRating';

const StoreRatings = ({ store }) => {
  const { getStoreRatings, users } = useAuth();

  if (!store) {
    return (
      <div className="card">
        <div className="card-body text-center" style={{ padding: '60px' }}>
          <h3>No Store Found</h3>
          <p>You don't have a store assigned to your account.</p>
        </div>
      </div>
    );
  }

  const storeRatings = getStoreRatings(store.id);

  const ratingsWithUsers = storeRatings.map(rating => {
    const user = users.find(u => u.id === rating.userId);
    return {
      ...rating,
      userName: user?.name || 'Unknown User',
      userEmail: user?.email || 'No email'
    };
  });

  return (
    <div>
      <h2>Ratings for {store.name}</h2>
      
      {ratingsWithUsers.length === 0 ? (
        <div className="card">
          <div className="card-body text-center" style={{ padding: '60px' }}>
            <h3>No Ratings Yet</h3>
            <p>Your store hasn't received any ratings yet.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <table className="table">
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Rating</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {ratingsWithUsers.map(rating => (
                  <tr key={rating.id}>
                    <td>{rating.userName}</td>
                    <td>{rating.userEmail}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <StarRating rating={rating.rating} size="small" readOnly />
                        <span>({rating.rating})</span>
                      </div>
                    </td>
                    <td>{new Date(rating.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="stat-card">
            <div className="stat-number">{ratingsWithUsers.length}</div>
            <div className="stat-label">Total Ratings</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {ratingsWithUsers.filter(r => r.rating === 5).length}
            </div>
            <div className="stat-label">5-Star Ratings</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {ratingsWithUsers.filter(r => r.rating >= 4).length}
            </div>
            <div className="stat-label">4+ Star Ratings</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreRatings;