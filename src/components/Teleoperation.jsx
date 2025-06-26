import React, { Component } from 'react';
import { Joystick } from "react-joystick-component"
import Config from "../data/config"

class Teleoperation extends Component {
    state = {
        connected: false,
        ros: null,
    };

    constructor() {
        super();
        this.handleMove = this.handleMove.bind(this);
        this.handleStop = this.handleStop.bind(this);
        this.state.ros = new window.ROSLIB.Ros();
    }

    reconnect() {
        if (!this.state.connected) {
            console.log("Reconnecting to ROS...");
            try {
                this.state.ros.connect(`ws://${Config.ROSBRIDGE_SERVER_IP}:${Config.ROSBRIDGE_SERVER_PORT}`);
            } catch (error) {
                console.log("Reconnect failed:", error);
            }
        }
    }

    init_connection() {
        setInterval(() => this.reconnect(), 5000);

        this.state.ros.on("connection", () => {
            console.log("[Teleoperation] Connected to ROS");
            this.setState({ connected: true });

            // ✅ Initialize the topic only once when connected
            this.cmd_vel = new window.ROSLIB.Topic({
                ros: this.state.ros,
                name: Config.CMD_VEL_TOPIC, // should be "/cmd_vel_web"
                messageType: "geometry_msgs/Twist",
            });
        });

        this.state.ros.on("close", () => {
            console.log("ROS connection closed");
            this.setState({ connected: false });
        });

        try {
            this.state.ros.connect(`ws://${Config.ROSBRIDGE_SERVER_IP}:${Config.ROSBRIDGE_SERVER_PORT}`);
        } catch (error) {
            console.log("Initial connection failed");
        }
    }

    componentDidMount() {
        this.init_connection();
    }

    handleMove(event) {
        if (!this.cmd_vel) return;

        const twist = new window.ROSLIB.Message({
            linear: { x: event.y / 50, y: 0, z: 0 },
            angular: { x: 0, y: 0, z: event.x === 0 ? 0 : -event.x / 70 },
        });

        this.cmd_vel.publish(twist);
    }

    handleStop() {
        if (!this.cmd_vel) return;

        const twist = new window.ROSLIB.Message({
            linear: { x: 0, y: 0, z: 0 },
            angular: { x: 0, y: 0, z: 0 },
        });

        this.cmd_vel.publish(twist);
    }

    render() {
        return (
            <div style={{ position: "fixed", bottom: "100px", left: "67px" }}>
                <Joystick
                    baseColor="darkGrey"
                    stickColor="grey"
                    move={this.handleMove}
                    stop={this.handleStop}
                />
            </div>
        );
    }
}

export default Teleoperation;
