import React from "react";
import { useMutation, useQuery } from "@apollo/client";
import queries from "../queries";
import Card from "@mui/material/Card";
import { Alert, Button, CardMedia, CircularProgress, Typography } from "@mui/material";
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
  image: {
    maxHeight: 320,
    maxWidth: 520,
  },
  bodyBox: {
    marginLeft: "35%",
    marginRight: "35%",
  },
});

const Popularity = () => {
  const classes = useStyles();
  const { loading, error, data } = useQuery(queries.GET_POPULAR_IMAGES, {
    fetchPolicy: "cache-and-network",
    pollInterval: 500,
  });
  const [binImage] = useMutation(queries.BIN_IMAGE);

  const addToBin = async (image) => {
    const binnedImage = await binImage({
      variables: {
        id: image.id,
        userPosted: false,
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
    const unbinnedImage = await binImage({
      variables: {
        id: image.id,
        userPosted: image.userPosted,
        binned: false,
      },
    });
    console.log(unbinnedImage);
  };

  const buildCard = (image) => {
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
          {!image.binned && (
            <Button className={classes.binButton} onClick={() => addToBin(image)} variant="contained">
              <Typography variant="overline" color="text.secondary">
                <code>Add to Bin</code>
              </Typography>
            </Button>
          )}
          {image.binned && (
            <Button className={classes.binButton} onClick={() => removeFromBin(image)} variant="contained">
              <Typography variant="overline" color="text.secondary">
                <code>Remove From Bin</code>
              </Typography>
            </Button>
          )}
          <br />
          <br />
          <Typography variant="caption">
            <code>
              (
              {image.numBinned === 0
                ? "No Likes Yet"
                : "Liked By" + " " + image.numBinned + " " + (image.numBinned === 1 ? "Person" : "People")}
              )
            </code>
          </Typography>
          <br />
          <br />
        </Card>
        <br />
      </div>
    );
  };

  const calculateBinnedTotal = (array) => {
    let sum = 0;
    for (const item of array) {
      if (typeof item.numBinned === "number") sum += item.numBinned;
    }
    if (sum < 200)
      return (
        <div>
          <Typography variant="overline">
            <code>(Category: Non-mainstream User)</code>
          </Typography>
          <br />
          <br />
        </div>
      );
    else if (sum >= 200)
      return (
        <div>
          <Typography variant="overline">
            <code>(Category: Mainstream User)</code>
          </Typography>
          <br />
          <br />
        </div>
      );
  };

  if (data) {
    if (data.getTopTenImages && data.getTopTenImages.length === 0) {
      return (
        <div>
          <Box component="img" sx={{ maxWidth: "18%" }} alt="specifies there are no binned images yet." src={Stars} />
          <br />
          <br />
          <Typography variant="overline" component={"h1"}>
            <code>Seems like you've not binned anything yet. Start binning to view popular images.</code>
          </Typography>
        </div>
      );
    }
    return (
      <div>
        {data && data.getTopTenImages && calculateBinnedTotal(data.getTopTenImages)}
        <Box className={classes.bodyBox}>
          {data && data.getTopTenImages && data.getTopTenImages.map((image) => buildCard(image))}
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
};

export default Popularity;
