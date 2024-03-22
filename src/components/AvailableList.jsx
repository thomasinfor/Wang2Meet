"use client"
import React from "react";
import styled from "@emotion/styled";
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Linear from "@/components/Linear";

const AvailableListContainer = styled(Linear)`
  user-select: none;
  box-sizing: border-box;
  justify-content: flex-start;
`;
const Indicator = styled(TableCell)(() => ({
  width: '20px',
  "& > div" : {
    display: 'flex'
  }
}));

export default function AvailableList({ list=[], time=false, ...props }) {
  return (
    <AvailableListContainer {...props}>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ background: "#ddd" }}>
              <TableCell align="center">{list.filter(e => e.available).length}</TableCell>
              <TableCell align="center" sx={{ minWidth: '145px' }}>
                {time && `${time.year}/${time.month}/${time.date} ${time.dow} ${time.hourPad}:${time.minutePad}`}
              </TableCell>
              <TableCell align="center">{list.filter(e => !e.available).length}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map(({ name, email, available}) => (
              <TableRow key={email}>
                <Indicator align="center">
                  {available && <div><CheckIcon color="success" fontSize="small"/></div>}
                </Indicator>
                <TableCell align="center">{name}</TableCell>
                <Indicator align="center">
                  {!available && <div><CloseIcon color="error" fontSize="small"/></div>}
                </Indicator>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </AvailableListContainer>
  );
}