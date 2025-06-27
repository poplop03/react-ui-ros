import React, { Component } from "react";
import { Joystick } from "react-joystick-component";
import Config from "../scripts/config";

class Teleoperation extends Component {
  constructor() {
    super();
    this.state = {
      ros: null,
      connected: false,
      linearSpeed: 0.2,
      angularSpeed: 0.2,
    };

    this.stopTimeout = null;
    this.handleMove = this.handleMove.bind(this);
    this.handleStop = this.handleStop.bind(this);
  }

  componentDidMount() {
    this.init_connection();
  }

  init_connection() {
    const ros = new window.ROSLIB.Ros();

    ros.on("connection", () => {
      console.log("Connected to ROSBridge");
      this.setState({ connected: true });

      this.cmd_vel = new window.ROSLIB.Topic({
        ros: ros,
        name: Config.CMD_VEL_TOPIC,
        messageType: "geometry_msgs/Twist",
      });
    });

    ros.on("close", () => {
      console.log("ROSBridge connection closed");
      this.setState({ connected: false });
      setTimeout(() => {
        try {
          ros.connect(`ws://${Config.ROSBRIDGE_SERVER_IP}:${Config.ROSBRIDGE_SERVER_PORT}`);
        } catch (e) {
          console.log("Reconnection attempt failed");
        }
      }, Config.RECONNECTION_TIMER);
    });

    try {
      ros.connect(`ws://${Config.ROSBRIDGE_SERVER_IP}:${Config.ROSBRIDGE_SERVER_PORT}`);
    } catch (e) {
      console.log("Initial connection failed");
    }

    this.setState({ ros });
  }

  handleMove(event) {
    if (!this.cmd_vel) return;

    const { linearSpeed, angularSpeed } = this.state;

    const twist = new window.ROSLIB.Message({
      linear: { x: (event.y / 87.5) * linearSpeed, y: 0, z: 0 },
      angular: { x: 0, y: 0, z: (-event.x / 87.5) * angularSpeed },
    });

    this.cmd_vel.publish(twist);

    // Reset and start new stop timeout
    clearTimeout(this.stopTimeout);
    this.stopTimeout = setTimeout(this.handleStop, 300);
  }

  handleStop() {
    if (!this.cmd_vel) return;

    console.log("Sending stop command");
    const stopTwist = new window.ROSLIB.Message({
      linear: { x: 0, y: 0, z: 0 },
      angular: { x: 0, y: 0, z: 0 },
    });

    this.cmd_vel.publish(stopTwist);
  }

  render() {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          padding: "10px",
        }}
      >
        <Joystick
          size={175}
          baseColor="#EEEEEE"
          stickColor="#BBBBBB"
          move={this.handleMove}
          stop={this.handleStop}
        />

        <div style={{ marginTop: "20px", textAlign: "right" }}>
          <label>
            Linear Speed:
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={this.state.linearSpeed}
              onChange={(e) => this.setState({ linearSpeed: parseFloat(e.target.value) })}
              style={{ width: "150px", marginLeft: "10px" }}
            />
            <span style={{ marginLeft: "10px" }}>{this.state.linearSpeed.toFixed(1)} m/s</span>
          </label>
          <br />
          <label style={{ marginTop: "10px" }}>
            Angular Speed:
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={this.state.angularSpeed}
              onChange={(e) => this.setState({ angularSpeed: parseFloat(e.target.value) })}
              style={{ width: "150px", marginLeft: "10px" }}
            />
            <span style={{ marginLeft: "10px" }}>{this.state.angularSpeed.toFixed(1)} rad/s</span>
          </label>
        </div>
      </div>
    );
  }
}

export default Teleoperation;
