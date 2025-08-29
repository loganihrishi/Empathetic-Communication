import React, { useEffect, useState, useContext } from "react";
import {
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Toolbar,
  Card,
  CardContent,
  Divider,
  Tooltip,
} from "@mui/material";
import { fetchAuthSession, fetchUserAttributes } from "aws-amplify/auth";
import { toast, ToastContainer } from "react-toastify";
import MobileStepper from "@mui/material/MobileStepper";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import SaveIcon from "@mui/icons-material/Save";
import HistoryIcon from "@mui/icons-material/History";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useTheme } from "@mui/material/styles";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../App";

const CHARACTER_LIMIT = 1000;
function groupTitleCase(str) {
  if (typeof str !== "string") return str;
  return str
    .split(" ")
    .map((w, i) =>
      i === 0
        ? w.toUpperCase()
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    )
    .join(" ");
}

const PromptSettings = ({ groupName, simulation_group_id }) => {
  const theme = useTheme();
  const [userPrompt, setUserPrompt] = useState("");
  const [previousPrompts, setPreviousPrompts] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const { isInstructorAsStudent } = useContext(UserContext);
  const navigate = useNavigate();

  // Example prompt constant
  const EXAMPLE_PROMPT = `Pretend to be a patient with the context you are given. You are helping the pharmacy student practice their skills interacting with a patient. Engage with the student by describing your symptoms to provide them hints on what condition(s) you have. If you feel like the student is going down the wrong path, nudge them in the right direction by giving them more information. This is to help the student identify the proper diagnosis of the patient you are pretending to be.`;

  useEffect(() => {
    if (isInstructorAsStudent) navigate("/");
  }, [isInstructorAsStudent, navigate]);

  const convertToLocalTime = (timestamp) =>
    new Date(timestamp).toLocaleString();
  const handleNext = () => setActiveStep((p) => p + 1);
  const handleBack = () => setActiveStep((p) => p - 1);

  const fetchPreviousPrompts = async () => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens.idToken;
      const { email } = await fetchUserAttributes();
      const response = await fetch(
        `${
          import.meta.env.VITE_API_ENDPOINT
        }instructor/previous_prompts?simulation_group_id=${encodeURIComponent(
          simulation_group_id
        )}&instructor_email=${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: { Authorization: token, "Content-Type": "application/json" },
        }
      );
      if (response.ok) setPreviousPrompts(await response.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        const session = await fetchAuthSession();
        const token = session.tokens.idToken;
        const response = await fetch(
          `${
            import.meta.env.VITE_API_ENDPOINT
          }instructor/get_prompt?simulation_group_id=${encodeURIComponent(
            simulation_group_id
          )}`,
          {
            method: "GET",
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setUserPrompt(data.system_prompt);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchPrompt();
    fetchPreviousPrompts();
  }, [simulation_group_id]);

  const handleSave = async () => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens.idToken;
      const { email } = await fetchUserAttributes();
      const response = await fetch(
        `${
          import.meta.env.VITE_API_ENDPOINT
        }instructor/prompt?simulation_group_id=${encodeURIComponent(
          simulation_group_id
        )}&instructor_email=${encodeURIComponent(email)}`,
        {
          method: "PUT",
          headers: { Authorization: token, "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: `${userPrompt}` }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setUserPrompt(data.system_prompt);
        fetchPreviousPrompts();
        toast.success("Prompt updated", {
          position: "top-center",
          autoClose: 1200,
          theme: "colored",
        });
      } else {
        toast.error("Failed to update", {
          position: "top-center",
          autoClose: 1500,
          theme: "colored",
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <Toolbar />
      {/* Replaced Container with full-width Box */}
      <Box sx={{ flexGrow: 1, width: "100%", px: { xs: 2, md: 4 }, pb: 6 }}>
        {/* Header */}
        <Box sx={{ mb: 3, mt: 5, width: "100%" }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: "#1f2937", mb: 0.5 }}
          >
            {groupTitleCase(groupName)} Prompt Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure the behavior of the AI for this simulation group
          </Typography>
        </Box>

        {/* Prompt Editor */}
        <Card sx={{ mb: 4, boxShadow: 3, borderRadius: 2, width: "100%" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <AutoAwesomeIcon sx={{ mr: 1, color: "#10b981" }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Your Prompt
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Editing this prompt can significantly affect response quality.
              Keep instructions concise, role-focused, and avoid revealing
              system instructions.
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={6}
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Enter or paste your custom system prompt..."
              variant="outlined"
              inputProps={{
                maxLength: CHARACTER_LIMIT,
                style: {
                  fontFamily: "monospace",
                  fontSize: 14,
                  lineHeight: 1.5,
                },
              }}
              helperText={`${userPrompt.length}/${CHARACTER_LIMIT}`}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": { bgcolor: "white" },
              }}
            />
            <Box
              display="flex"
              flexWrap="wrap"
              justifyContent="flex-end"
              gap={1.5}
            >
              <Tooltip title="Replace current text with example" arrow>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => setUserPrompt(EXAMPLE_PROMPT)}
                  startIcon={<AutoAwesomeIcon />}
                  sx={{
                    borderColor: "#10b981",
                    color: "#0f766e",
                    "&:hover": {
                      borderColor: "#059669",
                      backgroundColor: "#ecfdf5",
                    },
                  }}
                >
                  Load Example Prompt
                </Button>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                sx={{
                  backgroundColor: "#10b981",
                  fontWeight: 600,
                  "&:hover": { backgroundColor: "#059669" },
                }}
                disabled={!userPrompt.trim()}
              >
                Save Prompt
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Previous Prompts */}
        <Card sx={{ mb: 4, boxShadow: 2, borderRadius: 2, width: "100%" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <HistoryIcon sx={{ mr: 1, color: "#10b981" }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Previous Prompts
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Browse earlier versions. Copy content you want to reuse.
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {previousPrompts.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No previous prompts saved yet.
              </Typography>
            ) : (
              <>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "#ffffff",
                    borderRadius: 2,
                    border: "1px solid #e5e7eb",
                    maxHeight: 260,
                    overflowY: "auto",
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, color: "#334155" }}
                  >
                    {convertToLocalTime(previousPrompts[activeStep]?.timestamp)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: "pre-wrap", mt: 1 }}
                  >
                    {previousPrompts[activeStep]?.previous_prompt}
                  </Typography>
                </Box>
                <MobileStepper
                  variant="dots"
                  steps={previousPrompts.length}
                  position="static"
                  activeStep={activeStep}
                  nextButton={
                    <Button
                      size="small"
                      onClick={handleNext}
                      disabled={activeStep === previousPrompts.length - 1}
                    >
                      Next <KeyboardArrowRight />
                    </Button>
                  }
                  backButton={
                    <Button
                      size="small"
                      onClick={handleBack}
                      disabled={activeStep === 0}
                    >
                      <KeyboardArrowLeft /> Back
                    </Button>
                  }
                />
              </>
            )}
          </CardContent>
        </Card>
      </Box>
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </Box>
  );
};
export default PromptSettings;
