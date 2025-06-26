import React, { Component } from "react";
import ROSLIB from "roslib";

class UserPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ros: null,
      poses: [],
      status: "",
    };
  }

  componentDidMount() {
    // 1. Connect to ROS
    const ros = new ROSLIB.Ros({
      url: "ws://192.168.0.102:9090", // ← your ROS bridge address
    });

    ros.on("connection", () => {
      console.log("✅ Connected to rosbridge");
      this.setState({ ros }, this.listSavedPoses);
    });

    ros.on("error", (err) => console.error("❌ ROS error:", err));
    ros.on("close", () => console.log("🔌 Disconnected from ROS"));
  }

  listSavedPoses = () => {
    const service = new ROSLIB.Service({
      ros: this.state.ros,
      name: "/save_pose_send_goal/list_poses",
      serviceType: "std_srvs/Trigger",
    });

    service.callService({}, (result) => {
      if (result.success) {
        const poseList = result.message.split(",").map((name) => name.trim());
        this.setState({ poses: poseList });
      } else {
        this.setState({ status: "⚠️ Failed to load poses." });
      }
    });
  };

  handleSendGoal = (poseName) => {
    const { ros } = this.state;

    // 1. Set param
    const param = new ROSLIB.Param({
      ros,
      name: "/save_pose_send_goal/target_name",
    });

    param.set(poseName, () => {
      // 2. Call send_goal service
      const service = new ROSLIB.Service({
        ros,
        name: "/save_pose_send_goal/send_goal",
        serviceType: "std_srvs/Trigger",
      });

      service.callService({}, (result) => {
        if (result.success) {
          this.setState({ status: `🚀 Sent robot to '${poseName}'` });
        } else {
          this.setState({ status: `❌ Failed to send robot to '${poseName}'` });
        }
      });
    });
  };

  render() {
    const { poses, status } = this.state;

    return (
      <div className="container">
        <h1 className="text-center mt-3">User Page</h1>
        <h5 className="mt-4">📍 Saved Poses</h5>
        <div className="row">
          {poses.map((pose, index) => (
            <div
              key={index}
              className="col-4 p-2"
              style={{
                cursor: "pointer",
                backgroundColor: "#f0f0f0",
                border: "1px solid #ccc",
                borderRadius: "6px",
                margin: "5px",
                textAlign: "center",
              }}
              onClick={() => this.handleSendGoal(pose)}
            >
              {pose}
            </div>
          ))}
        </div>
        {status && <div className="alert alert-info mt-3">{status}</div>}
      </div>
    );
  }
}

export default UserPage;
