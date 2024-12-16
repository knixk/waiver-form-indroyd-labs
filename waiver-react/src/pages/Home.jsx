import React, { useState, useEffect } from "react";
import { Button, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// import { useHistory, useLocation } from "react-router";
import dummyCenter from "../misc/dummyData/dummyCenters/dummyCenter.json";

// console.log(dummyCenter, "=======im dc")

const logo = "https://dypdvfcjkqkg2.cloudfront.net/large/5862799-1989.jpg";

const aws_url =
  "https://kekb2shy3xebaxqohtougon6ma0adifj.lambda-url.us-east-1.on.aws";

// import logo from "../assets/unicef.png";
import { useContext } from "react";
import { MyContext } from "../App";

function Home() {
  const [layer, setLayer] = useState(1);
  const navigate = useNavigate();
  const queryParameters = new URLSearchParams(window.location.search);
  const centerParams = queryParameters.get("center");

  // console.log(import.meta.env.VITE_MODE);
  // const history = useHistory();
  // const location = useLocation();

  const myState = useContext(MyContext);
  const {
    centerInfo,
    setCenterInfo,
    centerAddInfo,
    setCenterAddInfo,
    centerID,
    setCenterID,
  } = myState;

  const handleNext = () => {
    if (layer < 3) {
      setLayer(layer + 1);
    }
  };

  useEffect(() => {
    if (import.meta.env.VITE_MODE == "prod") {
      console.log("inside prod");
      const postCenter = async (centerId) => {
        const center = `${aws_url}/get-center`;
        const options = {
          center_id: centerId,
        };

        try {
          const response = await axios.post(center, options);
          // console.log("Response:", response.data.data);
          setCenterInfo(response.data.data);
          console.log(response.data.data);
          // const jsonData = J
          setCenterAddInfo(response.data.data);
          return response.data.data; // Return the response data
        } catch (error) {
          console.error(
            "Error posting center:",
            error.response?.data || error.message // Handle error gracefully
          );
          throw error; // Rethrow the error for further handling
        }
      };
      if (!centerParams) {
        setCenterID(5);
        // const params = new URLSearchParams({ ["center"]: 5 });
        // history.replace({
        //   pathname: location.pathname,
        //   search: params.toString(),
        // });

        // console.log("no paramss");
        postCenter(5);
      } else {
        centerParams && setCenterID(centerParams);
        centerParams && postCenter(centerParams);
      }
    }

    if (import.meta.env.VITE_MODE == "dev") {
      console.log("inside dev mode...");
      setCenterInfo(dummyCenter);
      setCenterAddInfo(dummyCenter);
      setCenterID(5);

      let prsedData = JSON.parse(dummyCenter.additional_info);
      console.log(prsedData);
    }
  }, []);

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
      {centerInfo && (
        <Box
          sx={{
            opacity: layer === 1 ? 1 : 0, // Fade in for the first screen
            transition: "opacity 0.5s ease",
            position: "absolute",
            width: "100%",
            maxWidth: "600px",
          }}
        >
          {centerInfo && (
            <img
              src={JSON.parse(centerInfo.additional_info).img}
              style={{ width: 200, borderRadius: 5, marginBottom: 10 }}
              alt="logo"
            />
          )}

          {layer === 1 && (
            <Box>
              {/* <Typography variant="h4">company name</Typography> */}

              <Typography variant="h4">
                {centerInfo && centerInfo.center_name}
              </Typography>

              <Typography color={"gainsboro"} sx={{ mt: 2 }}>
                {centerInfo && JSON.parse(centerInfo.additional_info).intro}
              </Typography>

              <Button
                variant="contained"
                onClick={() => navigate(`/form?center=${centerID}`)}
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
      )}
    </Box>
  );
}

export default Home;
