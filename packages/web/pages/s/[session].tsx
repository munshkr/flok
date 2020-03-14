import React, { Component, ChangeEvent, FormEvent } from "react";
import Head from "next/head";
import getConfig from "next/config";
import { NextPageContext } from "next";

import Layout from "../../components/Layout";
import Session from "../../components/Session";
import { IceServerType } from "../../lib/SessionClient";

const defaultLayoutList = ["tidal", "hydra"];

const { publicRuntimeConfig } = getConfig();
const {
  isDevelopment,
  iceStunUrl,
  iceTurnUrl,
  iceStunCredentials,
  iceTurnCredentials
} = publicRuntimeConfig;

const parseIceServerFromEnvVars = (url: string, userPass?: string) => {
  if (!url) return;
  let server: IceServerType = { urls: url };
  if (userPass) {
    const [username, credential] = userPass.split(":");
    server = { ...server, username, credential };
  }
  return server;
};

const extraIceServers = (() => {
  let res = [];
  const stunUrl = parseIceServerFromEnvVars(iceStunUrl, iceStunCredentials);
  if (stunUrl) res.push(stunUrl);
  const turnUrl = parseIceServerFromEnvVars(iceTurnUrl, iceTurnCredentials);
  if (turnUrl) res.push(turnUrl);
  return res;
})();

class JoinSessionForm extends Component<{
  username: string;
  onSubmit: Function;
}> {
  state = {
    username: null
  };

  constructor(props) {
    super(props);

    this.state = {
      username: props.username || ""
    };
  }

  handleChangeUser = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    this.setState({ username: target.value });
  };

  handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const { onSubmit } = this.props;

    let { username } = this.state;
    if (!username) username = "anonymous";

    onSubmit(username);
  };

  render() {
    const { username } = this.state;

    return (
      <form onSubmit={this.handleSubmit}>
        <div className="field">
          <div className="control">
            <input
              name="user"
              onChange={this.handleChangeUser}
              value={username}
              className="input is-large"
              type="text"
              placeholder={"Type a nick name and press Enter"}
              autoFocus
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

const EmptySession = ({ session, lastUsername, onSubmit }) => (
  <section className="section">
    <div className="container">
      <h1 className="title">flok</h1>
      <h3 className="subtitle">
        You are trying to join session with token: <code>{session}</code>.<br />
        Please enter your nickname.
      </h3>
      <JoinSessionForm username={lastUsername} onSubmit={onSubmit} />
    </div>
  </section>
);

const LoadingSpinner = () => <h4>Loading...</h4>;

interface Props {
  host: string;
  session: string;
  layoutString: string;
}

interface State {
  loading: boolean;
  lastUsername: string;
  username: string;
}

class SessionPage extends Component<Props, State> {
  state = {
    loading: true,
    lastUsername: null,
    username: null
  };

  static async getInitialProps({ req, query }: NextPageContext) {
    const host = req && req.headers && req.headers.host;
    return { host, session: query.session, layoutString: query.layout };
  }

  componentDidMount() {
    if (isDevelopment) {
      console.log("*** DEVELOPMENT MODE ***");
    }
    this.fetchLastUsername();
  }

  fetchLastUsername() {
    // Get username from local storage
    const username = window.localStorage.getItem("lastUsername");
    if (username) {
      this.setState({ lastUsername: username, loading: false });
    } else {
      this.setState({ loading: false });
    }
  }

  handleUsernameSubmit = (username: string) => {
    window.localStorage.setItem("lastUsername", username);
    this.setState({ username });
  };

  generateLayoutFromList = (list: string[]) => {
    return {
      editors: list.map((target: string, i: number) => ({
        id: String(i),
        target
      }))
    };
  };

  render() {
    const { host, session, layoutString } = this.props;
    const { loading, username, lastUsername } = this.state;

    let layoutList = defaultLayoutList;
    if (layoutString) {
      const layoutListFromString = layoutString.split(",");
      layoutList = layoutListFromString;
    }
    const layout = this.generateLayoutFromList(layoutList);

    return (
      <Layout>
        <Head>
          <title>Flok</title>
        </Head>
        {loading ? (
          <LoadingSpinner />
        ) : username ? (
          <Session
            websocketsHost={host}
            sessionName={session}
            userName={username}
            extraIceServers={extraIceServers}
            layout={layout}
          />
        ) : (
          <EmptySession
            session={session}
            lastUsername={lastUsername}
            onSubmit={this.handleUsernameSubmit}
          />
        )}
      </Layout>
    );
  }
}

export default SessionPage;
