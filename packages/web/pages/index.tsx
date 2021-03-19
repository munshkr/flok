import Router from "next/router";
import React, { Component, ChangeEvent, FormEvent } from "react";
import Layout from "../components/Layout";
import uuid from "uuid/v4";
import Container from "../components/Container";
import TextInput from "../components/TextInput";
import Button from "../components/Button";
import { allTargets } from "flok-core"

class NewSessionForm extends Component<
  {},
  { user: string; targets: string; submitting: boolean }
  > {
  state = {
    user: "",
    targets: "",
    submitting: false,
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
    this.setState({ submitting: true });

    const session = btoa(uuid());
    const { targets } = this.state;
    const layout = targets
      .split(",")
      .map((s) => s.trim())
      .join(",");
    Router.push(`/s/${session}?layout=${layout}`);
  };

  render() {
    const { targets, submitting } = this.state;

    return (
      <form onSubmit={this.handleSubmit}>
        <TextInput
          name="user"
          value={targets}
          placeholder={`Enter targets separated by commas (e.g. tidal,foxdot,etc.)`}
          autoFocus
          onChange={this.handleChangeTargets}
          disabled={submitting}
        />
        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create session"}
        </Button>
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
        margin-bottom: 0.25em;
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

// The supported targets that can be entered in the form
const SupportedTargets = () => (
  <body>
    <h3>currently supported targets:</h3>
    <ul>
      {allTargets.sort().map(target => (<li key={target}>{target}</li>))}
    </ul>
    <style jsx>{`
      h3 {
        font-size: 1 em;
        color: #aaa;
      }
      li {
        font-size: 0.8 em;
        color: #aaa;
      }
    `}</style>
  </body>
);

const IndexPage = () => (
  <Layout>
    <Container>
      <Title />
      <NewSessionForm />
      <SupportedTargets />
    </Container>
  </Layout>
);

export default IndexPage;
