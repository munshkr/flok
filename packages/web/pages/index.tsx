import Router from "next/router";
import React, { Component, ChangeEvent, FormEvent } from "react";
import FlockScene from "../components/FlockScene";
import Layout from "../components/Layout";
import uuid from "uuid/v4";
import hasWebgl from "../lib/webgl-detector";

const Button = props => (<>
  <button {...props} />
  <style jsx>{`
    button {
      font-size: 1.25em;
      padding: 0.5em 0.75em;
    }
  `}</style>
</>);

const TextInput = props => (<>
  <input type="text" {...props} />
  <style jsx>{`
    input {
      font-size: 1.25em;
      padding: 0.5em 0.75em;
      width: 40em;
    }
  `}</style>
</>)

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
          placeholder={
            `Enter the list of targets the session will use, separated by commas (e.g. tidal,foxdot,hydra)`
          }
          autoFocus
          onChange={this.handleChangeTargets}
        />
        <Button type="submit">
          Create session
        </Button>
      </form>
    );
  }
}

const Title = () => (<>
  <h1>flok</h1>
  <h2>collaborative live coding editor</h2>
  <style jsx>{`
    h1 {
      font-size: 2rem;
      font-weight: 600;
      color: #cccccc;
    }
    h2 {
      font-size: 1.25rem;
      font-weight: 400;
      color: #bbbbbb;
    }
  `}</style>
</>);

const IndexPage = () => (
  <Layout>
    <div>
      <Title />
      <NewSessionForm />
      {hasWebgl() && <FlockScene />}
    </div>
    <style jsx>{`
      div {
        margin: 2em;
      }
    `}</style>
  </Layout>
);

export default IndexPage;
