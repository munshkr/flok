import Router from "next/router";
import React, { Component, ChangeEvent, FormEvent } from "react";
import FlockScene from "../components/FlockScene";
import Layout from "../components/Layout";
import uuid from "uuid/v4";

class NewSessionForm extends Component<{}, { user: string }> {
  state = {
    user: ""
  };

  handleChangeUser = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    this.setState({ user: target.value });
  };

  handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const session = btoa(uuid());
    Router.push(`/s/${session}`);
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
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
