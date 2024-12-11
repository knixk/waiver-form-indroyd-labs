import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Form from "./pages/Form";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ViewForm from "./pages/ViewForm";
import Error from "./pages/Error";
import axios from "axios";

import { createContext } from "react";

// Create the context
export const MyContext = createContext();

const AWS_URI =
  "https://kekb2shy3xebaxqohtougon6ma0adifj.lambda-url.us-east-1.on.aws/";

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import toast, { Toaster } from "react-hot-toast";

const queryParameters = new URLSearchParams(window.location.search);
const centerParams = queryParameters.get("center");

console.log(centerParams);

// context api allows us to use state from one place in every component, which is very handy

function App() {
  const [sign, setSign] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [formData, setFormData] = useState({});
  const [companyLogo, setCompanyLogo] = useState();
  const [questions, setQuestions] = useState(null);
  const [extraFields, setExtraFields] = useState();
  const [disabled, setDisabled] = useState(false);
  const [displayForm, setDisplayForm] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [templateId, setTemplateId] = useState();
  const [submissionID, setSubmissionID] = useState();
  const [submissions, setSubmissions] = useState();
  const [viewParticipant, setViewParticipant] = useState();
  const [err, setErr] = useState(false);
  const [awsURI, setAWSURI] = useState(AWS_URI);
  const [wantParticipants, setWantParticipants] = useState(true);

  const handleDownload = async () => {
    const formElement = document.querySelector(".form__container__main");
    const canvas = await html2canvas(formElement, {
      useCORS: true,
      scale: 0.65,
    });

    // Get the dimensions of the canvas
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const pdf = new jsPDF({
      unit: "px", // Use pixels as the unit
      format: [canvasWidth, canvasHeight], // Set PDF page size to canvas dimensions
    });

    pdf.addImage(canvas, "PNG", 0, 0, canvasWidth, canvasHeight); // Adding the canvas to the PDF
    const pdfBlob = pdf.output("blob");

    // Create a downloadable link
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "download.pdf"; // File name for the download
    document.body.appendChild(a); // Append the link to the body
    a.click(); // Trigger the download
    document.body.removeChild(a); // Clean up the link
    URL.revokeObjectURL(url); // Release the URL

    toast.success("Download started...");
  };

  useEffect(() => {
    // const getCenterByID = async (id) => {
    //   let ans = null;
    //   const center_url = `http://localhost:5050/center-by-id`;

    //   const options = {
    //     center_id: id,
    //   };

    //   try {
    //     // const response = await axios.post(templates, options);
    //     // ans = response.data.template_id;
    //     setTemplateId(1);
    //   } catch (error) {
    //     console.error(error);
    //     toast("No form found...");
    //     setTimeout(() => navigate("/"), 3000);
    //   }

    //   return ans;
    // };

    const postCenter = async (centerId) => {

      const center = `http://localhost:5050/get-center`;
      const options = {
        center_id: centerId,
      };

      try {
        const response = await axios.post(center, options);
        console.log("Response:", response.data);
        return response; // Return the response data
      } catch (error) {
        console.error(
          "Error posting center:",
          error.response?.data || error.message // Handle error gracefully
        );
        throw error; // Rethrow the error for further handling
      }
    };
    const fetchTemplate = async (t_id) => {
      const templates = `${aws_url}/post-center`;

      const options = {
        id: t_id,
      };

      try {
        // const response = await axios.post(templates, options);
        // const myData = JSON.parse(response.data.data[0].template_config);

        if (true) {
          console.log("sinde");
          // setQuestions(myData.questions);
          // setCompanyLogo(myData.company_logo);
          // setExtraFields(myData.extra_participants_form_fields);
          // setDisplayForm(true);
          // setCompanyName(myData.company_name);

          // use local template
          setQuestions(template_config.template_config.questions);
          setCompanyLogo(template_config.template_config.company_logo);
          setExtraFields(
            template_config.template_config.extra_participants_form_fields
          );
          setDisplayForm(true);
          setCompanyName(template_config.template_config.company_name);
          setWantParticipants(
            template_config.template_config.want_to_add_participants
          );

          setLoading(false);
        }
      } catch (error) {
        toast("template doesn't exist");
        console.error(
          "Error:",
          error.response ? error.response.data : error.message
        );
      }
    };

    // const asyncFnStitch = async () => {
    //   const data =
    //     centerParams && (await getTemplateIdFromCenterID(centerParams));
    //   data && (await fetchTemplate(data));
    // };

    // asyncFnStitch();
    // fetchTemplate();

    postCenter(1);
  }, []);

  return (
    <MyContext.Provider
      value={{
        templateId,
        setTemplateId,
        loading,
        setLoading,
        companyName,
        setCompanyName,
        displayForm,
        setDisplayForm,
        disabled,
        setDisabled,
        extraFields,
        setExtraFields,
        sign,
        setSign,
        participants,
        setParticipants,
        formData,
        setFormData,
        companyLogo,
        setCompanyLogo,
        questions,
        setQuestions,
        handleDownload,
        submissionID,
        setSubmissionID,
        submissions,
        setSubmissions,
        viewParticipant,
        setViewParticipant,
        err,
        setErr,
        awsURI,
        wantParticipants,
        setWantParticipants,
      }}
    >
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/form" element={<Form />} />
          <Route path="/search" element={<Search />} />
          <Route path="/view-form" element={<ViewForm />} />
          <Route path="*" element={<Error />} />
        </Routes>
        <Footer />
      </Router>
      <Toaster />
    </MyContext.Provider>
  );
}

export default App;
