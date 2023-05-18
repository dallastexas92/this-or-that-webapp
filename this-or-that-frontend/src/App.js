import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

const App = () => {
  const [upvoteCounts, setUpvoteCounts] = useState({ image1: 0, image2: 0 });

  useEffect(() => {
    fetchUpvoteCount('image1');
    fetchUpvoteCount('image2');
  }, []);

  const fetchUpvoteCount = async (imageId) => {
    try {
      const response = await axios.get(`http://localhost:5001/api/upvotes/${imageId}`);
      setUpvoteCounts({ ...upvoteCounts, [imageId]: response.data.upvoteCount });
    } catch (error) {
      console.error('Error fetching upvote count:', error);
    }
  };

  const upvote = async (imageId) => {
    // Optimistically update the UI
    setUpvoteCounts({ ...upvoteCounts, [imageId]: upvoteCounts[imageId] + 1 });

    try {
      const response = await axios.post('http://localhost:5001/api/upvote', { imageId });
      console.log(`Upvoted: ${imageId}, new upvote count: ${response.data.upvoteCount}`);

      // Reconcile with the actual upvote count from the server
      setUpvoteCounts({ ...upvoteCounts, [imageId]: response.data.upvoteCount });
    } catch (error) {
      console.error('Error upvoting image:', error);

      // Revert the optimistic update if an error occurs
      setUpvoteCounts({ ...upvoteCounts, [imageId]: upvoteCounts[imageId] - 1 });
    }
  };

  return (
    <div className="App">
      <header className="header">
        <h1>Side-by-Side Picture Voting</h1>
      </header>
      <section className="container">
        <div className="picture-grid">
          <div className="picture-item">
            <img src="image1.jpg" alt="Image 1" />
            <button type="button" onClick={() => upvote('image1')}>
              Upvote
            </button>
            <p>Upvotes: {upvoteCounts.image1}</p> {/* Display upvote count */}
          </div>
          <div className="picture-item">
            <img src="image2.jpg" alt="Image 2" />
            <button type="button" onClick={() => upvote('image2')}>
              Upvote
            </button>
            <p>Upvotes: {upvoteCounts.image2}</p> {/* Display upvote count */}
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;
