import Router from "next/router";
import React from "react";
import Layout from "../components/Layout";

class NewSessionForm extends React.Component {
  state = {
    name: ""
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = e => {
    const { name } = this.state;
    e.preventDefault();
    Router.push(`/s/${name}`);
  };

  render() {
    const { name } = this.state;

    return (
      <form onSubmit={this.handleSubmit}>
        <div className="field">
          <div className="control">
            <input
              name="name"
              onChange={this.handleChange}
              value={name}
              className="input is-medium"
              type="text"
              placeholder="Type session name and press Enter"
            />
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
