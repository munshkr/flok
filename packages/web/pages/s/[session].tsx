import React, { Component, ChangeEvent, FormEvent, useState } from "react";
import Head from "next/head";
import getConfig from "next/config";
import { NextPageContext } from "next";
import hasWebgl from "../../lib/webgl-detector";
import css from "styled-jsx/css";

import Layout from "../../components/Layout";
import Container from "../../components/Container";
import Session from "../../components/Session";
import { IceServerType } from "../../lib/SessionClient";
import HydraWrapper from "../../lib/HydraWrapper";
import HydraCanvas from "../../components/HydraCanvas";
import HydraError from "../../components/HydraError";
import StrudelWrapper from "../../lib/StrudelWrapper";
import TextInput from "../../components/TextInput";
import Button from "../../components/Button";
import Checkbox from "../../components/Checkbox";
import { webTargets } from "flok-core";

const defaultLayoutList = ["tidal", "hydra"];

const { publicRuntimeConfig } = getConfig();
const {
  flokVersion,
  isDevelopment,
  iceStunUrl,
  iceTurnUrl,
  iceStunCredentials,
  iceTurnCredentials,
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
  onUsernameChange: Function;
  hydraVisible: boolean;
  hasWebGl: boolean;
}> {
  state = {
    hydraEnabled: true,
    audioStreamingEnabled: false,
  };

  handleChangeUser = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    const username = target.value;
    this.props.onUsernameChange(username);
  };

  handleChangeHydraCheckbox = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    this.setState({ hydraEnabled: target.checked });
  };

  handleChangeAudioStreamingCheckbox = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    this.setState({ audioStreamingEnabled: target.checked });
  };

  handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const { onSubmit } = this.props;

    let { username } = this.props;
    const { hydraEnabled, audioStreamingEnabled } = this.state;
    if (!username) username = "anonymous";

    onSubmit({ username, hydraEnabled, audioStreamingEnabled });
  };

  render() {
    const { username, hydraVisible, hasWebGl } = this.props;
    const { hydraEnabled, audioStreamingEnabled } = this.state;

    return (
      <form onSubmit={this.handleSubmit}>
        <TextInput
          name="user"
          onChange={this.handleChangeUser}
          value={username || ""}
          type="text"
          placeholder={"Type a nick name and press Enter"}
          autoFocus
        />
        {hydraVisible && (
          <Checkbox
            onChange={this.handleChangeHydraCheckbox}
            checked={hasWebGl && hydraEnabled}
            disabled={!hasWebGl}
          >
            Enable Hydra{" "}
            {!hasWebGl && (
              <span>(WebGL is disabled or not supported on this browser!)</span>
            )}
          </Checkbox>
        )}
        <Checkbox
          onChange={this.handleChangeAudioStreamingCheckbox}
          checked={audioStreamingEnabled}
        >
          Enable Audio Streaming (experimental!)
        </Checkbox>
        <Button type="submit">Join!</Button>
      </form>
    );
  }
}

const CopyButton = (props) => {
  const { className, styles } = css.resolve`
    button {
      font-size: 0.875rem;
    }
  `;

  return (
    <>
      <Button className={className} {...props} />
      {styles}
    </>
  );
};

const EmptySession = ({
  websocketsUrl,
  session,
  lastUsername,
  hasWebGl,
  hasHydraSlot,
  onSubmit,
  layout,
}) => {
  const [username, setUsername] = useState(lastUsername);
  const [copied, setCopied] = useState(false);

  // Pick the first target as example for flok-repl
  const isReplTarget = (target: string) => !webTargets.includes(target);
  const targetExample = layout.find((target) => isReplTarget(target));
  const replExample =
    `flok-repl -H ${websocketsUrl} ` +
    `-s ${session} ` +
    `-t ${targetExample}${username ? ` -N ${username}` : ""}`;

  const copyToClipboard = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
    navigator.clipboard.writeText(replExample);
  };

  return (
    <Container>
      <section className="section">
        <div className="container">
          <h1 className="title">
            flok <span>v{flokVersion} </span>
          </h1>
          <p>
            You are trying to join session with token: <code>{session}</code>.
          </p>
          <p>Please enter your nickname.</p>

          <JoinSessionForm
            hydraVisible={hasHydraSlot}
            hasWebGl={hasWebGl}
            username={username}
            onUsernameChange={(name) => setUsername(name)}
            onSubmit={onSubmit}
          />
          {targetExample && (
            <>
              <p>
                To connect a REPL, for example <code>{targetExample}</code>, run
                on a terminal:
              </p>
              <div className="example">
                <code>{replExample}</code>
                <div>
                  <CopyButton onClick={copyToClipboard}>
                    {copied ? "Copied!" : "Copy"}
                  </CopyButton>
                </div>
              </div>
              <p>
                For more information, read{" "}
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="https://github.com/munshkr/flok#connect-repls-to-flok"
                >
                  here
                </a>
                .
              </p>
            </>
          )}
        </div>
      </section>
      <style jsx>{`
        code {
          margin-bottom: 0.25rem;
          background-color: #333;
          color: #eee;
          font-family: monospace;
          padding: 0.35em 0.5em;
          border-radius: 3px;
        }
        .content {
          margin-bottom: 1rem;
        }
        h1 span {
          font-size: 0.5em;
        }
        .example {
          display: flex;
        }
        a {
          color: #2366d1;
        }
        a:hover {
          color: #276cda;
        }
        .example code {
          margin-right: 0.875rem;
        }
      `}</style>
    </Container>
  );
};

