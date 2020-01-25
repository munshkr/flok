import Router from "next/router";
import React from "react";
import Layout from "../components/Layout";

class NewSessionForm extends React.Component {
  state = {
    session: "",
    user: ""
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = e => {
    let { session, user } = this.state;

    e.preventDefault();

    // Default values
    if (!session) session = "default";
    if (!user) user = "anonymous";

    Router.push(`/s/${session}?user=${user}`);
  };

  render() {
    const { session, user } = this.state;

    return (
      <form onSubmit={this.handleSubmit}>
        <div className="field">
          <div className="control">
            <input
              name="session"
              onChange={this.handleChange}
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
              onChange={this.handleChange}
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
