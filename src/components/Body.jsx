import React, { Component } from "react";
import { Container } from "react-bootstrap";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import Home from "./Home";
import About from "./About";
import HomePage from "./HomePage";
import UserPage from "./UserPage";
class Body extends Component {
  render() {
    return (
      <Container fluid className="h-100 p-0">
        <Router>
          <Switch>
            <Route path="/" exact component={HomePage} />
            <Route path="/admin" exact component={Home} />
            <Route path="/user" exact component={UserPage} />
            <Route path="/about" exact component={About} />
          </Switch>
        </Router>
      </Container>
    );
  }
}

export default Body;
