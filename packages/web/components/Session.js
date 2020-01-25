import React from "react";
import PropTypes from "prop-types";
import dynamic from "next/dynamic";

import Status from "./Status";
import UserList from "./UserList";
import TargetMessagesPane from "./TargetMessagesPane";
import TargetSelect from "./TargetSelect";

const TARGETS = ["default", "tidal", "sclang", "foxdot"];

const TextEditor = dynamic(() => import("./TextEditor"), {
  ssr: false
});

class Session extends React.Component {
  state = {
    status: "Not connected",
    showUserList: true,
    showTargetMessagesPane: true,
    messages: [],
    users: [],
    target: "default"
  };

  handleConnectionOpen = () => {
    this.setState({ status: "Connected" });
  };

  handleConnectionClose = () => {
    this.setState({ status: "Disconnected" });
  };

  handleConnectionError = () => {
    this.setState({ status: "Error" });
  };

  handleUsersChange = users => {
    console.log(users);
    this.setState({ users });
  };

  handleMessageTarget = message => {
    console.log(`[message] target: ${JSON.stringify(message)}`);
    this.setState(prevState => ({
      messages: [message, ...prevState.messages]
    }));
  };

  handleMessageUser = message => {
    console.log(`[message] user: ${JSON.stringify(message)}`);
  };

  handleTargetSelectChange = e => {
    this.setState({ target: e.target.value });
  };

  toggleUserList = () => {
    this.setState((prevState, _) => ({
      showUserList: !prevState.showUserList
    }));
  };

  toggleTargetMessagesPane = () => {
    this.setState((prevState, _) => ({
      showTargetMessagesPane: !prevState.showTargetMessagesPane
    }));
  };

  render() {
    const {
      status,
      users,
      messages,
      target,
      showUserList,
      showTargetMessagesPane
    } = this.state;

    return (
      <React.Fragment>
        <Status>{status}</Status>
        <TextEditor
          {...this.props}
          onConnectionOpen={this.handleConnectionOpen}
          onConnectionClose={this.handleConnectionClose}
          onConnectionError={this.handleConnectionError}
          onUsersChange={this.handleUsersChange}
          onMessageTarget={this.handleMessageTarget}
          onMessageUser={this.handleMessageUser}
        />
        {showUserList && <UserList users={users} />}
        <TargetSelect
          value={target}
          options={TARGETS}
          onChange={this.handleTargetSelectChange}
        />
        {showTargetMessagesPane && messages && (
          <TargetMessagesPane messages={messages} />
        )}
      </React.Fragment>
    );
  }
}

Session.propTypes = {
  websocketsHost: PropTypes.string.isRequired,
  sessionName: PropTypes.string.isRequired,
  userName: PropTypes.string
};

Session.defaultProps = {
  userName: "anonymous"
};

export default Session;
