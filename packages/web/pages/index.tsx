import Router from "next/router";
import React, { Component, ChangeEvent, FormEvent } from "react";
import FlockScene from "../components/FlockScene";
import Layout from "../components/Layout";
import uuid from "uuid/v4";

interface State {
  user: string;
}

class NewSessionForm extends Component<{}, State> {
  state = {
    user: ""
  };

  handleChangeUser = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    this.setState({ user: target.value });
  };

  handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    let { user } = this.state;
    if (!user) user = "anonymous";

    const session = btoa(uuid());

    Router.push(`/s/${session}?user=${user}`);
  };

  render() {
    const { user } = this.state;

    return (
      <form onSubmit={this.handleSubmit}>
        <div className="field">
          <div className="control">
            <input
              name="user"
              onChange={this.handleChangeUser}
              value={user}
              className="input is-large"
              type="text"
              placeholder="Type a nick name and press Enter"
            />
          </div>
        </div>

        <div className="field">
          <div className="control">
            <button type="submit" className="button is-link is-large">
              Start!
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

    <FlockScene />
  </Layout>
);

export default IndexPage;
