import React, { Component } from "react";
import Connection from "./Connection";
import RobotState from "./RobotState";
import Teleoperation from "./Teleoperation";
import Map from "./Map";
import { Row, Col, Container, Button } from "react-bootstrap";

class Home extends Component {
  constructor() {
    super();
    this.state = {
      ros: new window.ROSLIB.Ros(),
      relayEnabled: false,
    };
  }

  componentDidMount() {
    const ros = this.state.ros;
    ros.connect(`ws://${window.location.hostname}:9090`);
    ros.on("connection", () => {
      console.log("Connected in Home.jsx");
    });
    ros.on("error", (err) => {
      console.log("Error connecting to rosbridge", err);
    });
    ros.on("close", () => {
      console.log("Connection to rosbridge closed");
    });
  }

  addPosition() {
    const poseName = prompt("Enter a name for this position:");
    if (!poseName || !this.state.ros) return;

    // 1. Set the target name param
    this.state.ros.setParam("/save_pose_send_goal/target_name", poseName, () => {
      console.log(`Param set: /save_pose_send_goal/target_name = ${poseName}`);

      // 2. Call the save_pose service
      const service = new window.ROSLIB.Service({
        ros: this.state.ros,
        name: "/save_pose_send_goal/save_pose",
        serviceType: "std_srvs/Trigger",
      });

      const request = new window.ROSLIB.ServiceRequest();

      service.callService(request, (result) => {
        if (result.success) {
          alert(`📍 Saved pose '${poseName}' successfully.`);
        } else {
          alert(`❌ Failed to save pose: ${result.message}`);
        }
      });
    });
  }


  toggleRelay = () => {
    const { ros, relayEnabled } = this.state;

    const service = new window.ROSLIB.Service({
      ros,
      name: "/cmd_relay_enable",
      serviceType: "std_srvs/SetBool",
    });

    const request = new window.ROSLIB.ServiceRequest({
      data: !relayEnabled,
    });

    service.callService(request, (result) => {
      alert(result.message);
      this.setState({ relayEnabled: !relayEnabled });
    });
  };

  render() {
    const { relayEnabled } = this.state;

    return (
      <div>
        <Container fluid>
          <h1 className="text-center mt-3">Robot Control Page</h1>
          <Row className="mt-4">
            <Col xs={12} md={8}>
              <div className="d-flex">
                <Map />
                <div className="ml-5">
                  <RobotState />
                </div>
              </div>
            </Col>
            <Col xs={12} md={4} style={{ minHeight: "480px", paddingRight: "20px" }}>
              <div className="d-flex flex-column align-items-center h-100">
                <Teleoperation />
                <div className="mt-5">
                  <Button className="mr-3" onClick={() => this.addPosition()}>
                    Add Position
                  </Button>

                  <Button
                    variant={this.state.relayEnabled ? "danger" : "success"}
                    onClick={() => this.toggleRelay(!this.state.relayEnabled)}
                  >
                    {this.state.relayEnabled ? "Disable joystick" : "Enable joystick"}
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Home;
