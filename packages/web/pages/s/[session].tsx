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
    username: null,
    hydraEnabled: true,
  };

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      username: props.username || "",
    };
  }

  handleChangeUser = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    this.setState({ username: target.value });
  };

  handleChangeHydraCheckbox = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    this.setState({ hydraEnabled: target.checked })
  }

  handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const { onSubmit } = this.props;

    let { username, hydraEnabled } = this.state;
    if (!username) username = "anonymous";

    onSubmit({ username, hydraEnabled });
  };

  render() {
    const { username, hydraEnabled } = this.state;

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
            <label className="checkbox">
              <input
                className="is-large"
                onChange={this.handleChangeHydraCheckbox}
                checked={hydraEnabled}
                type="checkbox"
              />
              Enable Hydra
            </label>
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

const EmptySession = ({ websocketsUrl, session, lastUsername, onSubmit }) => (
  <section className="section">
    <div className="container">
      <h1 className="title">flok</h1>
      <h3 className="subtitle">
        You are trying to join session with token: <code>{session}</code>.<br />
        Please enter your nickname.
      </h3>
      <p className="content">
        To connect a REPL, for example, <code>tidal</code>, run on a terminal:
        <br />
        <code>
          flok-repl -H {websocketsUrl} -s {session} -t tidal
        </code>
        <br />
        For more information, read{" "}
        <a
          target="_blank"
          href="https://github.com/munshkr/flok#connect-repls-to-flok"
        >
          here
        </a>
        .
      </p>
      <JoinSessionForm
        username={lastUsername}
        onSubmit={onSubmit}
      />
    </div>
  </section>
);

const LoadingSpinner = () => <h4>Loading...</h4>;

interface Props {
  host: string;
  session: string;
  layoutParam: string;
  disableHydraParam: string;
}

interface State {
  loading: boolean;
  lastUsername: string;
  hydraEnabled: boolean;
  username: string;
  websocketsUrl: string;
}

class SessionPage extends Component<Props, State> {
  state = {
    loading: true,
    lastUsername: null,
    hydraEnabled: true,
    username: null,
    websocketsUrl: null
  };

  static async getInitialProps({ req, query }: NextPageContext) {
    const host = req && req.headers && req.headers.host;
    return {
      host,
      session: query.session,
      layoutParam: query.layout,
    };
  }

  componentDidMount() {
    if (isDevelopment) {
      console.log("*** DEVELOPMENT MODE ***");
    }

    // Set Websockets URL
    const { host } = this.props;
    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    const websocketsUrl = `${protocol}//${host}`;
    this.setState({ websocketsUrl });

    this.fetchLastUserName();
  }

  fetchLastUserName() {
    const username = window.localStorage.getItem("lastUsername");
    if (username) {
      this.setState({ lastUsername: username, loading: false });
    } else {
      this.setState({ loading: false });
    }
  }

  handleJoinSubmit = ({ username, hydraEnabled }: { username: string, hydraEnabled: boolean }) => {
    window.localStorage.setItem("lastUsername", username);
    window.localStorage.setItem("hydraEnabled", hydraEnabled ? 'true' : 'false');

    this.setState({ username, hydraEnabled });
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
    const { host, session, layoutParam } = this.props;
    const {
      loading,
      username,
      hydraEnabled,
      lastUsername,
      websocketsUrl
    } = this.state;

    let layoutList = defaultLayoutList;
    if (layoutParam) {
      layoutList = layoutParam.split(",");
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
            hydraEnabled={hydraEnabled}
          />
        ) : (
              <EmptySession
                websocketsUrl={websocketsUrl}
                session={session}
                lastUsername={lastUsername}
                onSubmit={this.handleJoinSubmit}
              />
            )}
      </Layout>
    );
  }
}

export default SessionPage;
