import "./App.css";
import { Link, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Bin from "./components/Bin";
import CreatePost from "./components/CreatePost";
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache } from "@apollo/client";
import { AppBar, Toolbar, Typography } from "@mui/material";
import Popularity from "./components/Popularity";
import DeleteSweep from "@mui/icons-material/DeleteSweep";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: "http://localhost:4000",
  }),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <div className="App">
        <AppBar position="fixed" sx={{ backgroundColor: "#4E4949" }}>
          <Toolbar>
            <DeleteSweep sx={{ fontSize: 35, marginRight: 2 }} />
            <Typography variant="overline" component="div">
              <code>Binterest - A Pinterest Clone</code>
            </Typography>
          </Toolbar>
        </AppBar>
        <Router>
          <header className="App-header">
            <br />
            <br />
            <div className={"links"}>
              <Link className={"showlink"} to={"/"}>
                <code>Home</code>
              </Link>
              <Link className={"showlink"} to={"/my-bin"}>
                <code>My Bin</code>
              </Link>
              <Link className={"showlink"} to={"/my-posts"}>
                <code>My Posts</code>
              </Link>
              <Link className={"showlink"} to={"/new-post"}>
                <code>Create New Post</code>
              </Link>
              <Link className={"showlink"} to={"/popularity"}>
                <code>View Popular Posts</code>
              </Link>
            </div>
          </header>
          <div className="App-body">
            <Routes>
              <Route exact path="/" element={<Bin access={"unsplashImages"} />} />
              <Route exact path="/my-bin" element={<Bin access={"myBin"} />} />
              <Route exact path="/my-posts" element={<Bin access={"myPosts"} />} />
              <Route exact path="/new-post" element={<CreatePost />} />
              <Route exact path="/popularity" element={<Popularity />} />
            </Routes>
          </div>
        </Router>
      </div>
    </ApolloProvider>
  );
}

export default App;