const LoadingSpinner = () => (
  <h1>
    Loading...
    <style jsx>{`
      h1 {
        color: #333;
        font-size: 4rem;
        position: absolute;
        top: 45%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
      }
    `}</style>
  </h1>
);

interface Props {
  host: string;
  session: string;
  layoutParam: string;
  readonly: boolean;
  noLocalEval: boolean;
  noHydra: boolean;
  backgroundOpacity: number;
}

interface State {
  loading: boolean;
  lastUsername: string;
  hasWebGl: boolean;
  hydraEnabled: boolean;
  hydraError: string;
  audioStreamingEnabled: boolean;
  username: string;
  websocketsUrl: string;
}

class SessionPage extends Component<Props, State> {
  hydraCanvas: React.RefObject<HTMLCanvasElement>;
  hydra: HydraWrapper;
  strudel: StrudelWrapper;

  state = {
    loading: true,
    lastUsername: null,
    hasWebGl: true,
    hydraEnabled: true,
    hydraError: "",
    audioStreamingEnabled: false,
    username: null,
    websocketsUrl: null,
  };

  static async getInitialProps({ req, query }: NextPageContext) {
    const host = req && req.headers && req.headers.host;

    const bgOpacity: number = +query.bgOpacity;
    const backgroundOpacity = bgOpacity >= 0 && bgOpacity <= 1 && bgOpacity;

    return {
      host,
      session: query.session,
      layoutParam: query.layout,
      readonly: query.readonly == "1",
      noLocalEval: query.noLocalEval == "1",
      noHydra: query.noHydra == "1",
      backgroundOpacity,
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      hasWebGl: hasWebgl(),
    };

    this.hydraCanvas = React.createRef();
    this.hydra = null;
  }

  async componentDidMount() {
    if (isDevelopment) {
      console.log("*** DEVELOPMENT MODE ***");
    }

    const { noHydra } = this.props;
    const { hasWebGl } = this.state;
    const layoutList = this.layoutTargets();

    // Initialize Hydra
    if (!noHydra && layoutList.includes("hydra")) {
      console.log("Initialize Hydra");
      if (hasWebGl) {
        this.hydra = new HydraWrapper(this.handleHydraError);
        await this.hydra.initialize(this.hydraCanvas.current);
        console.log("Hydra wrapper created");
      } else {
        console.warn("WebGL is disabled or not supported in this browser");
      }
    }

    // Initialize Strudel
    if (layoutList.includes("strudel")) {
      console.log("Initialize Strudel");
      this.strudel = new StrudelWrapper(this.handleHydraError);
      await this.strudel.initialize();
      console.log("Strude wrapper initialized");
    }

    // Set Websockets URL
    const { host } = this.props;
    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    const websocketsUrl = `${protocol}//${host || location.host}`;
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

  handleJoinSubmit = ({
    username,
    hydraEnabled,
    audioStreamingEnabled,
  }: {
    username: string;
    hydraEnabled: boolean;
    audioStreamingEnabled: boolean;
  }) => {
    window.localStorage.setItem("lastUsername", username);

    this.setState({ username, hydraEnabled, audioStreamingEnabled });
  };

  handleLocalEvaluation = async (target: string, body: string) => {
    switch (target) {
      case "hydra":
        if (this.props.noHydra) return;
        const { hydraEnabled, hasWebGl } = this.state;
        if (hasWebGl && hydraEnabled) {
          this.hydra.tryEval(body);
        }
        break;
      case "strudel":
        console.log(`Evaluate strudel code: ${body}`);
        await this.strudel.tryEval(body);
        break;
      default:
        console.error(`Unknown local target: ${target}`);
    }
  };

  handleHydraError = (error: string) => {
    this.setState({ hydraError: error });
  };

  generateLayoutFromList = (list: string[]) => {
    return {
      editors: list.map((target: string, i: number) => ({
        id: String(i),
        target,
      })),
    };
  };

  layoutTargets = (): string[] => {
    const { layoutParam } = this.props;
    const layoutList = layoutParam ? layoutParam.split(",") : defaultLayoutList;
    return layoutList;
  };

  render() {
    const { host, session, readonly, noLocalEval, noHydra, backgroundOpacity } =
      this.props;
    const {
      loading,
      username,
      hasWebGl,
      hydraError,
      audioStreamingEnabled,
      lastUsername,
      websocketsUrl,
    } = this.state;

    const layoutList = this.layoutTargets();
    const hasHydraSlot = !noHydra && layoutList.includes("hydra");
    const layout = this.generateLayoutFromList(layoutList);

    return (
      <Layout backgroundOpacity={backgroundOpacity}>
        <Head>
          <title>Flok</title>
        </Head>
        {loading ? (
          <LoadingSpinner />
        ) : username || readonly ? (
          <Session
            websocketsHost={host || location.host}
            sessionName={session}
            userName={username}
            extraIceServers={extraIceServers}
            layout={layout}
            audioStreamingEnabled={audioStreamingEnabled}
            onLocalEvaluation={this.handleLocalEvaluation}
            readonly={readonly}
            noLocalEval={noLocalEval}
          />
        ) : (
          <EmptySession
            websocketsUrl={websocketsUrl}
            session={session}
            lastUsername={lastUsername}
            onSubmit={this.handleJoinSubmit}
            hasHydraSlot={hasHydraSlot}
            hasWebGl={hasWebGl}
            layout={layoutList}
          />
        )}
        {hasWebgl && !noHydra && (
          <>
            <HydraCanvas ref={this.hydraCanvas} fullscreen />
            {hydraError && <HydraError>{hydraError}</HydraError>}
          </>
        )}
      </Layout>
    );
  }
}

export default SessionPage;
