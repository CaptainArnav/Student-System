import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {Grid,Button,Typography, TextField} from "@material-ui/core";
import axios from "axios";
import { useHistory } from "react-router-dom";
const initialValues = {
  course: '',
  
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
export default function Course() {
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
      course: ''
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    // console.log(event.target);
    // console.log('handle submit')
    if(values.course!==''){
      data.push(values);
    }
    console.log(data)
    axios({
        method: 'post',
        url: 'http://localhost:5000/profile/courses',
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
        Add Your courses
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            required
            id="course"
            name="course"
            label="Course"
            fullWidth
            value = {values.course}
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
            Add Course
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
