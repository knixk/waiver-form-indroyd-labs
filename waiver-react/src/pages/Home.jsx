import React, { useState } from "react";
import { Button, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const logo = "https://dypdvfcjkqkg2.cloudfront.net/large/5862799-1989.jpg";
// import logo from "../assets/unicef.png";

function Home() {
  const [layer, setLayer] = useState(1);
  const navigate = useNavigate();

  const handleNext = () => {
    if (layer < 3) {
      setLayer(layer + 1);
    }
  };

  return (
    <Box
      className="homepage"
      sx={{
        width: "100vw",
        height: "90vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        backgroundColor: "#1e88e5",
        color: "#fff",
        overflow: "hidden",
        position: "relative",
        transition: "background-color 0.5s ease",
      }}
    >
      {/* First Screen */}
      <Box
        sx={{
          opacity: layer === 1 ? 1 : 0, // Fade in for the first screen
          transition: "opacity 0.5s ease",
          position: "absolute",
          width: "100%",
          maxWidth: "600px",
        }}
      >
        <img
          src={logo}
          style={{ width: 200, borderRadius: 5, marginBottom: 10 }}
          alt="logo"
        />

        {layer === 1 && (
          <Box>
            {/* <Typography variant="h4">company name</Typography> */}

            <Typography variant="h4">Company name</Typography>

            <Typography color={"gainsboro"} sx={{ mt: 2 }}>
              Don't let queues eat up your time, use online forms instead!
            </Typography>

            <Button
              variant="contained"
              onClick={() => navigate("/form?center=3")}
              sx={{ mt: 2.5 }}
            >
              Get Started
            </Button>

            {/* <Button
              variant="contained"
              onClick={() => navigate("/search")}
              sx={{ mt: 2.5, ml: 2 }}
            >
              Search forms
            </Button> */}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Home;
