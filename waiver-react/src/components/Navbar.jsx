import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import formIcon from "../assets/contact-form.png";

import { useContext } from "react";
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
            Back
          </Button>
        )}

        {location.pathname == "/view-form" && !err && (
          <Button
            variant="contained"
            type="submit"
            fullWidth
            id="download__btn"
            onClick={handleDownload}
          >
            Download
          </Button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
