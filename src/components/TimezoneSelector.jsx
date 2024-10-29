import React from "react";
import { useState } from "react";
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { getTimezoneHere, timezones } from "@/utils";

export default function TimezoneSelector({ open, onClose, payload={} }) {
  const [timezone, setTimezone] = useState(payload.defaultValue || "");
  const [inputTimezone, setInputTimezone] = useState(payload.defaultValue || "");

  return (
    <Dialog fullWidth open={open} onClose={() => onClose(false)} sx={{
      "& .MuiDialog-paper": {
        mx: 2, width: "calc(100% - 32px)", overflow: "visible"
      }
    }}>
      <DialogTitle>
        Choose timezone
        <Chip
          icon={<LocationOnIcon/>}
          label="My location"
          color="primary"
          sx={{ float: "right" }}
          onClick={() => {
            setTimezone(getTimezoneHere());
            setInputTimezone(getTimezoneHere());
          }}
        />
      </DialogTitle>
      <DialogContent>
        <Autocomplete
          disablePortal
          autoComplete
          disableClearable
          options={timezones}
          required
          size="small"
          fullWidth
          value={timezone}
          onChange={(evt, newValue) => setTimezone(newValue)}
          inputValue={inputTimezone}
          onInputChange={(evt, newValue) => setInputTimezone(newValue)}
          renderInput={params => (
            <TextField
              {...params}
              fullWidth
              size="small"
              label="Timezone"
              variant="outlined"
              sx={{ my: 2, fontFamily: "consolas" }}
            />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)} color="error">Cancel</Button>
        <Button onClick={() => onClose(timezone)}>Set</Button>
      </DialogActions>
    </Dialog>
  )
}