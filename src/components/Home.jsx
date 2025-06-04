import React, { Component } from "react";
import Connection from "./Connection";
import RobotState from "./RobotState";
import Teleoperation from "./Teleoperation";
import Map from "./Map";
import { Row, Col, Container, Button } from "react-bootstrap";
class Home extends Component {
  state = {};

  render() {
    return (
      <div>
        <Container fluid>
          <h1 className="text-center mt-3">Robot Control Page</h1>
          {/* Connection Status */}
        <Row className="mt-4">
          {/* Left: Map */}
          <Col xs={12} md={8}>
            <Map />
          </Col>
          {/* Right: Joystick + RobotState */}
          <Col
            xs={12}
            md={4}
            style={{ minHeight: "480px", paddingRight: "20px" }}
          >
            <div className="d-flex flex-column align-items-end justify-content-between h-100">
              <Teleoperation />
              <RobotState />
            </div>
          </Col>
        </Row>
        </Container>
      </div>
    );
  }
}

export default Home;
