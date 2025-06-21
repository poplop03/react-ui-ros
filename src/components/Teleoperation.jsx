import React, { Component } from "react";
import { Joystick } from "react-joystick-component";
import Config from "../scripts/config";

class Teleoperation extends Component {
  state = { ros: null };

  constructor() {
    super();

    this.state = {
    ros: null,
    publishing: false,
    intervalId: null,
    lastTwist: null,
    };
    this.init_connection();

    this.handleMove = this.handleMove.bind(this);
    this.handleStop = this.handleStop.bind(this);
  }
  init_connection() {
    this.state.ros = new window.ROSLIB.Ros();
    console.log(this.state.ros);

    this.state.ros.on("connection", () => {
      console.log("connection established in Teleoperation Component!");
      console.log(this.state.ros);
      this.setState({ connected: true });
    });

    this.state.ros.on("close", () => {
      console.log("connection is closed!");
      this.setState({ connected: false });
      //try to reconnect every 3 seconds
      setTimeout(() => {
        try {
          this.state.ros.connect(
            "ws://" +
              Config.ROSBRIDGE_SERVER_IP +
              ":" +
              Config.ROSBRIDGE_SERVER_PORT +
              ""
          );
        } catch (error) {
          console.log("connection problem ");
        }
      }, Config.RECONNECTION_TIMER);
    });

    try {
      this.state.ros.connect(
        "ws://" +
          Config.ROSBRIDGE_SERVER_IP +
          ":" +
          Config.ROSBRIDGE_SERVER_PORT +
          ""
      );
    } catch (error) {
      console.log(
        "ws://" +
          Config.ROSBRIDGE_SERVER_IP +
          ":" +
          Config.ROSBRIDGE_SERVER_PORT +
          ""
      );
      console.log("connection problem ");
    }
  }

handleMove(event) {
  // Create twist
  const linearSpeed = this.state.linearSpeed || 0.5;
  const angularSpeed = this.state.angularSpeed || 0.5;

  const twist = new window.ROSLIB.Message({
    linear: {
      x: (event.y / 50) * linearSpeed,
      y: 0,
      z: 0,
    },
    angular: {
      x: 0,
      y: 0,
      z: (-event.x / 50) * angularSpeed,
    },
  });

  const cmd_vel = new window.ROSLIB.Topic({
    ros: this.state.ros,
    name: Config.CMD_VEL_TOPIC,
    messageType: "geometry_msgs/Twist",
  });

  // Publish immediately
  cmd_vel.publish(twist);
  this.setState({ lastTwist: twist });

  // Start interval publisher if not running
  if (!this.state.publishing) {
    const intervalId = setInterval(() => {
      if (this.state.lastTwist) {
        cmd_vel.publish(this.state.lastTwist);
      }
    }, 100); // Send every 100ms

    this.setState({ intervalId, publishing: true });
  }
}



handleStop() {
  const cmd_vel = new window.ROSLIB.Topic({
    ros: this.state.ros,
    name: Config.CMD_VEL_TOPIC,
    messageType: "geometry_msgs/Twist",
  });

  const stopTwist = new window.ROSLIB.Message({
    linear: { x: 0, y: 0, z: 0 },
    angular: { x: 0, y: 0, z: 0 },
  });

  cmd_vel.publish(stopTwist);

  // Stop the loop
  clearInterval(this.state.intervalId);
  this.setState({
    publishing: false,
    intervalId: null,
    lastTwist: null,
  });

  // Re-enable scroll
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
        move={(event) => {
          this.handleMove(event);
          document.body.classList.add("no-scroll"); // Lock scroll only here
        }}
        stop={(event) => {
          this.handleStop(event);
          document.body.classList.remove("no-scroll"); // Unlock scroll
        }}
      />
    </div>
  );
}


}

export default Teleoperation;
