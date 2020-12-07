import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {Grid,Button,Typography, TextField} from "@material-ui/core";
import axios from "axios";
import { useHistory } from "react-router-dom";
const initialValues = {
  clubName: '',
  startDate: '',
  endDate: '',
  position: ''
  
}
const useStyles = makeStyles((theme) => ({
  listItem: {
    padding: theme.spacing(1, 0)
  },
  total: {
    fontWeight: 700
  },
  title: {
    marginTop: theme.spacing(2)
  }
}));
const data = []
export default function Skill() {
  const [values, setValues] = useState(initialValues);
  const classes = useStyles();
  const history = useHistory();
  const handleFormChange = (e)=> {
    const key = e.target.name;
    const value = e.target.value;
    setValues(preValue => ({
      ...preValue,
      [key]: value,
    }))
  }
  const addData = (e) => {
    data.push(values);
    setValues(preValue => ({
        ...preValue,
        clubName: '',
        startDate: '',
        endDate: '',
        position: ''
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    // console.log(event.target);
    // console.log('handle submit')
    if(values.clubName!==''){
      data.push(values);
    }
    console.log(data)
    axios({
        method: 'post',
        url: 'http://localhost:5000/profile/clubs',
        data: data,
    })
    .then(() => {
      // console.log('done');
      history.replace('/profile');
    })
    .catch(err => {
        console.error(err);
    });
  }

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Add Your Clubs
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            required
            id="clubName"
            name="clubName"
            label="Club Name"
            fullWidth
            value = {values.clubName}
            onChange={handleFormChange}
          />
        </Grid>

        <Grid item xs={12}>

          <TextField
            id="startDate"
            label="Start Date"
            name="startDate"
            type="date"
            value={values.startDate}
            onChange={handleFormChange}
            InputLabelProps={{
              shrink: true,
            }}
          />

        </Grid>
        <Grid item xs={12}>
          <TextField
            id="endDate"
            label="End Date"
            name="endDate"
            type="date"
            value={values.endDate}
            onChange={handleFormChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            required
            id="position"
            name="position"
            label="Position"
            fullWidth
            value = {values.position}
            onChange={handleFormChange}
          />
        </Grid>


        <Grid item style={{ marginTop: 16 }}>
          <Button
            type="button"
            variant="contained"
            onClick={addData}
            // disabled={submitting || pristine}
          >
            Add Club
          </Button>
        </Grid>
        <Grid item style={{ marginTop: 16 }}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            onClick={handleSubmit}
            // disabled={submitting}
          >
            Submit
          </Button>
        </Grid>
      </Grid>
    </>
  );
}