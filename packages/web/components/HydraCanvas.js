import React from "react";
import PropTypes from "prop-types";

const GLOBAL_VARS_RE = /\b(o0|o1|o2|o3|s0|s1|s2|s3|time|a)\b/g;
const GLOBAL_FUNCS_RE = /\b(gradient|osc|shape|noise|solid|voronoi|src|render)\b\(/g;

const localizeHydraCode = code => {
  const replaceFunc = func => `H.${func}`;
  return code
    .replace(GLOBAL_FUNCS_RE, replaceFunc)
    .replace(GLOBAL_VARS_RE, replaceFunc);
};

class HydraCanvas extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null
    };
  }

  componentDidMount() {
    const { code, local } = this.props;
    const makeGlobal = !local;

    // eslint-disable-next-line global-require
    const Hydra = require("hydra-synth");

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

  componentDidUpdate(prevProps) {
    const { code } = this.props;

    if (!code) return;

    if (code !== prevProps.code) {
      this.tryEval(code);
    }
  }

  componentWillUnmount() {
    delete this.hydra;
  }

  tryEval(code) {
    const { local } = this.props;

    let evalCode = code;
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

    const className = fullscreen ? "fullscreen" : "";

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

HydraCanvas.propTypes = {
  code: PropTypes.string,
  fullscreen: PropTypes.bool,
  local: PropTypes.bool
};

HydraCanvas.defaultProps = {
  code: "",
  fullscreen: false,
  local: false
};

export default HydraCanvas;
