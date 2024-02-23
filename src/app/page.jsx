"use client"
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from 'next/navigation';
import styled from "@emotion/styled";
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Linear from "@/components/Linear";
import TimeTable from "@/components/TimeTable";

const Group = styled.div`
  width: 100%;
`;
const DateRange = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export default function Home() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [start, setStart] = useState(new Date().toLocaleDateString('en-CA'));
  const [end, setEnd] = useState(new Date().toLocaleDateString('en-CA'));
  const [time, setTime] = useState([9, 22]);

  async function confirm() {
    console.log(title, start, end, time);
    let res = await fetch(`/api/create-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        time: time.map(e => e * 4),
        date: start.split('-').map(e => parseInt(e)),
        duration: (new Date(end).getTime() - new Date(start).getTime()) / 86400000 + 1,
        title
      })
    });
    if (!res.ok) return;
    res = await res.json();
    router.push(`/${res.id}`);
  }

  return (
    <main>
      <Linear style={{ minHeight: '100vh' }}>
        <Stack
          spacing={5}
          direction="row"
          useFlexGap
          flexWrap="wrap"
          sx={{ width: '90%', maxWidth: '400px' }}
          justifyContent="center"
        >
          <TextField
            autoFocus
            fullWidth
            label="Title"
            variant="outlined"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <DateRange>
            <TextField
              type="date"
              autoFocus
              variant="outlined"
              value={start}
              onChange={e => setStart(e.target.value)}
            />
            -
            <TextField
              type="date"
              autoFocus
              variant="outlined"
              value={end}
              onChange={e => setEnd(e.target.value)}
            />
          </DateRange>
          <Group>
            <Typography gutterBottom>
              Time:
            </Typography>
            <Slider
              // track="inverted"
              value={time}
              getAriaValueText={v => `${v}.`}
              valueLabelDisplay="auto"
              step={1}
              marks={[0,2,4,6,8,10,12,14,16,18,20,22,24].map(e => ({ value: e, label: `${e}.` }))}
              min={0}
              max={24}
              onChange={(e, v) => setTime(v)}
            />
          </Group>
          <Button
            variant="contained"
            onClick={confirm}
            disabled={time[0] === time[1] || new Date(end).getTime() < new Date(start).getTime()}
          >Go</Button>
        </Stack>
      </Linear>
    </main>
  );
}

