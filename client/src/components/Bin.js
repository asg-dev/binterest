import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import queries from "../queries";
import Card from "@mui/material/Card";
import { Alert, AlertTitle, Button, CardMedia, CircularProgress, Collapse, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CardContent } from "@mui/material";
import { Box } from "@mui/system";
import Stars from "../illustrations/stars.svg";

const useStyles = makeStyles({
  card: {
    maxWidth: 620,
    maxHeight: 620,
    borderRadius: 5,
    border: "1px solid #1e8678",
    boxShadow: "0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);",
  },
  binButton: {
    color: "whitesmoke",
    backgroundColor: "rgb(209 235 210)",
  },
  deleteButton: {
    backgroundColor: "#F0BABA",
  },
  image: {
    maxHeight: 320,
    maxWidth: 520,
  },
  bodyBox: {
    marginLeft: "35%",
    marginRight: "35%",
  },
});

const Bin = ({ access }) => {
  console.log("Accessing: " + access);
  const [page, setPage] = useState(0);
  const classes = useStyles();
  const { loading, error, data } = useQuery(queries.GET_UNSPLASH_IMAGES, {
    variables: { pageNum: page },
    fetchPolicy: "cache-and-network",
    pollInterval: 500,
  });
  const [binImage] = useMutation(queries.BIN_IMAGE);
  const [deleteImage] = useMutation(queries.DELETE_IMAGE);
  const [open, setOpen] = useState(true);

  const binnedImages = useQuery(queries.GET_USER_BINNED_IMAGES, {
    fetchPolicy: "cache-and-network",
    pollInterval: 500,
  });

  const myPosts = useQuery(queries.GET_USER_POSTED_IMAGES, {
    fetchPolicy: "cache-and-network",
    pollInterval: 500,
  });

  let binData = binnedImages.data;
  let binError = binnedImages.error;
  let binLoading = binnedImages.loading;

  let myData = myPosts.data;
  let myError = myPosts.error;
  let myLoading = myPosts.loading;

  const addToBin = async (image) => {
    const binnedImage = await binImage({
      variables: {
        id: image.id,
        userPosted: image.userPosted,
        description: image.description,
        url: image.url,
        posterName: image.posterName,
        binned: true,
        numBinned: image.numBinned,
      },
    });
    console.log(binnedImage);
  };

  const removeFromBin = async (image) => {
    console.log("Removing image ", image);
    const unbinnedImage = await binImage({
      variables: {
        id: image.id,
        userPosted: image.userPosted,
        binned: false,
      },
    });
    console.log(unbinnedImage);
  };

  const deletePost = async (image) => {
    try {
      const deletedPost = await deleteImage({
        variables: {
          id: image.id,
        },
      });
      console.log(deletedPost);
    } catch (e) {
      console.log(e);
    }
  };

  const buildCard = (image, postedImage = false) => {
    return (
      <div key={image.id}>
        <Card className={classes.card} variant="outlined">
          <CardContent>
            <Typography gutterBottom variant="body1" component="div">
              <code> Image by {image.posterName}</code>
            </Typography>

            <Typography variant="caption" color="text.secondary">
              <code>
                {image.description.length > 65 ? image.description.substring(0, 65) + "..." : image.description}
              </code>
            </Typography>
          </CardContent>

          <CardMedia className={classes.image} component={"img"} alt={"an image from Unsplash"} image={image.url} />
          <br />
          <Box mx="auto">
            {!image.binned && (
              <Button
                sx={{ marginRight: "2%" }}
                className={classes.binButton}
                onClick={() => addToBin(image)}
                variant="contained"
              >
                <Typography variant="overline" color="text.secondary">
                  <code>Add to Bin</code>
                </Typography>
              </Button>
            )}
            {image.binned && (
              <Button
                sx={{ marginRight: "2%" }}
                className={classes.binButton}
                onClick={() => removeFromBin(image)}
                variant="contained"
              >
                <Typography variant="overline" color="text.secondary">
                  <code>Remove From Bin</code>
                </Typography>
              </Button>
            )}
            {postedImage && (
              <Button className={classes.deleteButton} onClick={() => deletePost(image)} variant="contained">
                <Typography variant="overline" color="text.secondary">
                  <code>Delete Post</code>
                </Typography>
              </Button>
            )}
          </Box>
          <br />
          <br />
        </Card>
        <br />
      </div>
    );
  };

  const loadMoreImages = () => {
    setPage(page + 1);
  };

  if (access === "unsplashImages") {
    if (data) {
      console.log(data);
      return (
        <div>
          <Box className={classes.bodyBox}>
            <Collapse in={open}>
              <Alert
                onClose={() => {
                  setOpen(false);
                }}
                severity="success"
              >
                <AlertTitle>
                  <code>Loading Page [ {page} ] from the Unsplash API</code>
                </AlertTitle>
                <Typography variant="caption">
                  <code>Psst! The API, sometimes, might show previously seen results (promoted images)</code>
                </Typography>
              </Alert>
            </Collapse>
            <br />
            <br />
            {data && data.unsplashImages && data.unsplashImages.map((image) => buildCard(image))}
            <Button
              sx={{ marginRight: "1.5%" }}
              variant={"contained"}
              onClick={() => {
                loadMoreImages();
                setOpen(true);
              }}
            >
              <code>View More</code>
            </Button>
          </Box>
        </div>
      );
    } else if (loading) {
      return (
        <div>
          <CircularProgress />
        </div>
      );
    } else if (error) {
      return (
        <Alert severity="error">
          We're sorry - something went wrong when performing the action. Please reload the page and try again.
        </Alert>
      );
    }
  } else if (access === "myBin") {
    if (binData) {
      if (binData.binnedImages && binData.binnedImages.length === 0) {
        return (
          <div>
            <Box component="img" sx={{ maxWidth: "18%" }} alt="specifies there are no binned images yet." src={Stars} />
            <br />
            <br />
            <Typography variant="overline" component={"h1"}>
              <code>Hmm, No binned images here.</code>
            </Typography>
          </div>
        );
      }
      return (
        <Box className={classes.bodyBox}>
          {binData && binData.binnedImages && binData.binnedImages.map((image) => buildCard(image))}
        </Box>
      );
    } else if (binLoading) {
      return <CircularProgress />;
    } else if (binError) {
      return (
        <Alert severity="error">
          We're sorry - something went wrong when performing the action. Please reload the page and try again.
        </Alert>
      );
    }
    // add error and loading
  } else if (access === "myPosts") {
    if (myData) {
      if (myData.userPostedImages && myData.userPostedImages.length === 0) {
        return (
          <div>
            <Box component="img" sx={{ maxWidth: "18%" }} alt="specifies there are no binned images yet." src={Stars} />
            <br />
            <br />
            <Typography variant="overline" component={"h1"}>
              <code>You haven't posted anything.</code>
            </Typography>
          </div>
        );
      }
      return (
        <Box className={classes.bodyBox}>
          {myData && myData.userPostedImages && myData.userPostedImages.map((image) => buildCard(image, true))}
        </Box>
      );
    } else if (myLoading) {
      return <CircularProgress />;
    } else if (myError) {
      return (
        <Alert severity="error">
          We're sorry - something went wrong when performing the action. Please reload the page and try again.
        </Alert>
      );
    }
  }
};

export default Bin;
