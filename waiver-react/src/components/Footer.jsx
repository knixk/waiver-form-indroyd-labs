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
    <>
      {location.pathname == "/search" || err ? (
        <></>
      ) : (
        <footer className="footer">
          <div className="waiver__logo footer__logo">
            <img
              className="form__icon footer__icon"
              src={formIcon}
              alt="form-icon"
            />
            <p> Waiver form &copy; 2024</p>
          </div>
        </footer>
      )}
    </>
  );
}

export default Navbar;
