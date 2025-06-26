import React, { Component } from "react";
import Connection from "./Connection";
import RobotState from "./RobotState";
import Teleoperation from "./Teleoperation";
import Map from "./Map";
import { Row, Col, Container, Button } from "react-bootstrap";
class Home extends Component {
  state = {};

  // Hàm để thêm vị trí
  addPosition() {
    const poseName = prompt("Enter a name for this position:");
    if (!poseName || !this.state.ros) return;

    const service = new window.ROSLIB.Service({
      ros: this.state.ros,
      name: "/save_named_pose",
      serviceType: "std_msgs/String",
    });

    const request = new window.ROSLIB.ServiceRequest({
      data: poseName,
    });

    service.callService(request, (result) => {
      alert(`📍 ${result.data}`);
    });
  }

  render() {
    return (
      <div>
        <Container fluid>
          <h1 className="text-center mt-3">Robot Control Page</h1>
          {/* Connection Status */}
          <Row className="mt-4">
            {/* Left: Map */}
            <Col xs={12} md={8}>
            <div className="d-flex">
              <Map />
              <div className="ml-5">
                <RobotState />
              </div>
            </div>
              
            </Col>
            {/* Right: Joystick + RobotState */}
            <Col
              xs={12}
              md={4}
              style={{ minHeight: "480px", paddingRight: "20px" }}
            >
              <div className="d-flex flex-column align-items-center h-100">
                <Teleoperation />
                <button className="btn btn-primary" style={{ marginTop: "100px" }} onClick={() => this.addPosition(1, 2)}>Add Position</button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Home;
