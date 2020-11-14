import React, { useState, useEffect } from "react";
import { makeStyles, Typography, TextField, Grid, Button} from "@material-ui/core";


const initialValues = {
  achievement: '',
  
}

const useStyles = makeStyles((theme) => ({
  listItem: {
    padding: theme.spacing(1, 0)
  },
  total: {
    fontWeight: 700
  },
  title: {
    marginTop: theme.spacing(1)
  }
}));

export default function Achievement() {
  const [values, setValues] = useState(initialValues);
  const classes = useStyles();
  const handleFormChange = (e)=> {
    const key = e.target.name;
    const value = e.target.value;
    setValues(preValue => ({
      ...preValue,
      [key]: value,
    }))
    // console.log(values);
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Add Your Achievements
      </Typography>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <TextField
            required
            id="achievement"
            name="achievement"
            label="Achievement"
            fullWidth
            value = {values.achievement}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item >
          <Button
            type="button"
            variant="contained"
            // onClick={reset}
            // disabled={submitting || pristine}
          >
            Reset
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            // disabled={submitting}
          >
            Submit
          </Button>
        </Grid>
      </Grid>
    </>
  );
}
