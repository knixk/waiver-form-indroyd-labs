import React, { useState, useEffect } from "react";
import { Button, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// import dummyCenter from "../misc/dummyData/dummyCenters/dummyCenter.json";

const uri =
  import.meta.env.VITE_MODE == "prod"
    ? import.meta.env.VITE_AWS_URI
    : import.meta.env.VITE_API_LOCAL_URI;

import { useContext } from "react";
import { MyContext } from "../App";

function Home() {
  const [layer, setLayer] = useState(1);
  const navigate = useNavigate();
  const queryParameters = new URLSearchParams(window.location.search);
  let centerParams = queryParameters.get("center");

  // console.log(import.meta.env.VITE_MODE);

  const myState = useContext(MyContext);
  const {
    centerInfo,
    setCenterInfo,
    centerID,
    setCenterID,
    centerName,
    setCenterName,
  } = myState;

  // setCenterName(centerParams);
  useEffect(() => {
    // takes a name returns an id
    const getCenterIdFromCenterName = async (centerName) => {
      let centerId = null;
      const endpoint = `${uri}/center-id-from-center-name`;

      const options = {
        center_name: centerName,
      };

      try {
        const response = await axios.post(endpoint, options);
        centerId = response.data.response.center_id;
      } catch (error) {
        console.error(error);
        toast("Center not found...");
        setTimeout(() => navigate("/"), 5000);
      }

      return centerId;
    };

    const asyncSt = async () => {
      if (
        import.meta.env.VITE_MODE == "prod" ||
        import.meta.env.VITE_MODE == "dev"
      ) {
        // console.log("inside prod");
        const postCenter = async (centerId) => {
          const center = `${uri}/get-center`;
          const options = {
            center_id: centerId,
          };

          try {
            const response = await axios.post(center, options);
            console.log(
              JSON.parse(response.data.response.data.additional_info).img
            );
            setCenterInfo(response.data.response.data);
            return response.data.data; // Return the response data
          } catch (error) {
            console.error(
              "Error posting center:",
              error.response?.data || error.message // Handle error gracefully
            );
            throw error; // Rethrow the error for further handling
          }
        };

        console.log(centerParams);
        if (!centerParams) {
          console.log("here");
          setCenterID(6);
          postCenter(6);
          // setCenterName("Flea market stall");
          // centerParams = "Flea market stall";
        } else {
          // get the center id from center name, and maintain the rest flow
          const my_center_id = await getCenterIdFromCenterName(centerParams);
          console.log(my_center_id, "im center id");

          my_center_id && setCenterID(my_center_id);
          my_center_id && postCenter(my_center_id);

          setCenterName(centerInfo && centerInfo.center_name);
        }
      }
    };

    asyncSt();
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
                onClick={() => navigate(`/form?center=${centerName}`)}
                sx={{ mt: 2.5 }}
              >
                Get Started
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

export default Home;
