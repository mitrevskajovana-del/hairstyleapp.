import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "./api";

export default function Reviews() {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [hairstyles, setHairstyles] = useState([]);

  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [hairstyle, setHairstyle] = useState("");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editComment, setEditComment] = useState("");
  const [editRating, setEditRating] = useState(5);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  useEffect(() => {
    loadReviews();
    loadHairstyles();
  }, []);

  const loadReviews = async () => {
    try {
      const response = await API.get("/reviews");
      setReviews(response.data);
    } catch (error) {
      console.error("Reviews error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadHairstyles = async () => {
    try {
      const response = await API.get("/hairstyles");
      setHairstyles(response.data);
    } catch (error) {
      console.error("Hairstyles error:", error);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();

    if (!hairstyle || !comment.trim()) {
      alert("Please select a hairstyle and write a review.");
      return;
    }

    try {
      const response = await API.post("/reviews", {
        hairstyle,
        comment: comment.trim(),
        rating: Number(rating),
      });

      setReviews((current) => [
        response.data.review,
        ...current,
      ]);

      setComment("");
      setRating(5);
      setHairstyle("");

      setMessage("Review added successfully.");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Create review error:", error);

      alert(
        error.response?.data?.message ||
          "Review could not be added."
      );
    }
  };

  const startEditing = (review) => {
    setEditingId(review._id);
    setEditComment(review.comment);
    setEditRating(review.rating);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditComment("");
    setEditRating(5);
  };

  const saveEdit = async (id) => {
    if (!editComment.trim()) {
      alert("Review cannot be empty.");
      return;
    }

    try {
      const response = await API.put(`/reviews/${id}`, {
        comment: editComment.trim(),
        rating: Number(editRating),
      });

      setReviews((current) =>
        current.map((review) =>
          review._id === id
            ? response.data.review
            : review
        )
      );

      cancelEditing();

      setMessage("Review updated successfully.");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Update review error:", error);

      alert(
        error.response?.data?.message ||
          "Review could not be updated."
      );
    }
  };

  const deleteReview = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmed) return;

    try {
      await API.delete(`/reviews/${id}`);

      setReviews((current) =>
        current.filter((review) => review._id !== id)
      );

      setMessage("Review deleted successfully.");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Delete review error:", error);

      alert(
        error.response?.data?.message ||
          "Review could not be deleted."
      );
    }
  };

  const renderStars = (value) => {
    return "★".repeat(value) + "☆".repeat(5 - value);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    navigate("/");
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="layout">
        <div className="sidebar">
          <h2>HAIR LUX</h2>

          <button onClick={() => navigate("/")}>
            Dashboard
          </button>

          <button onClick={() => navigate("/search")}>
            Search Hairstyles
          </button>

          <button onClick={() => navigate("/weather")}>
            Weather Advice
          </button>

          <button onClick={() => navigate("/reviews")}>
            Reviews
          </button>

          {token && (
            <button onClick={() => navigate("/appointments")}>
              My Appointments
            </button>
          )}

          {!token && (
            <button onClick={() => navigate("/login")}>
              Login
            </button>
          )}

          <button onClick={() => navigate("/register")}>
            Register
          </button>

          {token && role === "admin" && (
            <button onClick={() => navigate("/admin")}>
              Admin Panel
            </button>
          )}

          {token && (
            <button
              className="logout"
              onClick={logout}
            >
              Logout
            </button>
          )}

          <div className="sidebar-contact">
            <div className="contact-title">
              CONTACT US
            </div>

            <a href="tel:+38972455907">
              📞 +389 72 455 907
            </a>

            <div className="contact-location">
              📍 Bitola, Macedonia
            </div>
          </div>
        </div>

        <div className="content">
          <div className="reviews-page">
            <div className="reviews-header">
              <span>HAIR LUX</span>
              <h1>Customer Reviews</h1>
              <p>Loading reviews...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>HAIR LUX</h2>

        <button onClick={() => navigate("/")}>
          Dashboard
        </button>

        <button onClick={() => navigate("/search")}>
          Search Hairstyles
        </button>

        <button onClick={() => navigate("/weather")}>
          Weather Advice
        </button>

        <button onClick={() => navigate("/reviews")}>
          Reviews
        </button>

        {token && (
          <button
            onClick={() => navigate("/appointments")}
          >
            My Appointments
          </button>
        )}

        {!token && (
          <button onClick={() => navigate("/login")}>
            Login
          </button>
        )}

        <button onClick={() => navigate("/register")}>
          Register
        </button>

        {token && role === "admin" && (
          <button onClick={() => navigate("/admin")}>
            Admin Panel
          </button>
        )}

        {token && (
          <button
            className="logout"
            onClick={logout}
          >
            Logout
          </button>
        )}

        {/* CONTACT */}
        <div className="sidebar-contact">
          <div className="contact-title">
            CONTACT US
          </div>

          <a href="tel:+38972455907">
            📞 +389 72 455 907
          </a>

          <div className="contact-location">
            📍 Bitola, Macedonia
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="content">
        <div className="reviews-page">
          <div className="reviews-header">
            <span>HAIR LUX</span>

            <h1>Customer Reviews</h1>

            <p>
              See what our clients say about their Hair Lux
              experience.
            </p>
          </div>

          {message && (
            <div className="review-message">
              {message}
            </div>
          )}

          {token && role !== "admin" && (
            <form
                className="review-form"
                onSubmit={submitReview}
            >
              <h2>Leave a Review</h2>

              <label>Hairstyle</label>

              <select
                value={hairstyle}
                onChange={(e) =>
                  setHairstyle(e.target.value)
                }
              >
                <option value="">
                  Select a hairstyle
                </option>

                {hairstyles.map((item) => (
                  <option
                    key={item._id}
                    value={item._id}
                  >
                    {item.name}
                  </option>
                ))}
              </select>

              <label>Rating</label>

              <div className="rating-select">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    className={
                      star <= rating
                        ? "star active"
                        : "star"
                    }
                    onClick={() => setRating(star)}
                  >
                    ★
                  </button>
                ))}
              </div>

              <label>Comment</label>

              <textarea
                value={comment}
                onChange={(e) =>
                  setComment(e.target.value)
                }
                placeholder="Write your experience..."
                maxLength={1000}
              />

              <button
                type="submit"
                className="review-submit"
              >
                Submit Review
              </button>
            </form>
          )}

          {!token && (
            <div className="review-login-note">
              Log in to leave a review.
            </div>
          )}

          <div className="reviews-list">
            {reviews.length === 0 ? (
              <div className="no-reviews">
                <h2>No reviews yet</h2>

                <p>
                  Be the first to share your Hair Lux
                  experience.
                </p>
              </div>
            ) : (
              reviews.map((review) => {
                const reviewUserId =
                  review.user?._id || review.user;

                const isOwner =
                  currentUser &&
                  reviewUserId &&
                  reviewUserId.toString() ===
                    currentUser.id?.toString();

                return (
                  <div
                    className="review-card"
                    key={review._id}
                  >
                    {editingId === review._id ? (
                      <div className="review-edit">
                        <label>Rating</label>

                        <div className="rating-select">
                          {[1, 2, 3, 4, 5].map(
                            (star) => (
                              <button
                                type="button"
                                key={star}
                                className={
                                  star <= editRating
                                    ? "star active"
                                    : "star"
                                }
                                onClick={() =>
                                  setEditRating(star)
                                }
                              >
                                ★
                              </button>
                            )
                          )}
                        </div>

                        <label>Comment</label>

                        <textarea
                          value={editComment}
                          onChange={(e) =>
                            setEditComment(
                              e.target.value
                            )
                          }
                          maxLength={1000}
                        />

                        <div className="review-actions">
                          <button
                            type="button"
                            onClick={() =>
                              saveEdit(review._id)
                            }
                          >
                            Save
                          </button>

                          <button
                            type="button"
                            onClick={cancelEditing}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="review-top">
                          <div>
                            <h3>
                              {review.user?.name ||
                                "Anonymous"}
                            </h3>

                            <span className="review-barber">
                              {review.hairstyle?.name ||
                                "Hair Lux"}
                            </span>
                          </div>

                          <div className="review-stars">
                            {renderStars(review.rating)}
                          </div>
                        </div>

                        <p className="review-comment">
                          {review.comment}
                        </p>

                        <small className="review-date">
                          {new Date(
                            review.createdAt
                          ).toLocaleDateString()}
                        </small>

                       {isOwner && role !== "admin" && (
                        <div className="review-actions">
                            <button
                            type="button"
                            onClick={() =>
                                startEditing(review)
                            }
                            >
                            Edit
                            </button>

                            <button
                            type="button"
                            onClick={() =>
                                deleteReview(review._id)
                            }
                            >
                            Delete
                            </button>
                        </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}