import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function ForYou() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchForYou = async () => {
      try {
        const token = localStorage.getItem("wishcart_token");
        if (!token) {
          setError("Please log in to see your personalized recommendations.");
          setLoading(false);
          return;
        }
        const res = await api.get('/api/history/for-you');
        setRecommendations(res.data.recommendations || []);
      } catch (err) {
        setError("Could not load recommendations. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchForYou();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#faf9f7", padding: "60px 40px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <p style={{ fontFamily: "Manrope, sans-serif", fontSize: "11px", letterSpacing: "4px", color: "#b5a99a", textTransform: "uppercase", marginBottom: "12px" }}>
          Curated For You
        </p>
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 300, color: "#2c2825", margin: 0, lineHeight: 1.2 }}>
          Your Personal Edit
        </h1>
        <div style={{ width: "40px", height: "1px", background: "#c9b99a", margin: "20px auto 0" }} />
      </div>

      {/* States */}
      {loading && (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <p style={{ fontFamily: "Manrope, sans-serif", fontSize: "12px", letterSpacing: "3px", color: "#b5a99a", textTransform: "uppercase" }}>
            Curating your edit...
          </p>
        </div>
      )}

      {error && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <p style={{ fontFamily: "Manrope, sans-serif", color: "#c0392b", fontSize: "14px" }}>{error}</p>
        </div>
      )}

      {!loading && !error && recommendations.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", color: "#9a8f84", fontWeight: 300 }}>
            Browse some products first — we'll tailor your edit.
          </p>
          <button
            onClick={() => navigate("/")}
            style={{ marginTop: "24px", padding: "12px 32px", background: "#2c2825", color: "#faf9f7", border: "none", fontFamily: "Manrope, sans-serif", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}
          >
            Explore Collection
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && recommendations.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "32px", maxWidth: "1200px", margin: "0 auto" }}>
          {recommendations.map((product) => (
            <div
              key={product._id}
              onClick={() => navigate(`/product/${product._id}`)}
              style={{ cursor: "pointer", background: "#fff", overflow: "hidden", transition: "transform 0.3s ease", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div style={{ aspectRatio: "3/4", overflow: "hidden", background: "#f5f3f0" }}>
                <img
                  src={product.images?.[0] || "/placeholder.jpg"}
                  alt={product.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                  onMouseEnter={e => e.target.style.transform = "scale(1.04)"}
                  onMouseLeave={e => e.target.style.transform = "scale(1)"}
                />
              </div>
              <div style={{ padding: "16px 20px 20px" }}>
                <p style={{ fontFamily: "Manrope, sans-serif", fontSize: "10px", letterSpacing: "2px", color: "#b5a99a", textTransform: "uppercase", margin: "0 0 6px" }}>
                  {product.category}
                </p>
                <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "18px", fontWeight: 400, color: "#2c2825", margin: "0 0 8px", lineHeight: 1.3 }}>
                  {product.name}
                </h3>
                <p style={{ fontFamily: "Manrope, sans-serif", fontSize: "13px", color: "#6b5f54", margin: 0 }}>
                  ₹{product.price?.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}