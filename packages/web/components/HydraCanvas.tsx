import React, { Component } from "react";

const GLOBAL_VARS_RE: RegExp = /\b(o0|o1|o2|o3|s0|s1|s2|s3|time|a)\b/g;
const GLOBAL_FUNCS_RE: RegExp = /\b(gradient|osc|shape|noise|solid|voronoi|src|render)\b\(/g;

const localizeHydraCode = (code: string): string => {
  const replaceFunc = (func: string): string => `H.${func}`;
  return code
    .replace(GLOBAL_FUNCS_RE, replaceFunc)
    .replace(GLOBAL_VARS_RE, replaceFunc);
};

type Props = {
  code?: string;
  fullscreen?: boolean;
  local?: boolean;
};

type State = {
  error: string;
};

class HydraCanvas extends Component<Props, State> {
  state: State = {
    error: null
  };
  hydra: any;
  canvas: any;

  static defaultProps = {
    code: "",
    fullscreen: false,
    local: false
  };

  componentDidMount() {
    const { code, local } = this.props;
    const makeGlobal: boolean = !local;

    // eslint-disable-next-line global-require
    const Hydra = require("hydra-synth");

    // For some reason on Android mobile, Chrome has this object undefined:
    if (!window.navigator.mediaDevices) return;

    this.hydra = new Hydra({ canvas: this.canvas, makeGlobal });

    if (local) {
      // Define functions for outputs and sources
      for (let i = 0; i < 4; i++) {
        this.hydra[`o${i}`] = this.hydra.o[i];
        this.hydra[`s${i}`] = this.hydra.s[i];
      }

      // Workaround: This function expects a window.src() function to be defined. See
      // https://github.com/ojack/hydra-synth/blob/7eb0dde5175e2a6ce417e9f16d7e88fe1d750133/src/GeneratorFactory.js#L92
      window.src = this.hydra.src;
    }

    this.tryEval(code);
  }

  componentDidUpdate(prevProps: Props) {
    const { code } = this.props;

    if (!code) return;

    if (code !== prevProps.code) {
      this.tryEval(code);
    }
  }

  componentWillUnmount() {
    delete this.hydra;
  }

  tryEval(code: string) {
    const { local } = this.props;

    let evalCode: string = code;
    if (local) evalCode = localizeHydraCode(code);

    console.debug(evalCode);
    window.H = this.hydra;
    try {
      // eslint-disable-next-line no-eval
      eval(evalCode);
      this.setState({ error: null });
    } catch (error) {
      this.setState({ error: String(error) });
      console.error(`Failed to execute Hydra code: ${error}`);
    }
  }

  render() {
    const { fullscreen } = this.props;
    const { error } = this.state;

    const className: string = fullscreen ? "fullscreen" : "";

    return (
      <div>
        <canvas
          ref={e => {
            this.canvas = e;
          }}
          className={className}
        />
        {error && <span className="error">{error}</span>}
        <style jsx>
          {`
            canvas {
              position: absolute;
              top: 0;
              left: 0;
              z-index: -1;
            }

            .fullscreen {
              height: 100vh;
              width: 100vw;
              display: block;
              overflow: hidden;
            }
            .error {
              font-family: monospace;
              position: absolute;
              bottom: 1em;
              left: 1em;
              background-color: #ff0000;
              color: #ffffff;
              padding: 2px 5px;
            }
          `}
        </style>
      </div>
    );
  }
}

export default HydraCanvas;
