import React, { Component } from "react";
import Config from "../scripts/config";

class Map extends Component {
  state = {
    ros: null,
  };

  constructor() {
    super();
    //this.init_connection = this.view_map.bind(this);
    this.view_map = this.view_map.bind(this);
  }

  init_connection() {
    //this.setState({ ros: new ROSLIB.Ros() });
    this.state.ros = new window.ROSLIB.Ros();
    console.log("Map:" + this.state.ros);
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
      console.log("cannot connect to the WS robot. Try again after 1 second");
    }
  }

  componentDidMount() {
    this.init_connection();
    console.log("Map: componentDidMount" + this.state.ros);
    this.view_map();
  }

  view_map() {
    const container = document.getElementById("nav_div");
    var viewer = new window.ROS2D.Viewer({
      divID: "nav_div",
      width: container.offsetWidth,
      height: container.offsetHeight,
    });
    var navClient = new window.NAV2D.OccupancyGridClientNav({
      ros: this.state.ros,
      rootObject: viewer.scene,
      viewer: viewer,
      serverName: "/move_base",
      withOrientation: true,
    });
  }

  render() {
    return (
        <div
          id="nav_div"
          style={{
            width: "100%",
            height: "500px", // Dynamically scales width, limits height
            border: "1px solid #ccc",
            backgroundColor: "#f5f5f5",
          }}
        ></div>
    );
  }
}

export default Map;
