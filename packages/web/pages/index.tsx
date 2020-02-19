import Router from "next/router";
import React, { Component, ChangeEvent, FormEvent } from "react";
import Layout from "../components/Layout";

interface State {
  wsServer: string;
  session: string;
  user: string;
}

class NewSessionForm extends Component<{}, State> {
  state = {
    wsServer: "",
    session: "",
    user: ""
  };

  handleChangeServer = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    this.setState({ wsServer: target.value });
  };

  handleChangeSession = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    this.setState({ session: target.value });
  };

  handleChangeUser = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    this.setState({ user: target.value });
  };

  handleSubmit = (e: FormEvent) => {
    let { wsServer, session, user } = this.state;

    e.preventDefault();

    // Default values
    if (!wsServer) wsServer = "ws://localhost:3001";
    if (!session) session = "default";
    if (!user) user = "anonymous";

    Router.push(`/s/${session}?wsServer=${wsServer}&user=${user}`);
  };

  render() {
    const { wsServer, session, user } = this.state;

    return (
      <form onSubmit={this.handleSubmit}>
        <div className="field">
          <div className="control">
            <input
              name="user"
              onChange={this.handleChangeServer}
              value={wsServer}
              className="input is-large"
              type="text"
              placeholder="Type the WebSocket URL of your signaling server (e.g. ws://[ip]:3001)"
            />
          </div>
        </div>

        <div className="field">
          <div className="control">
            <input
              name="session"
              onChange={this.handleChangeSession}
              value={session}
              className="input is-large"
              type="text"
              placeholder="Type a session name"
            />
          </div>
        </div>

        <div className="field">
          <div className="control">
            <input
              name="user"
              onChange={this.handleChangeUser}
              value={user}
              className="input is-large"
              type="text"
              placeholder="Type a nick name"
            />
          </div>
        </div>

        <div className="field">
          <div className="control">
            <button type="submit" className="button is-link is-large">
              Join!
            </button>
          </div>
        </div>
      </form>
    );
  }
}

const IndexPage = () => (
  <Layout>
    <section className="section">
      <div className="container">
        <h1 className="title">flok</h1>
        <h3 className="subtitle">collaborative live coding editor</h3>

        {/* <SessionList /> */}
        <NewSessionForm />
      </div>
    </section>
  </Layout>
);

export default IndexPage;
