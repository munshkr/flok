import Router from "next/router";
import React, { Component, ChangeEvent, FormEvent } from "react";
import FlockScene from "../components/FlockScene";
import Layout from "../components/Layout";
import uuid from "uuid/v4";
import hasWebgl from "../lib/webgl-detector";
import TextInput from "../components/TextInput";
import Button from "../components/Button";

class NewSessionForm extends Component<{}, { user: string; targets: string }> {
  state = {
    user: "",
    targets: "",
  };

  handleChangeUser = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    this.setState({ user: target.value });
  };

  handleChangeTargets = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    this.setState({
      targets: target.value,
    });
  };

  handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const session = btoa(uuid());
    const { targets } = this.state;
    const layout = targets
      .split(",")
      .map((s) => s.trim())
      .join(",");
    Router.push(`/s/${session}?layout=${layout}`);
  };

  render() {
    const { targets } = this.state;

    return (
      <form onSubmit={this.handleSubmit}>
        <TextInput
          name="user"
          value={targets}
          placeholder={`Enter the list of targets the session will use, separated by commas (e.g. tidal,foxdot,hydra)`}
          autoFocus
          onChange={this.handleChangeTargets}
        />
        <Button type="submit">Create session</Button>
      </form>
    );
  }
}

const Title = () => (
  <header>
    <h1>flok</h1>
    <h2>collaborative live coding editor</h2>
    <style jsx>{`
      header {
        margin-bottom: 3rem;
      }
      h1 {
        font-size: 40px;
        font-weight: 400;
        color: #fff;
        margin-top: 0;
        margin-bottom: 0.125rem;
      }
      h2 {
        font-size: 1.17em;
        font-weight: 400;
        color: #eee;
        margin-top: 0;
      }
    `}</style>
  </header>
);

const IndexPage = () => (
  <Layout>
    <div>
      <Title />
      <NewSessionForm />
      {hasWebgl() && <FlockScene />}
    </div>
    <style jsx>{`
      div {
        flex-grow: 1;
        margin: 0 auto;
        width: auto;
        padding: 3rem 1.5rem;
      }

      @media screen and (min-width: 1216px) {
        div {
          max-width: 1152px;
        }
      }

      @media screen and (min-width: 1024px) {
        div {
          max-width: 960px;
        }
      }
    `}</style>
  </Layout>
);

export default IndexPage;
