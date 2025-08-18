import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Slider,
  FormControlLabel,
  Switch,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
} from "@mui/material";
import {
  Save as SaveIcon,
  History as HistoryIcon,
  Restore as RestoreIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useAuthentication } from "../../functions/useAuth";

const AISettings = () => {
  const { user } = useAuthentication();
  const [selectedGroup, setSelectedGroup] = useState("");
  const [groups, setGroups] = useState([]);
  const [messageLimit, setMessageLimit] = useState(50);
  const [noLimit, setNoLimit] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [promptHistory, setPromptHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", severity: "info" });

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    fetchSystemPrompts();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/admin/simulation_groups`,
        {
          headers: {
            Authorization: `Bearer ${user.signInUserSession.idToken.jwtToken}`,
          },
        }
      );
      const data = await response.json();
      setGroups(data);
      if (data.length > 0) {
        setSelectedGroup(data[0].simulation_group_id);
      }
    } catch (error) {
      showAlert("Failed to fetch simulation groups", "error");
    }
  };

  const fetchSystemPrompts = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/admin/system_prompts`,
        {
          headers: {
            Authorization: `Bearer ${user.signInUserSession.idToken.jwtToken}`,
          },
        }
      );
      const data = await response.json();
      setSystemPrompt(data.current_prompt || "");
      setPromptHistory(data.history || []);
    } catch (error) {
      showAlert("Failed to fetch system prompts", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateSystemPrompt = async () => {
    if (!selectedGroup || !systemPrompt.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/admin/update_system_prompt?simulation_group_id=${selectedGroup}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.signInUserSession.idToken.jwtToken}`,
          },
          body: JSON.stringify({
            prompt_content: systemPrompt,
            created_by: user.attributes.email,
          }),
        }
      );

      if (response.ok) {
        showAlert("System prompt updated successfully", "success");
        fetchSystemPrompts();
      } else {
        showAlert("Failed to update system prompt", "error");
      }
    } catch (error) {
      showAlert("Failed to update system prompt", "error");
    } finally {
      setLoading(false);
    }
  };

  const restorePrompt = async (historyId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/admin/restore_system_prompt?simulation_group_id=${selectedGroup}&history_id=${historyId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.signInUserSession.idToken.jwtToken}`,
          },
        }
      );

      if (response.ok) {
        showAlert("System prompt restored successfully", "success");
        fetchSystemPrompts();
        setHistoryDialogOpen(false);
      } else {
        showAlert("Failed to restore system prompt", "error");
      }
    } catch (error) {
      showAlert("Failed to restore system prompt", "error");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, severity) => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: "", severity: "info" }), 5000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box sx={{ p: 3, ml: 28, mt: 8 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <SettingsIcon sx={{ mr: 2, color: "#10b981" }} />
        <Typography variant="h4" sx={{ fontWeight: 600, color: "#1f2937" }}>
          AI Settings
        </Typography>
      </Box>

      {alert.show && (
        <Alert severity={alert.severity} sx={{ mb: 3 }}>
          {alert.message}
        </Alert>
      )}

      {/* Group Selection */}
      <Card sx={{ mb: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, color: "#374151" }}>
            Simulation Group
          </Typography>
          <TextField
            select
            fullWidth
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            SelectProps={{ native: true }}
            variant="outlined"
          >
            <option value="">Select a group...</option>
            {groups.map((group) => (
              <option key={group.simulation_group_id} value={group.simulation_group_id}>
                {group.group_name}
              </option>
            ))}
          </TextField>
        </CardContent>
      </Card>

      {/* Message Limit Settings */}
      <Card sx={{ mb: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, color: "#374151" }}>
            AI Message Limit
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={noLimit}
                onChange={(e) => setNoLimit(e.target.checked)}
                color="primary"
              />
            }
            label="No message limit"
            sx={{ mb: 2 }}
          />
          {!noLimit && (
            <Box sx={{ px: 2 }}>
              <Typography gutterBottom>
                Message limit: {messageLimit}
              </Typography>
              <Slider
                value={messageLimit}
                onChange={(e, newValue) => setMessageLimit(newValue)}
                min={1}
                max={200}
                step={1}
                marks={[
                  { value: 1, label: "1" },
                  { value: 50, label: "50" },
                  { value: 100, label: "100" },
                  { value: 200, label: "200" },
                ]}
                sx={{
                  color: "#10b981",
                  "& .MuiSlider-thumb": {
                    backgroundColor: "#10b981",
                  },
                  "& .MuiSlider-track": {
                    backgroundColor: "#10b981",
                  },
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* System Prompt Editor */}
      {selectedGroup && (
        <Card sx={{ mb: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" sx={{ color: "#374151" }}>
                System Prompt Editor
              </Typography>
              <Button
                startIcon={<HistoryIcon />}
                onClick={() => setHistoryDialogOpen(true)}
                variant="outlined"
                sx={{
                  borderColor: "#10b981",
                  color: "#10b981",
                  "&:hover": {
                    borderColor: "#059669",
                    backgroundColor: "#f0fdf4",
                  },
                }}
              >
                View History
              </Button>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={12}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Enter the system prompt for the AI..."
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Button
              startIcon={<SaveIcon />}
              onClick={updateSystemPrompt}
              disabled={loading || !systemPrompt.trim()}
              variant="contained"
              sx={{
                backgroundColor: "#10b981",
                "&:hover": {
                  backgroundColor: "#059669",
                },
                "&:disabled": {
                  backgroundColor: "#d1d5db",
                },
              }}
            >
              {loading ? "Saving..." : "Save System Prompt"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* History Dialog */}
      <Dialog
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>System Prompt History</DialogTitle>
        <DialogContent>
          {promptHistory.length === 0 ? (
            <Typography color="textSecondary">No history available</Typography>
          ) : (
            <List>
              {promptHistory.map((item, index) => (
                <React.Fragment key={item.history_id}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="subtitle2">
                            {formatDate(item.created_at)}
                          </Typography>
                          <Chip
                            label={item.created_by || "Unknown"}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          sx={{
                            mt: 1,
                            maxHeight: 100,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.prompt_content.substring(0, 200)}
                          {item.prompt_content.length > 200 && "..."}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => restorePrompt(item.history_id)}
                        disabled={loading}
                        sx={{ color: "#10b981" }}
                      >
                        <RestoreIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < promptHistory.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AISettings;