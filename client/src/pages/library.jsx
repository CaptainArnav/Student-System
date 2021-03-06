import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";
import SwipeableViews from "react-swipeable-views";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import { Box, Grid } from "@material-ui/core";
import LibraryCard from "../components/library/LibraryCard";
import axios from "axios";
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    maxWidth: "100%",
    flexGrow: 1
  },
  bookCard: {
    display: "flex",
    flexDirection: "row"
  }
}));


export default function Library(props) {

  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);
  const [data3, setData3] = useState([]);
  const [data4, setData4] = useState([]);
  const [reload, setReload] = useState(false);
  useEffect(()=>
  axios({
    method: 'get',
    url: 'http://localhost:5000/library',
    withCredentials: true,
  })
  .then((res) => {
    setData1(res.data.interestBased);
    setData2(res.data.bookBased);
    setData3(res.data.categoryBased);
    setData4(res.data.authorBased)
    // console.log("data1 ", data1)
      // console.log(res.data);
  }),[reload]
  )
  const classes = useStyles();
  const theme = useTheme();
  let history = useHistory();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };
  if(!props.isLogin){
    history.push("/login");
  }

  return (
    <div className={classes.root}>
      <AppBar position="static" color="default">
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          <Tab label="Based on Your Interests" {...a11yProps(0)} />
          <Tab label="Based on your Favourite Books" {...a11yProps(1)} />
          <Tab label="Based on Students similar to you" {...a11yProps(2)} />
          {/* <Tab label="Based on Your Favourite Authors" {...a11yProps(3)} /> */}
        </Tabs>
      </AppBar>
      <SwipeableViews
        axis={theme.direction === "rtl" ? "x-reverse" : "x"}
        index={value}
        onChangeIndex={handleChangeIndex}
      >
        <TabPanel
          value={value}
          index={0}
          dir={theme.direction}
          className={classes.bookCard}
        >
          <Grid container spacing={1}>
           {data1.map((book) => {
              return(
                <LibraryCard
                  bookName= {book.name}
                  available={book.issued ==='false'}
                  imgUrl = {book.image_url}
                  id = {book.id}
                  setReload = {setReload}
                  reload = {reload}
                />
                // <h1>hello</h1>
              );
            })
          }
          </Grid>
        </TabPanel>
        <TabPanel value={value} index={1} dir={theme.direction}>
        <Grid container spacing={1}>
           {data2.map((book) => {
              return(
                <LibraryCard
                  bookName= {book.name}
                  available={book.issued ==='false'}
                  imgUrl = {book.image_url}
                  id = {book.id}
                  setReload = {setReload}
                  reload = {reload}
                />
                // <h1>hello</h1>
              );
            })
          }
          </Grid>
        </TabPanel>
        <TabPanel value={value} index={2} dir={theme.direction}>
        <Grid container spacing={1}>
           {data3.map((book) => {
              return(
                <LibraryCard
                  bookName= {book.name}
                  available={book.issued ==='false'}
                  imgUrl = {book.image_url}
                  id = {book.id}
                  setReload = {setReload}
                  reload = {reload}
                />
                // <h1>hello</h1>
              );
            })
          }
          </Grid>
        </TabPanel>
        {/* <TabPanel value={value} index={3} dir={theme.direction}>
        <Grid container spacing={1}>
           {data4.map((book) => {
              return(
                <LibraryCard
                  bookName= {book.name}
                  available={book.issued ==='false'}
                  imgUrl = {book.image_url}
                  id = {book.id}
                  setReload = {setReload}
                  reload = {reload}
                />
                // <h1>hello</h1>
              );
            })
          }
          </Grid>
        </TabPanel> */}
      </SwipeableViews>
    </div>
  );
}
