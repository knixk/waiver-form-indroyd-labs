import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import formIcon from "../assets/contact-form.png";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HomeIcon from "@mui/icons-material/Home";


import { useContext } from "react";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import { MyContext } from "../App";

function Navbar() {
  const myState = useContext(MyContext);
  const { handleDownload, err } = myState;
  const navigate = useNavigate();

  let location = useLocation();

  return (
    <nav className="nav">
      <div className="waiver__logo">
        <img className="form__icon" src={formIcon} alt="form-icon" />
        <p>Waiver form</p>
      </div>

      {location.pathname != "/" && (
        <div className="btns__container">
          {location.pathname != "/" && (
            <Button
              variant="contained"
              type="submit"
              id="download__btn"
              onClick={() => {
                navigate(-1);
              }}
            >
              <ArrowBackIcon />
            </Button>
          )}

          {location.pathname == "/view-form" && !err && (
            <Button
              variant="contained"
              type="submit"
              fullWidth
              onClick={handleDownload}
            >
              <CloudDownloadIcon />
            </Button>
          )}

          {location.pathname == "/search" && !err && (
            <Button
              variant="contained"
              type="submit"
              fullWidth
              onClick={() => navigate("/")}
            >
              <HomeIcon />
            </Button>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
