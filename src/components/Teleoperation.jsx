import React, { Component } from "react";
import { Joystick } from "react-joystick-component";
import Config from "../scripts/config";

class Teleoperation extends Component {
  constructor() {
    super();
    this.state = {
      ros: null,
      connected: false,
      linearSpeed: 0.4,    // meters per second
      angularSpeed: 0.2,   // radians per second
    };

    this.handleMove = this.handleMove.bind(this);
    // this.handleStop = this.handleStop.bind(this);
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
      linear: {
        x: (event.y / 87.5) * linearSpeed,
        y: 0,
        z: 0,
      },
      angular: {
        x: 0,
        y: 0,
        z: (-event.x / 87.5) * angularSpeed,
      },
    });

    this.cmd_vel.publish(twist);
  }


  render() {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
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
      </div>
    );
  }
}


// this nigga workingd
export default Teleoperation;
