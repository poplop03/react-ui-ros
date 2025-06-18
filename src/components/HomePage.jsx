import React, { Component } from "react";
class HomePage extends Component {
    handleAdminClick = () => {
        this.props.history.push("/admin");
    }
    handleUserClick = () => {
        this.props.history.push("/user");
    }
    render() {
        return (
            <div className="container d-flex flex-column justify-content-center align-items-center" style={{width: "100%"}}>
                <h1 className="text-center mt-3">Home Page</h1>

                <div className="d-flex flex-column">
                    <button className="btn btn-primary my-2" onClick={this.handleAdminClick}>Admin</button>
                    <button className="btn btn-primary my-2" onClick={this.handleUserClick}>User</button>
                </div>
            </div>
        );
    }
}
export default HomePage;