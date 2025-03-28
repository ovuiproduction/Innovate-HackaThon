import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import '@fortawesome/fontawesome-free/css/all.css';
import "../css/ActiveCrops.css";

const ActiveCrops = () => {
  const [email, setEmail] = useState("");
  const [activeCrops, setActiveCrops] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token:", token);

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setEmail(decoded.email || ""); // Set email from token
      } catch (error) {
        console.error("Invalid token", error);
      }
    } else {
      navigate("/login/farmer"); // Redirect to login if no token found
    }
  }, [navigate]);

  // Fetch crops only after email is set
  useEffect(() => {
    if (email) {
      fetchCrops(email);
    }
  }, [email]); // Runs only when email is updated

  const fetchCrops = async (userEmail) => {
    try {
      console.log("Fetching crops for email:", userEmail);
      const response = await fetch(`http://localhost:4000/active-crops?email=${encodeURIComponent(userEmail)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch crops");
      }

      const data = await response.json();
      console.log("Fetched Crops:", data);
      setActiveCrops(data);
    } catch (error) {
      console.error("Error fetching active crops:", error);
    }
  };

  const deleteCrop = async (cropId) => {
    try {
      console.log("Deleting crop with ID:", cropId);
      const response = await fetch(`http://localhost:4000/delete-crop/${cropId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete crop");
      }

      // Remove deleted crop from UI
      setActiveCrops((prevCrops) => prevCrops.filter((crop) => crop._id !== cropId));
      console.log("Crop deleted successfully");
    } catch (error) {
      console.error("Error deleting crop:", error);
    }
  };

  let returnHome = async (e) => {
    e.preventDefault();
    navigate("/home-farmer");
  };

  return (
    <>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-T3c6oIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN"
        crossOrigin="anonymous"
      ></link>
      <script
        src="https://kit.fontawesome.com/dd438282bc.js"
        crossOrigin="anonymous"
      ></script>

      <div className="activecrop-container">
        <h2>Active Crops for Sale</h2>
        <div className="activecrop-list">
          {activeCrops.length > 0 ? (
            activeCrops.map((crop) => (
              <div key={crop._id} className="activecrop-card">
                {crop.imageBase64 && (
                  <img
                    src={crop.imageBase64} // Directly use the Base64 string from MongoDB
                    alt={crop.cropname}
                    className="activecrop-image"
                  />
                )}
                <h3 className="activecrop-name">{crop.cropname}</h3>
                <p className="activecrop-price">Price: ₹{crop.price_per_kg} per kg</p>
                <p className="activecrop-quantity">Quantity: {crop.quantity} kg</p>
                <p className="activecrop-earnings">Earnings: ₹{crop.earnings}</p>
                <p className="activecrop-rating">Avg Rating: {crop.rating?.average ?? "N/A"} / 5</p>

                {/* Delete Button (Dustbin Icon) */}
                <button className="activecrop-delete-button" onClick={() => deleteCrop(crop._id)}>
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            ))
          ) : (
            <p>No active crops available.</p>
          )}
        </div>
      </div>

      <script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL"
        crossOrigin="anonymous"
      ></script>
    </>
  );
};

export default ActiveCrops;