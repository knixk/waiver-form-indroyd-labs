import { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  TextField,
  Button,
  Container,
  Box,
  Typography,
  Paper,
  Grid,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

const uri =
  import.meta.env.VITE_MODE == "prod"
    ? import.meta.env.VITE_AWS_URI
    : import.meta.env.VITE_API_LOCAL_URI;

// console.log(import.meta.env.VITE_MODE);

import { useContext } from "react";
import { MyContext } from "../App";
import SearchIcon from "@mui/icons-material/Search";

function Search() {
  // const localJWT = localStorage.setItem('waiver_form_jwt_token')

  const myState = useContext(MyContext);
  const {
    submissionID,
    setSubmissionID,
    setSubmissions,
    viewParticipant,
    setViewParticipant,
    setErr,
  } = myState;

  const [input, setInput] = useState("");
  const [params, setParams] = useState("search");
  const [data, setData] = useState([]);
  const [jwt, setJwt] = useState("");
  const [templateData, setTemplateData] = useState({});
  const navigate = useNavigate();

  const getSubmissions = async (data) => {
    const submissions = `${uri}/submissions${params}`;
    // console.log(uri, "IM");
    try {
      const response = await axios.get(submissions, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      // const tmp_data = JSON.parse(response.data.data[0].submission_data);
      // setTemplateData(tmp_data);
      localStorage.setItem("waiver_form_jwt_token", jwt);

      return response.data.response;
    } catch (error) {
      if (error.status == 403) {
        toast.error("Invalid token...");
      } else {
        toast("Data not found...");

        // console.error(
        //   "Error:",
        //   error.response ? error.response.data : error.message
        // );
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input) return;

    const data = { mobile_number: input };
    const res = await getSubmissions(data);

    if (!res) {
      // console.error("Error fetching data..");
      return;
    }

    if (res.length === 0) {
      toast("No data found.");
    }
    setData(res);
    setSubmissions(res);
  };

  const handleChange = (e) => {
    const { value } = e.target;
    setInput(value);

    const params = new URLSearchParams({ search: value });
    setParams(`?${params.toString()}`);
  };

  useEffect(() => {
    setErr(false);
    const tkn_data = localStorage.getItem("waiver_form_jwt_token");
    if (tkn_data) {
      toast.success("Token found in local storage..");
      setJwt(tkn_data);
    } else {
      toast("Please enter the jwt token..", {
        icon: "🪙",
      });
    }
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Toaster />
      <Paper elevation={3} sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <TextField
              label="JWT Token"
              variant="outlined"
              value={jwt}
              onChange={(e) => setJwt(e.target.value)}
              fullWidth
            />
            <TextField
              fullWidth
              value={input}
              onChange={handleChange}
              label="Enter name / email / mobile number"
              variant="outlined"
              required
            />
            <Button
              variant="contained"
              color="primary"
              sx={{ height: 55 }}
              onClick={(e) => handleSubmit(e)}
            >
              <SearchIcon />
            </Button>
          </Box>
        </form>

        <Box mt={4}>
          {data && data.length > 0 ? (
            <Grid container spacing={3}>
              {data.map((i) => {
                console.log(i);
                return (
                  <Grid item xs={12} key={i.id}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                      <Typography variant="h6">Name: {i.name}</Typography>
                      <Typography>Mobile Number: {i.mobile_number}</Typography>
                      <Typography>Email: {i.email}</Typography>
                      <Typography>Submission ID: {i.id}</Typography>
                      <Typography>
                        Date: {new Date(i.submission_date).toDateString()}
                      </Typography>

                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2, ml: 2 }}
                        onClick={() => {
                          setViewParticipant(i);
                          setSubmissionID(i.id);
                          navigate("/view-form", {
                            state: {
                              submission_id: i.id,
                              center_id: i.center_id,
                            },
                          });
                        }}
                      >
                        View
                      </Button>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Typography variant="body1" color="textSecondary">
              No data to display.
            </Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default Search;
