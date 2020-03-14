import Router from "next/router";
import React, { Component, ChangeEvent, FormEvent } from "react";
import FlockScene from "../components/FlockScene";
import Layout from "../components/Layout";
import uuid from "uuid/v4";

class NewSessionForm extends Component<{}, { user: string; targets: string }> {
  state = {
    user: "",
    targets: ""
  };

  handleChangeUser = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    this.setState({ user: target.value });
  };

  handleChangeTargets = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    this.setState({
      targets: target.value
    });
  };

  handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const session = btoa(uuid());
    const { targets } = this.state;
    const layout = targets
      .split(",")
      .map(s => s.trim())
      .join(",");
    Router.push(`/s/${session}?layout=${layout}`);
  };

  render() {
    const { targets } = this.state;

    return (
      <form onSubmit={this.handleSubmit}>
        <div className="field">
          <div className="control">
            <input
              name="user"
              onChange={this.handleChangeTargets}
              value={targets}
              className="input is-large"
              type="text"
              placeholder={
                "Enter the list of targets the session will use, separated by commas (e.g. tidal,foxdot,hydra)"
              }
              autoFocus
            />
          </div>
        </div>

        <div className="field">
          <div className="control">
            <button type="submit" className="button is-link is-large">
              Create session
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
        <NewSessionForm />
      </div>
    </section>

    <FlockScene />
  </Layout>
);

export default IndexPage;
