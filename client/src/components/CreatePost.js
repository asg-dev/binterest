import { Alert, AlertTitle, Button, Collapse, Stack, Typography } from "@mui/material";
import React, { useState } from "react";
import { Box } from "@mui/system";
import { TextField } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useMutation } from "@apollo/client";
import queries from "../queries";
import isURL from "validator/lib/isURL";

const useStyles = makeStyles({
  inputFields: {
    color: "black",
  },
});

const CreatePost = () => {
  const classes = useStyles();
  const [postImage] = useMutation(queries.UPLOAD_IMAGE);
  const [postCreationSuccess, setPostCreationSuccess] = useState(false);
  const [encounteredError, setEncounteredError] = useState(false);
  const [open, setOpen] = useState(true);

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const [imageUrl, posterName, description] = event.target;
    console.log(imageUrl.value, posterName.value, description.value);
    if (!isURL(imageUrl.value)) {
      setEncounteredError(true);
      return;
    }
    if (!posterName.value || posterName.value.length === 0 || posterName.value.trim().length === 0) {
      setEncounteredError(true);
      return;
    }
    if (!description.value || description.value.length === 0 || description.value.trim().length === 0) {
      setEncounteredError(true);
      return;
    }
    let imageCreated = await postImage({
      variables: {
        url: imageUrl.value,
        posterName: posterName.value,
        description: description.value,
      },
    });
    console.log(imageCreated);
    setPostCreationSuccess(true);
  };

  if (encounteredError) {
    return (
      <div>
        <Collapse in={open}>
          <Alert
            onClose={() => {
              setOpen(false);
              setPostCreationSuccess(false);
              setEncounteredError(false);
            }}
            severity="error"
          >
            <code>One or more fields are incorrect. Please recheck and try again.</code>
          </Alert>
        </Collapse>
      </div>
    );
  }

  if (!postCreationSuccess) {
    return (
      <div className="inputFieldBack">
        <Typography variant="overline">
          <code>Add your own image here!</code>
        </Typography>
        <br />
        <br />
        <form className="form" onSubmit={handleFormSubmit}>
          <Stack spacing={2}>
            <Box>
              <TextField
                InputProps={{ className: classes.inputFields }}
                id="imageUrl"
                label="Image URL"
                type={"url"}
                variant="filled"
                required
              />
              <br />
              <br />
              <TextField
                InputProps={{ className: classes.inputFields }}
                id="posterName"
                label="Poster Name"
                variant="filled"
                required
              />
              <br />
              <br />
              <TextField
                InputProps={{ className: classes.inputFields }}
                id="description"
                label="Image Description"
                variant="filled"
                required
              />
              <br />
              <br />
              <Button type="submit" variant="contained">
                <code>Create</code>
              </Button>
              <br />
              <br />
            </Box>
          </Stack>
        </form>
      </div>
    );
  } else {
    return (
      <div>
        <Collapse in={open}>
          <Alert
            onClose={() => {
              setOpen(false);
              setPostCreationSuccess(false);
              setEncounteredError(false);
            }}
            severity="success"
          >
            <AlertTitle>Your Post was successfully created! </AlertTitle>
          </Alert>
        </Collapse>
      </div>
    );
  }
};

export default CreatePost;
