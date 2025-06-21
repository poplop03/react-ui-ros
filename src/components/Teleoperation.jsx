import React, { Component } from "react";
import { Joystick } from "react-joystick-component";
import Config from "../scripts/config";

class Teleoperation extends Component {
  constructor() {
    super();

    this.state = {
      ros: null,
      intervalId: null,
      lastTwist: new window.ROSLIB.Message({
        linear: { x: 0, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: 0 },
      }),
    };

    this.init_connection();

    this.handleMove = this.handleMove.bind(this);
    this.handleStop = this.handleStop.bind(this);
  }

  init_connection() {
    const ros = new window.ROSLIB.Ros();
    this.setState({ ros });

    ros.on("connection", () => {
      console.log("✅ ROS Connected!");
      this.setState({ connected: true });
    });

    ros.on("close", () => {
      console.log("❌ ROS Connection closed!");
      this.setState({ connected: false });
      setTimeout(() => {
        try {
          ros.connect(`ws://${Config.ROSBRIDGE_SERVER_IP}:${Config.ROSBRIDGE_SERVER_PORT}`);
        } catch (error) {
          console.log("Reconnection failed");
        }
      }, Config.RECONNECTION_TIMER);
    });

    try {
      ros.connect(`ws://${Config.ROSBRIDGE_SERVER_IP}:${Config.ROSBRIDGE_SERVER_PORT}`);
    } catch (error) {
      console.log("Initial connection failed");
    }

    this.cmd_vel = new window.ROSLIB.Topic({
      ros: ros,
      name: Config.CMD_VEL_TOPIC,
      messageType: "geometry_msgs/Twist",
    });
  }

  componentDidMount() {
    const intervalId = setInterval(() => {
      if (this.cmd_vel && this.state.lastTwist) {
        this.cmd_vel.publish(this.state.lastTwist);
      }
    }, 50); // 20 Hz
    this.setState({ intervalId });
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }

  handleMove(event) {
    const linearSpeed = 1;
    const angularSpeed = 1;

    const twist = new window.ROSLIB.Message({
      linear: { x: (event.y / 50) * linearSpeed, y: 0, z: 0 },
      angular: { x: 0, y: 0, z: (-event.x / 50) * angularSpeed },
    });

    this.setState({ lastTwist: twist });
    document.body.classList.add("no-scroll");
  }

  handleStop() {
    const stopTwist = new window.ROSLIB.Message({
      linear: { x: 0, y: 0, z: 0 },
      angular: { x: 0, y: 0, z: 0 },
    });

    this.setState({ lastTwist: stopTwist });
    document.body.classList.remove("no-scroll");
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

export default Teleoperation;
